import { Request, Response } from 'express';
import pool from '../db/pool';

// ── GET CREATOR WALLET & EARNINGS BREAKDOWN ────────────────────────────────────
export async function getCreatorWallet(req: Request, res: Response) {
  try {
    const creatorId = (req as any).user.id;

    // 1. Get or create wallet for creator
    let walletRes = await pool.query(
      `SELECT * FROM creator_wallets WHERE creator_id = $1`,
      [creatorId]
    );

    if (walletRes.rows.length === 0) {
      walletRes = await pool.query(
        `INSERT INTO creator_wallets (
           creator_id, available_balance, pending_balance, total_earned, total_withdrawn, currency
         ) VALUES ($1, 0.00, 0.00, 0.00, 0.00, 'NGN')
         RETURNING *`,
        [creatorId]
      );
    }

    const wallet = walletRes.rows[0];

    // 2. Earnings ledger breakdown
    const ledgerRes = await pool.query(
      `SELECT id, source_type, source_id, gross_amount, platform_fee, net_amount, status, description, created_at
       FROM creator_earnings_ledger
       WHERE creator_id = $1
       ORDER BY created_at DESC
       LIMIT 30`,
      [creatorId]
    );

    // 3. Category aggregates
    const summaryRes = await pool.query(
      `SELECT 
         source_type,
         SUM(gross_amount) AS total_gross,
         SUM(net_amount) AS total_net,
         COUNT(*) AS transaction_count
       FROM creator_earnings_ledger
       WHERE creator_id = $1
       GROUP BY source_type`,
      [creatorId]
    );

    // 4. Recent payout requests
    const payoutsRes = await pool.query(
      `SELECT id, amount, bank_name, account_number, account_name, status, failure_reason, created_at, processed_at
       FROM payout_requests
       WHERE creator_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [creatorId]
    );

    return res.json({
      wallet: {
        id: wallet.id,
        available_balance: parseFloat(wallet.available_balance || 0),
        pending_balance: parseFloat(wallet.pending_balance || 0),
        total_earned: parseFloat(wallet.total_earned || 0),
        total_withdrawn: parseFloat(wallet.total_withdrawn || 0),
        currency: wallet.currency || 'NGN',
        bank_name: wallet.bank_name,
        bank_code: wallet.bank_code,
        account_number: wallet.account_number,
        account_name: wallet.account_name,
        updated_at: wallet.updated_at
      },
      earnings_summary: summaryRes.rows,
      recent_transactions: ledgerRes.rows,
      recent_payouts: payoutsRes.rows
    });
  } catch (error: any) {
    console.error('getCreatorWallet error:', error);
    return res.status(500).json({ error: 'Failed to fetch creator wallet' });
  }
}

// ── UPDATE BANK ACCOUNT DETAILS ───────────────────────────────────────────────
export async function updateBankDetails(req: Request, res: Response) {
  try {
    const creatorId = (req as any).user.id;
    const { bank_name, bank_code, account_number, account_name } = req.body;

    if (!account_number || !bank_name || !account_name) {
      return res.status(400).json({ error: 'Bank name, account number and account name are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO creator_wallets (
         creator_id, bank_name, bank_code, account_number, account_name, updated_at
       ) VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (creator_id) 
       DO UPDATE SET 
         bank_name = EXCLUDED.bank_name,
         bank_code = EXCLUDED.bank_code,
         account_number = EXCLUDED.account_number,
         account_name = EXCLUDED.account_name,
         updated_at = NOW()
       RETURNING *`,
      [creatorId, bank_name, bank_code || null, account_number, account_name]
    );

    return res.json({
      message: 'Bank details updated successfully',
      wallet: rows[0]
    });
  } catch (error: any) {
    console.error('updateBankDetails error:', error);
    return res.status(500).json({ error: 'Failed to update bank details' });
  }
}

