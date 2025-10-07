
import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L14.09 8.26L20 10.35L14.09 12.44L12 18.7L9.91 12.44L4 10.35L9.91 8.26L12 2Z" />
    <path d="M18 6L17.5 7.5L16 8L17.5 8.5L18 10L18.5 8.5L20 8L18.5 7.5L18 6Z" />
    <path d="M6 18L6.5 16.5L8 16L6.5 15.5L6 14L5.5 15.5L4 16L5.5 16.5L6 18Z" />
  </svg>
);
