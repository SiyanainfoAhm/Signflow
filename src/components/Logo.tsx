import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-24 h-28',
    lg: 'w-32 h-38',
  };

  const [imageError, setImageError] = useState(false);
  // Use the actual logo image from public folder
  const logoSrc = '/logo.jpg';

  // If image fails to load, show SVG fallback
  if (imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 200 240" className="w-full h-full">
          {/* Shield outline */}
          <path
            d="M100 10 L180 40 L180 140 Q180 200 100 230 Q20 200 20 140 L20 40 Z"
            fill="#363636"
            stroke="#f97316"
            strokeWidth="3"
          />
          
          {/* Graduation cap */}
          <circle cx="100" cy="60" r="8" fill="#f97316" />
          <path
            d="M85 60 L100 50 L115 60 L100 70 Z"
            fill="#f97316"
          />
          
          {/* Wings/Book shape */}
          <path
            d="M80 75 Q100 85 120 75"
            stroke="#b0b0b0"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M75 90 Q100 100 125 90"
            stroke="#b0b0b0"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Laurel wreaths */}
          <path
            d="M50 70 Q60 50 70 60 Q65 75 60 85"
            stroke="#f97316"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M150 70 Q140 50 130 60 Q135 75 140 85"
            stroke="#f97316"
            strokeWidth="2.5"
            fill="none"
          />
          
          {/* SKYLINE banner */}
          <rect x="30" y="120" width="140" height="25" fill="#f97316" rx="2" />
          <text
            x="100"
            y="137"
            textAnchor="middle"
            fill="white"
            fontSize="18"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            SKYLINE
          </text>
          
          {/* INSTITUTE OF TECHNOLOGY text */}
          <text
            x="100"
            y="155"
            textAnchor="middle"
            fill="white"
            fontSize="8"
            fontFamily="Arial, sans-serif"
          >
            INSTITUTE OF TECHNOLOGY
          </text>
          
          {/* KNOWLEDGE IS ENDLESS banner */}
          <rect x="40" y="190" width="120" height="20" fill="#f97316" rx="2" />
          <text
            x="100"
            y="204"
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontFamily="Arial, sans-serif"
          >
            KNOWLEDGE IS ENDLESS
          </text>
          
          {/* Stars */}
          <circle cx="90" cy="215" r="2" fill="#f97316" />
          <circle cx="100" cy="215" r="2.5" fill="#f97316" />
          <circle cx="110" cy="215" r="2" fill="#f97316" />
          <circle cx="85" cy="215" r="1" fill="white" opacity="0.5" />
          <circle cx="115" cy="215" r="1" fill="white" opacity="0.5" />
        </svg>
      </div>
    );
  }

  // Try to use the image file first
  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <img
        src={logoSrc}
        alt="SKYLINE INSTITUTE OF TECHNOLOGY Logo"
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
};