// ── SEND TIP TO CREATOR (FAN ACTION) ──────────────────────────────────────────
export async function sendTip(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const fanId = (req as any).user.id;
    const { creator_id, content_id, amount, message, payment_reference } = req.body;

    if (!creator_id) {
      return res.status(400).json({ error: 'creator_id is required' });
    }

    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      return res.status(400).json({ error: 'A valid tip amount is required' });
    }

    // Split: 85% creator, 15% platform fee
    const creatorShare = Number((tipAmount * 0.85).toFixed(2));
    const platformFee = Number((tipAmount * 0.15).toFixed(2));

    await client.query('BEGIN');

    // 1. Record tip
    const tipRes = await client.query(
      `INSERT INTO creator_tips (
         fan_id, creator_id, content_id, amount, creator_share, platform_fee, message, payment_reference, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')
       RETURNING *`,
      [fanId, creator_id, content_id || null, tipAmount, creatorShare, platformFee, message || null, payment_reference || `TIP-${Date.now()}`]
    );

    const tipRecord = tipRes.rows[0];

    // 2. Record in earnings ledger
    await client.query(
      `INSERT INTO creator_earnings_ledger (
         creator_id, source_type, source_id, gross_amount, platform_fee, net_amount, status, description
       ) VALUES ($1, 'tip', $2, $3, $4, $5, 'available', $6)`,
      [
        creator_id,
        tipRecord.id,
        tipAmount,
        platformFee,
        creatorShare,
        `Fan tip received: ₦${tipAmount.toLocaleString()}${message ? ` - "${message}"` : ''}`
      ]
    );

    // 3. Update creator's wallet
    await client.query(
      `INSERT INTO creator_wallets (
         creator_id, available_balance, total_earned, updated_at
       ) VALUES ($1, $2, $2, NOW())
       ON CONFLICT (creator_id)
       DO UPDATE SET
         available_balance = creator_wallets.available_balance + $2,
         total_earned = creator_wallets.total_earned + $2,
         updated_at = NOW()`,
      [creator_id, creatorShare]
    );

    // 4. Notify creator
    const fanUserRes = await client.query('SELECT name FROM users WHERE id = $1', [fanId]);
    const fanName = fanUserRes.rows[0]?.name || 'A supporter';

    await client.query(
      `INSERT INTO notifications (
         user_id, title, message, type, is_read, created_at
       ) VALUES ($1, $2, $3, 'tip', false, NOW())`,
      [
        creator_id,
        'You received a tip!',
        `${fanName} just tipped you ₦${tipAmount.toLocaleString()}${message ? ` with message: "${message}"` : ''}`
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Tip sent successfully',
      tip: tipRecord,
      creatorShare,
      platformFee
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('sendTip error:', error);
    return res.status(500).json({ error: 'Failed to process tip' });
  } finally {
    client.release();
  }
}

// ── REQUEST PAYOUT (WITHDRAWAL) ───────────────────────────────────────────────
export async function requestPayout(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    const creatorId = (req as any).user.id;
    const { amount } = req.body;

    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      return res.status(400).json({ error: 'A valid payout amount is required' });
    }

    if (payoutAmount < 1000) {
      return res.status(400).json({ error: 'Minimum payout amount is ₦1,000' });
    }

    await client.query('BEGIN');

    // 1. Fetch wallet
    const walletRes = await client.query(
      `SELECT * FROM creator_wallets WHERE creator_id = $1 FOR UPDATE`,
      [creatorId]
    );

    if (walletRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Creator wallet not found. Please set up your bank account first.' });
    }

    const wallet = walletRes.rows[0];

    if (!wallet.account_number || !wallet.bank_name) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Please update your bank account details before requesting a payout.' });
    }

    const available = parseFloat(wallet.available_balance || 0);
    if (available < payoutAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Insufficient balance. Available: ₦${available.toLocaleString()}, Requested: ₦${payoutAmount.toLocaleString()}`
      });
    }

    // 2. Deduct from available balance, add to pending balance
    await client.query(
      `UPDATE creator_wallets
       SET available_balance = available_balance - $1,
           pending_balance = pending_balance + $1,
           updated_at = NOW()
       WHERE creator_id = $2`,
      [payoutAmount, creatorId]
    );

    // 3. Create payout request record
    const payoutRes = await client.query(
      `INSERT INTO payout_requests (
         creator_id, amount, bank_name, account_number, account_name, status, created_at
       ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
       RETURNING *`,
      [creatorId, payoutAmount, wallet.bank_name, wallet.account_number, wallet.account_name]
    );

    // 4. Notify creator
    await client.query(
      `INSERT INTO notifications (
         user_id, title, message, type, is_read, created_at
       ) VALUES ($1, $2, $3, 'payout', false, NOW())`,
      [
        creatorId,
        'Payout Request Submitted',
        `Your payout request for ₦${payoutAmount.toLocaleString()} to ${wallet.bank_name} (${wallet.account_number}) is being processed.`
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Payout request submitted successfully',
      payout: payoutRes.rows[0],
      new_available_balance: available - payoutAmount
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('requestPayout error:', error);
    return res.status(500).json({ error: 'Failed to process payout request' });
  } finally {
    client.release();
  }
}

// ── GET PAYOUT HISTORY ────────────────────────────────────────────────────────
export async function getPayoutHistory(req: Request, res: Response) {
  try {
    const creatorId = (req as any).user.id;

    const { rows } = await pool.query(
      `SELECT * FROM payout_requests 
       WHERE creator_id = $1 
       ORDER BY created_at DESC`,
      [creatorId]
    );

    return res.json({ payouts: rows });
  } catch (error: any) {
    console.error('getPayoutHistory error:', error);
    return res.status(500).json({ error: 'Failed to fetch payout history' });
  }
}
