import React from 'react';

export const NotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M15.2 3a2 2 0 0 1 2.8 2.8L12 12H8v-4L15.2 3z" />
    <path d="M8 12v4h4l7-7" />
    <path d="M3 21h18" />
  </svg>
);
