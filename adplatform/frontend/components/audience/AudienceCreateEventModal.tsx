'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, X, ChevronDown, Calendar, Upload } from 'lucide-react';

interface AudienceCreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (event: any) => void;
}

export default function AudienceCreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
}: AudienceCreateEventModalProps) {
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [entryMode, setEntryMode] = useState('');
  const [subscriptionFee, setSubscriptionFee] = useState('');
  const [isEntryDropdownOpen, setIsEntryDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newEvent = {
      id: `live-${Date.now()}`,
      title: eventTitle || 'User experience (UX)',
      description,
      entryMode: entryMode || 'Free entry',
      subscriptionFee: entryMode === 'Free entry' ? '0' : subscriptionFee,
      startDate,
      endDate,
      filesCount: uploadedFiles.length,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      if (onEventCreated) onEventCreated(newEvent);
      onClose();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#A2A1A8]/20 backdrop-blur-[10px] font-['DM_Sans',sans-serif] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ─── Modal Container (Filter Popup: 1026px x 980px, radius 20px) ─── */}
      <div 
        className="w-full max-w-[1026px] max-h-[96vh] bg-white rounded-[20px] pt-10 sm:pt-[60px] px-6 sm:px-[65px] pb-10 sm:pb-[50px] relative flex flex-col shadow-[0px_20px_60px_rgba(0,0,0,0.15)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Bar: Back Arrow on left, Title center, Close X on right (top: 69px) ─── */}
        <div className="w-full flex items-center justify-between relative h-[30px] shrink-0 mb-6 sm:mb-[42px]">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-black cursor-pointer"
            title="Go back"
          >
            <ArrowLeft size={24} strokeWidth={2.5} className="text-black" />
          </button>

          <h2 className="text-[20px] font-semibold text-[#16151C] text-center tracking-[-0.01em] leading-[30px] font-['DM_Sans',sans-serif] m-0">
            Create An Event
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

        {/* ─── Form Container (Frame 2121459579: 850px wide, centered) ─── */}
        <form onSubmit={handleSubmit} className="w-full max-w-[850px] mx-auto flex flex-col">
          <div className="w-full flex flex-col gap-[24px]">
            {/* 1. Event title (850px x 56px, border 1px solid rgba(162,161,168,0.2), radius 10px) */}
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event title"
              className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#16151C] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-['DM_Sans',sans-serif]"
            />

            {/* 2. Describe your event (850px x 131px, border 1px solid rgba(162,161,168,0.2), radius 10px) */}
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event"
              className="w-full h-[131px] p-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#16151C] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors resize-none font-['DM_Sans',sans-serif]"
            />

            {/* 3. Entry mode dropdown (850px x 56px, border 1px solid rgba(162,161,168,0.2), radius 10px) */}
            <div className="relative w-full">
              <div
                onClick={() => setIsEntryDropdownOpen(!isEntryDropdownOpen)}
                className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] flex items-center justify-between cursor-pointer select-none focus-within:border-[#D4AF37] transition-colors"
              >
                <span className={`text-[17px] font-light font-['DM_Sans',sans-serif] ${entryMode ? 'text-[#16151C]' : 'text-[rgba(162,161,168,0.8)]'}`}>
                  {entryMode || 'Entry mode'}
                </span>
                <ChevronDown size={20} strokeWidth={2} className="text-[#16151C]" />
              </div>

              {/* Entry Mode Popup (Frame 2121459585: 200px x 101px, radius 10px, shadow) */}
              {isEntryDropdownOpen && (
                <div 
                  className="absolute right-0 top-[62px] z-20 w-[200px] bg-white rounded-[10px] p-3 shadow-[-4.75px_30px_30px_rgba(184,184,184,0.25)] border border-gray-100 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col gap-2.5 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEntryMode('Free entry');
                        setIsEntryDropdownOpen(false);
                      }}
                      className={`text-[15px] font-normal font-['Karla',sans-serif] text-left transition-colors cursor-pointer bg-transparent border-none p-0 ${
                        entryMode === 'Free entry' ? 'font-medium text-black' : 'text-gray-800 hover:text-black'
                      }`}
                    >
                      Free entry
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEntryMode('Subscription');
                        setIsEntryDropdownOpen(false);
                      }}
                      className={`text-[15px] font-normal font-['Karla',sans-serif] text-left transition-colors cursor-pointer bg-transparent border-none p-0 ${
                        entryMode === 'Subscription' ? 'font-medium text-black' : 'text-gray-800 hover:text-black'
                      }`}
                    >
                      Subscription
                    </button>
                  </div>

                  {/* Gold bar indicator */}
                  <div className="w-[2px] h-[55px] bg-[rgba(212,175,55,0.12)] rounded-full relative ml-2">
                    <div 
                      className="w-[2px] h-[16px] bg-[#D4AF37] rounded-full transition-all"
                      style={{
                        marginTop: entryMode === 'Subscription' ? '28px' : '4px',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Subscription fee (Input: 850px x 56px, border 1px solid rgba(162,161,168,0.2), radius 10px) */}
            {entryMode !== 'Free entry' && (
              <div className="w-full h-[56px] relative animate-in fade-in duration-150">
                <input
                  type="text"
                  value={subscriptionFee}
                  onChange={(e) => setSubscriptionFee(e.target.value)}
                  placeholder="Subscription fee (NGN) e.g 500,000"
                  className="w-full h-[56px] px-4 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#16151C] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-['DM_Sans',sans-serif]"
                />
              </div>
            )}

            {/* 5. Dates Row (Frame 1000001003: 850px x 56px with 20px gap) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Start Date */}
              <div className="relative w-full h-[56px]">
                <input
                  type="text"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start date (dd/mm/yyyy)"
                  className="w-full h-[56px] pl-4 pr-12 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#16151C] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-['DM_Sans',sans-serif]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#16151C]">
                  <Calendar size={20} strokeWidth={1.8} />
                </div>
              </div>

              {/* End Date */}
              <div className="relative w-full h-[56px]">
                <input
                  type="text"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End date (dd/mm/yyyy)"
                  className="w-full h-[56px] pl-4 pr-12 bg-white border border-[rgba(162,161,168,0.2)] rounded-[10px] text-[17px] font-light text-[#16151C] placeholder:text-[rgba(162,161,168,0.8)] placeholder:font-light outline-none focus:border-[#D4AF37] transition-colors font-['DM_Sans',sans-serif]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#16151C]">
                  <Calendar size={20} strokeWidth={1.8} />
                </div>
              </div>
            </div>

            {/* 6. Upload event cover materials (width: 510px, height: 173px) */}
            <div className="w-full max-w-[510px] flex flex-col gap-3">
              <label className="text-[16px] font-light text-[#16151C] leading-[24px] font-['DM_Sans',sans-serif] m-0">
                Upload event cover materials (You can upload multiple files at once)
              </label>

              {/* Dashed Dropzone (Frame 427319067: 510px x 133px, border 1px dashed #D4AF37, radius 10px) */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full h-[133px] border border-dashed border-[#D4AF37] rounded-[10px] flex flex-col items-center justify-center p-4 gap-2 bg-[#FFFAF0]/20 hover:bg-[#FFFAF0]/50 transition-colors cursor-pointer select-none"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFilesSelected}
                  className="hidden"
                />

                {/* Upload Button: 40px x 40px, background #D4AF37, radius 10px */}
                <div className="w-[40px] h-[40px] bg-[#D4AF37] rounded-[10px] flex items-center justify-center shadow-2xs">
                  <Upload size={20} className="text-white" strokeWidth={2.2} />
                </div>

                <div className="flex flex-col items-center text-center">
                  <p className="text-[14px] font-light text-[#16151C] leading-[22px] font-['DM_Sans',sans-serif] m-0">
                    Drag & Drop or <span className="text-[#15411F] font-normal underline">choose file</span> to upload
                  </p>
                  <p className="text-[11px] font-light text-[#A2A1A8] leading-[16px] font-['DM_Sans',sans-serif] m-0">
                    Supported formats : jpeg, png, pf
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <span className="text-[11px] font-medium text-[#15411F] mt-0.5">
                    {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ─── 7. Action Buttons: Cancel & Create Event (Frame 1000001001) ─── */}
          <div className="w-full flex items-center justify-end gap-5 mt-6 sm:mt-8">
            {/* Cancel Button: 91px x 40px, border 1px solid rgba(162,161,168,0.2), radius 10px */}
            <button
              type="button"
              onClick={onClose}
              className="w-[91px] h-[40px] border border-[rgba(162,161,168,0.2)] hover:border-black rounded-[10px] text-[16px] font-light text-[#16151C] font-['Lexend',sans-serif] flex items-center justify-center transition-colors cursor-pointer bg-transparent"
            >
              Cancel
            </button>

            {/* Create Event Button: 135px x 40px, background #D4AF37, radius 6px */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-[135px] h-[40px] bg-[#D4AF37] hover:bg-[#c29f31] text-black/80 hover:text-black rounded-[6px] text-[14px] font-normal capitalize leading-[20px] font-['Jost',sans-serif] flex items-center justify-center transition-all shadow-2xs active:scale-[0.99] cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
