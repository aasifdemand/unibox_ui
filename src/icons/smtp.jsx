import React from 'react';

const Smtp = (props) => (
    <svg
        {...props}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Refined for "Same Size as Outlook" - Maximizing use of space */}

        {/* Envelope Frame - Scaled up to fill more of the 512x512 box */}
        <rect
            x="20"
            y="100"
            width="472"
            height="312"
            rx="8"
            stroke="#1A252F"
            strokeWidth="28"
            fill="white"
            fillOpacity="0.05"
        />

        {/* The Signature Teal Top Flap - Scaled up */}
        <path
            d="M20 100L256 260L492 100H20Z"
            fill="#00B2A9"
            stroke="#1A252F"
            strokeWidth="28"
            strokeLinejoin="round"
        />

        {/* Bottom Folding Lines - Scaled up */}
        <path
            d="M20 412L256 260L492 412"
            stroke="#1A252F"
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* Subtle Glow - Tighter and more focused */}
        <circle cx="256" cy="256" r="220" fill="#00B2A9" fillOpacity="0.03" />
    </svg>
);

export { Smtp };
