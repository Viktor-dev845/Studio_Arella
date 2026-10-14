'use client';

export default function AudiencePremiumCard({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`w-[278px] h-[168px] rounded-[18px] p-4 shadow-[0px_0px_2px_rgba(0,0,0,0.1),0px_0px_1px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between shrink-0 ${className}`}
      style={{
        background: 'linear-gradient(250.16deg, #FFFFFF 2.51%, #FFFAEA 96.8%)',
      }}
    >
      {/* Background 3D Illustration & Decorative Shapes */}
      <div className="absolute right-[-10px] top-6 w-[151px] h-[132px] pointer-events-none overflow-hidden flex items-end justify-end">
        {/* Rotated decorative polygon */}
        <div className="absolute w-[76px] h-[76px] border border-[#D6CCD6] rotate-[-17.92deg] right-2 top-2 rounded-lg opacity-60" />
        
        {/* Decorative gold dots */}
        <div className="absolute w-[14.6px] h-[14.6px] bg-[#D3BD7E] rounded-full rotate-[31.15deg] right-14 top-4 opacity-70" />
        <div className="absolute w-[14.6px] h-[14.6px] bg-[#F5C54F] rounded-full rotate-[31.15deg] right-24 top-6 opacity-70" />

        <img 
          src="/audience/try-premium.png" 
          alt="Premium Illustration" 
          className="w-full h-auto object-contain relative z-10"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Text Header */}
      <div className="relative z-10 max-w-[150px]">
        <h3 className="text-[24px] font-normal text-[#000000] leading-[31px]">
          Try Premium <br />
          for free
        </h3>
        <p className="text-[12px] font-normal text-black/45 leading-[16px] mt-1">
          --One month free
        </p>
      </div>

      {/* CTA Button: 110px x 40px, background #D4AF37 */}
      <div className="relative z-10">
        <button
          type="button"
          className="w-[110px] h-[40px] bg-[#D4AF37] hover:bg-[#c29f31] text-black/80 rounded-[6px] text-[14px] font-normal font-['Jost',sans-serif] capitalize transition-all shadow-sm active:scale-95 flex items-center justify-center cursor-pointer"
        >
          Try Free
        </button>
      </div>
    </div>
  );
}
