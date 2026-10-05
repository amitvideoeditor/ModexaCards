import React from 'react';

interface ReviewTapLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ReviewTapLogo: React.FC<ReviewTapLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) => {
  const pixelSizes = {
    sm: { box: 28, radius: 7, star: 16, text: 15 },
    md: { box: 34, radius: 9, star: 20, text: 18 },
    lg: { box: 48, radius: 14, star: 28, text: 24 },
  };

  const current = pixelSizes[size];

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
      className={className}
    >
      {/* Blue Square with White Star */}
      <div
        style={{
          width: `${current.box}px`,
          height: `${current.box}px`,
          borderRadius: `${current.radius}px`,
          backgroundColor: '#0B63E5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(11, 99, 229, 0.25)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: `${current.star}px`, height: `${current.star}px` }}
        >
          <path
            d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"
            fill="white"
            stroke="white"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span
          style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: `${current.text}px`,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Modexa TapCard
        </span>
      )}
    </div>
  );
};
