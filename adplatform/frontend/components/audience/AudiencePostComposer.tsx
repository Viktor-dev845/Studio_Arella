'use client';

import { useState, useRef } from 'react';
import { Edit3, Video, Calendar, Send, Film, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';

interface AudiencePostComposerProps {
  onPostSubmit?: (content: string, mediaUrl?: string, contentType?: string) => void;
  onLiveExperienceClick?: () => void;
  onFanEventClick?: () => void;
}

export default function AudiencePostComposer({
  onPostSubmit,
  onLiveExperienceClick,
  onFanEventClick,
}: AudiencePostComposerProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'video' | 'image' | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userAvatar = user?.avatar;
  const userName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) || 'Fan';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      toast('Please select a valid image or video file.', 'error');
      return;
    }

    const maxSize = 4 * 1024 * 1024; // 4MB safe limit for serverless payload
    if (file.size > maxSize) {
      toast('File is too large for instant post. Please select a video clip or photo under 4MB.', 'error');
      return;
    }

    setSelectedFile(file);
    setFileType(isVideo ? 'video' : 'image');
    setFilePreview(URL.createObjectURL(file));
  };

  const clearSelectedFile = () => {
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    if (isUploading) return;

    try {
      setIsUploading(true);
      let mediaDataUrl = '';

      if (selectedFile) {
        mediaDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      if (onPostSubmit) {
        const finalContent = content.trim() || (fileType === 'video' ? 'Shared a video' : 'Shared a photo');
        onPostSubmit(finalContent, mediaDataUrl || undefined, fileType || 'post');
      }

      setContent('');
      clearSelectedFile();
    } catch (err) {
      console.error('File read error:', err);
      toast('Failed to process media file. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full min-h-[168px] bg-white rounded-[16px] shadow-[0px_0px_2px_rgba(0,0,0,0.14),0px_0px_1px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col justify-between font-quicksand transition-all">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ─── Top Input Row ─── */}
      <div className="px-6 pt-4 pb-3 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-4">
          {/* User Avatar */}
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName} 
              className="w-[40px] h-[40px] rounded-[18px] object-cover shrink-0 border border-gray-100 shadow-sm"
            />
          ) : (
            <div className="w-[40px] h-[40px] rounded-[18px] bg-[#FAF5E6] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[#D4AF37] text-sm shrink-0 shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Text Input + Edit/Pencil Icon */}
          <div className="flex-1 flex items-center justify-between gap-3">
            <input 
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={fileType ? "Add a caption for this " + fileType + "..." : "Write something ..."}
              className="w-full text-[16px] text-black placeholder:text-[#666666] font-normal bg-transparent outline-none leading-[21px]"
            />
            <Edit3 size={20} strokeWidth={1.8} className="text-[#666666] shrink-0 cursor-pointer hover:text-black transition-colors" />
          </div>
        </div>

        {/* ─── Media Attachment Preview ─── */}
        {filePreview && (
          <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 max-w-fit shadow-2xs">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-amber-200">
              {fileType === 'video' ? (
                <video src={filePreview} className="w-full h-full object-cover" />
              ) : (
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-gray-900 truncate max-w-[220px]">
                {selectedFile?.name}
              </span>
              <span className="text-[11px] text-[#8c711a] font-semibold uppercase tracking-wider">
                {fileType} • {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>

            <button
              type="button"
              onClick={clearSelectedFile}
              className="p-1 rounded-full hover:bg-black/10 text-gray-500 hover:text-black transition-colors cursor-pointer"
              title="Remove attachment"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ─── Bottom Bar: height 70px, background rgba(212, 175, 55, 0.69) ─── */}
      <div className="w-full h-[70px] bg-[rgba(212,175,55,0.69)] rounded-b-[16px] flex items-stretch justify-between overflow-hidden">
        {/* Left Action Buttons: Photo/Video + Live experiences + Fan Event */}
        <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-5 flex-1 min-w-0 overflow-x-auto no-scrollbar">
          {/* 1. Upload Video / Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 sm:gap-2 py-2 px-2 hover:bg-black/5 rounded-md transition-colors text-left shrink-0 cursor-pointer group"
            title="Upload video or photo from local drive"
          >
            <Film size={20} strokeWidth={2.2} className="text-[#000000] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[13px] sm:text-[15px] font-semibold text-[#000000] leading-[21px] whitespace-nowrap">
              Photo / Video
            </span>
          </button>

          {/* 2. Live experiences */}
          <button
            type="button"
            onClick={onLiveExperienceClick}
            className="flex items-center gap-1.5 sm:gap-2 py-2 px-2 hover:bg-black/5 rounded-md transition-colors text-left shrink-0 cursor-pointer"
          >
            <Video size={19} strokeWidth={2} className="text-[#000000] shrink-0" />
            <span className="text-[13px] sm:text-[15px] font-normal text-[#000000] leading-[21px] whitespace-nowrap">
              Live experiences
            </span>
          </button>

          {/* 3. Fan Event */}
          <button
            type="button"
            onClick={onFanEventClick || (() => alert('Opening Fan Events calendar...'))}
            className="flex items-center gap-1.5 sm:gap-2 py-2 px-2 hover:bg-black/5 rounded-md transition-colors text-left shrink-0 cursor-pointer"
          >
            <Calendar size={19} strokeWidth={2} className="text-[#000000] shrink-0" />
            <span className="text-[13px] sm:text-[15px] font-normal text-[#000000] leading-[21px] whitespace-nowrap">
              Fan Event
            </span>
          </button>
        </div>

        {/* Right: Send Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isUploading || (!content.trim() && !selectedFile)}
          className="w-[65px] sm:w-[77px] h-[70px] bg-[rgba(212,175,55,0.49)] hover:bg-[#D4AF37] disabled:opacity-50 transition-all flex items-center justify-center text-[#000000] active:scale-95 shrink-0 cursor-pointer"
          title="Send Post"
        >
          {isUploading ? (
            <Loader2 size={22} className="animate-spin text-black" />
          ) : (
            <Send size={22} strokeWidth={2.2} className="text-[#000000]" />
          )}
        </button>
      </div>
    </div>
  );
}
