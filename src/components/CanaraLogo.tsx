import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light' | 'original';
}

/**
 * Official Canara Bank Logo
 * Exactly incorporates the official logo provided by the user:
 * - Local asset: /assets/aistudio/canara-bank-logo-banner.png
 * - Original file: /assets/aistudio/canara-bank-logo-png_seeklogo-527374_9dcfb1b0.png
 * Features the signature sky-blue banner, "केनरा बैंक" & "Canara Bank" bilingual title,
 * interlocking white & yellow triangle emblem, and "सिंडिकेट Syndicate" dog badge.
 */
export const CanaraLogo: React.FC<Props> = ({ className = '', size = 'md' }) => {
  // Exact aspect ratio of the Canara Bank banner is 540 / 117 ≈ 4.615
  const heightClasses = {
    sm: 'h-8 sm:h-9 max-w-[160px]',
    md: 'h-11 sm:h-12 max-w-[230px]',
    lg: 'h-14 sm:h-16 max-w-[310px]',
    xl: 'h-20 sm:h-24 max-w-[460px]',
  };

  return (
    <div className={`inline-flex items-center justify-center overflow-hidden rounded bg-[#0091df] shadow-sm border border-sky-400/50 p-0.5 select-none ${className}`}>
      <img
        src="/assets/aistudio/canara-bank-logo-banner.png"
        onError={(e) => {
          // If the cropped banner is not found, fallback to the original uploaded file
          const target = e.currentTarget;
          if (!target.src.includes('canara-bank-logo-png_seeklogo-527374_9dcfb1b0.png')) {
            target.src = '/assets/aistudio/canara-bank-logo-png_seeklogo-527374_9dcfb1b0.png';
            target.className = 'w-full h-full object-cover scale-[1.11]';
          }
        }}
        alt="केनरा बैंक Canara Bank | भारत सरकार का उपक्रम (सिंडिकेट Syndicate)"
        className={`${heightClasses[size]} w-auto object-contain block`}
      />
    </div>
  );
};
