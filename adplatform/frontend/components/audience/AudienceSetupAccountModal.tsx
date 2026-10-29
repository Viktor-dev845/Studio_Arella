'use client';

import { useState } from 'react';
import { ArrowLeft, X, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';

interface AudienceSetupAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onFinish?: (accountDetails: {
    bank: string;
    accountName: string;
    accountNumber: string;
    alwaysUse: boolean;
  }) => void;
}

const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Bank',
  'OPay',
  'Moniepoint MFB',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Fidelity Bank',
  'Wema Bank / ALAT',
  'Union Bank of Nigeria',
  'Ecobank Nigeria',
  'Polaris Bank',
];

export default function AudienceSetupAccountModal({
  isOpen,
  onClose,
  onBack,
  onFinish,
}: AudienceSetupAccountModalProps) {
  const [selectedBank, setSelectedBank] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [alwaysUse, setAlwaysUse] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const { toast } = useToast();

  if (!isOpen) return null;

  const filteredBanks = NIGERIAN_BANKS.filter((b) =>
    b.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const details = {
      bank: selectedBank || 'Guaranty Trust Bank (GTBank)',
      accountName: accountName || 'Udo Emmanuel',
      accountNumber: accountNumber || '0123456789',
      alwaysUse,
    };

    try {
      if (user?.id) {
        await fetch('/api/creator/wallet/bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            bank_name: details.bank,
            account_number: details.accountNumber,
            account_name: details.accountName,
          }),
        });
      }
      toast('Escrow bank account linked successfully!', 'success');
      if (onFinish) onFinish(details);
      onClose();
    } catch {
      toast('Could not save bank details. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#A2A1A8]/20 backdrop-blur-[10px] font-quicksand animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ─── Modal Container (Frame 2121459663: 625px x 733px, radius 32px) ─── */}
      <div 
        className="w-full max-w-[625px] h-[733px] max-h-[96vh] bg-white rounded-[32px] pt-[32px] px-6 sm:px-[50px] pb-[40px] relative flex flex-col items-center shadow-[0px_20px_60px_rgba(0,0,0,0.15)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Bar: Back Arrow on left, Title center, Close X on right ─── */}
        <div className="w-full flex items-center justify-between relative h-[30px] shrink-0">
          <button
            type="button"
            onClick={onBack || onClose}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black cursor-pointer"
            title="Go back"
          >
            <ArrowLeft size={24} strokeWidth={2.5} className="text-black" />
          </button>

          <h2 className="text-[20px] font-medium text-[#101828] text-center tracking-[-0.01em] leading-[30px] font-quicksand m-0">
            Set up account
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-[#344053] cursor-pointer"
            title="Close modal"
          >
            <X size={24} strokeWidth={2} className="text-[#344053]" />
          </button>
        </div>

        {/* ─── Subtitle / Description Text (Centered, Bold) ─── */}
        <div className="w-full max-w-[390px] text-center mt-[36px] px-2">
          <h3 className="text-[17px] sm:text-[18px] font-bold text-[#101828] leading-[26px] font-quicksand m-0">
            To finish setting up your event,<br />
            leave your bank details where<br />
            your money goes into from our<br />
            escrow channel
          </h3>
        </div>

        {/* ─── Bank Form (max-w-[440px]) ─── */}
        <form onSubmit={handleSubmit} className="w-full max-w-[440px] flex flex-col gap-5 mt-[36px]">
          {/* 1. Select Bank Dropdown */}
          <div className="relative w-full">
            <div
              onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
              className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.25)] rounded-[12px] flex items-center justify-between cursor-pointer select-none focus-within:border-[#D4AF37] transition-colors"
            >
              <span className={`text-[15px] font-light font-quicksand ${selectedBank ? 'text-[#101828]' : 'text-[rgba(162,161,168,0.8)]'}`}>
                {selectedBank || '--- Select bank ---'}
              </span>
              <ChevronDown size={20} strokeWidth={2} className="text-[#101828]" />
            </div>

            {/* Bank Options Menu */}
            {isBankDropdownOpen && (
              <div 
                className="absolute left-0 right-0 top-[62px] z-20 bg-white rounded-[12px] p-2 shadow-[-4.75px_20px_30px_rgba(184,184,184,0.3)] border border-gray-100 max-h-[220px] overflow-y-auto flex flex-col gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Search bank name..."
                  className="w-full h-[40px] px-3 mb-1 text-[13px] border border-gray-200 rounded-[8px] outline-none focus:border-[#D4AF37]"
                />
                {filteredBanks.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => {
                      setSelectedBank(bank);
                      setIsBankDropdownOpen(false);
                      setBankSearch('');
                    }}
                    className={`w-full text-left px-3 py-2 text-[14px] rounded-[6px] transition-colors cursor-pointer ${
                      selectedBank === bank 
                        ? 'bg-[#FFFBEE] font-medium text-black' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Enter account name */}
          <div className="w-full">
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter account name"
              className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.25)] rounded-[12px] text-[15px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-quicksand"
            />
          </div>

          {/* 3. Enter account number */}
          <div className="w-full">
            <input
              type="text"
              required
              maxLength={10}
              value={accountNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setAccountNumber(val);
              }}
              placeholder="Enter account number"
              className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.25)] rounded-[12px] text-[15px] font-light text-[#101828] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-quicksand"
            />
          </div>

          {/* 4. Checkbox: Always use this bank account */}
          <div 
            onClick={() => setAlwaysUse(!alwaysUse)}
            className="flex items-center gap-3 mt-1 cursor-pointer select-none"
          >
            <div 
              className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-colors ${
                alwaysUse 
                  ? 'bg-[#D4AF37] text-white' 
                  : 'border border-[rgba(162,161,168,0.4)] bg-white'
              }`}
            >
              {alwaysUse && <Check size={14} strokeWidth={3} className="text-white" />}
            </div>
            <span className="text-[14px] text-[#101828] font-normal font-quicksand">
              Always use this bank account
            </span>
          </div>

          {/* 5. Finish creating event button */}
          <div className="w-full mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[54px] bg-[#D4AF37] hover:bg-[#c49f2e] text-[#101828] font-medium text-[16px] rounded-[10px] flex items-center justify-center transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-75 font-quicksand"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Finish creating event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
