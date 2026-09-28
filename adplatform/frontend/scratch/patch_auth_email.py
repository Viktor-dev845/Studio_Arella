import os
import re

path = r'..\backend\src\controllers\authController.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """    // Create 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await pool.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, code]
    );

    const jwtToken = await issueSessionToken({ id: user.id, email: user.email, role: user.role, name: user.name }, req);
    res.status(201).json({
      token: jwtToken,
      user: { ...user, email_verified: false },
      message: 'Account created! Please choose a verification method.',
    });"""

new_block = """    // Create 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await pool.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, code]
    );

    try {
      await sendVerificationEmail(email, user.first_name, code);
    } catch (emailErr) {
      console.error('Failed to send initial verification email:', emailErr);
    }

    const jwtToken = await issueSessionToken({ id: user.id, email: user.email, role: user.role, name: user.name }, req);
    res.status(201).json({
      token: jwtToken,
      user: { ...user, email_verified: false },
      message: 'Account created! Verification code sent to your email.',
    });"""

content = content.replace(old_block, new_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
