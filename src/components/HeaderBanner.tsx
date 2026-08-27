import React from 'react';

interface HeaderBannerProps {
  bannerType: 'vector' | 'image';
  customImage?: string;
  theme: 'terracotta' | 'caramel' | 'rose' | 'chocolate' | 'burgundy';
}

const themeColors: Record<string, { bg: string; text: string; accent: string }> = {
  terracotta: { bg: '#B75234', text: '#FFFFFF', accent: '#F5D0C5' },
  caramel: { bg: '#9C5B32', text: '#FFFFFF', accent: '#F7DEC8' },
  rose: { bg: '#9E4E5D', text: '#FFFFFF', accent: '#F8D8DE' },
  chocolate: { bg: '#4A2E2B', text: '#FFFFFF', accent: '#EAD7CE' },
  burgundy: { bg: '#6B2535', text: '#FFFFFF', accent: '#F6CDD4' },
};

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  bannerType,
  customImage,
  theme = 'terracotta',
}) => {
  const currentTheme = themeColors[theme] || themeColors.terracotta;

  if (bannerType === 'image' && customImage) {
    return (
      <div className="w-full overflow-hidden rounded-xs">
        <img
          src={customImage}
          alt="Cabeçalho Orçamento"
          className="w-full h-auto object-cover block"
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  return (
    <div
      className="w-full relative overflow-hidden flex items-center justify-between px-10 py-8 select-none"
      style={{ backgroundColor: currentTheme.bg, minHeight: '140px' }}
    >
      {/* Decorative subtle background overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Left side: Jana Confeitaria Brandmark */}
      <div className="flex flex-col items-center justify-center text-white relative z-10">
        {/* Chef Hat with Heart */}
        <div className="relative mb-1 flex justify-center items-center">
          <svg
            className="w-14 h-12 fill-current text-white drop-shadow-xs"
            viewBox="0 0 100 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Chef Hat Puffs */}
            <path
              d="M50 8C38 8 32 18 32 26C24 26 18 32 18 42C18 52 26 56 34 56L66 56C74 56 82 52 82 42C82 32 76 26 68 26C68 18 62 8 50 8Z"
              fill="currentColor"
            />
            {/* Chef Hat Base Band */}
            <path
              d="M31 58H69C70.6 58 72 59.4 72 61L70.5 70C70.2 71.7 68.7 73 67 73H33C31.3 73 29.8 71.7 29.5 70L28 61C28 59.4 29.4 58 31 58Z"
              fill="currentColor"
            />
            {/* Heart in center of hat */}
            <path
              d="M50 44C50 44 41 37 41 31.5C41 27.5 44 25 47.5 25C49.5 25 50 26.5 50 26.5C50 26.5 50.5 25 52.5 25C56 25 59 27.5 59 31.5C59 37 50 44 50 44Z"
              fill={currentTheme.bg}
            />
          </svg>
        </div>

        {/* Brand Name "JANA" with heart inside J */}
        <div className="relative flex items-center justify-center">
          <div className="flex items-center tracking-widest">
            {/* Custom stylized J with heart */}
            <span className="relative font-serif font-black text-3xl leading-none mr-0.5">
              J
              {/* Little heart tucked in the J loop */}
              <span className="absolute -left-1 top-3 text-[10px] text-white">
                ♥
              </span>
            </span>
            <span className="font-serif font-black text-3xl leading-none tracking-[0.18em]">
              ANA
            </span>
          </div>
        </div>

        {/* Subtitle "— CONFEITARIA —" */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-4 h-[1px] bg-white opacity-80" />
          <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-white/95">
            CONFEITARIA
          </span>
          <span className="w-4 h-[1px] bg-white opacity-80" />
        </div>
      </div>

      {/* Right side: ORÇAMENTO in grand display serif font */}
      <div className="relative z-10 text-right pr-4">
        <h1 
          className="text-white font-serif italic text-[48px] tracking-[0.06em] font-normal drop-shadow-xs leading-tight"
          style={{
            fontFamily: '"Playfair Display", "Times New Roman", Georgia, serif',
            letterSpacing: '0.06em',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          ORÇAMENTO
        </h1>
      </div>
    </div>
  );
};
