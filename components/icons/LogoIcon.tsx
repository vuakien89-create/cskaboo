import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    <path
      d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
      fill="url(#logoGradient)"
    />
    <path d="M14 2V8H20" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round" />
    
    {/* Sparkles */}
    <path
      d="M12 12.5L12.3398 13.6602L13.5 14L12.3398 14.3398L12 15.5L11.6602 14.3398L10.5 14L11.6602 13.6602L12 12.5Z"
      fill="white"
    />
    <path
      d="M8.5 15.5L8.7142 16.2858L9.5 16.5L8.7142 16.7142L8.5 17.5L8.2858 16.7142L7.5 16.5L8.2858 16.2858L8.5 15.5Z"
      fill="white"
    />
     <path
      d="M15.5 17.5L15.7142 18.2858L16.5 18.5L15.7142 18.7142L15.5 19.5L15.2858 18.7142L14.5 18.5L15.2858 18.2858L15.5 17.5Z"
      fill="white"
    />
  </svg>
);
