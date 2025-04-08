import React from "react";

const TicketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Forma básica del ticket con bordes redondeados */}
        <rect x="3" y="5" width="18" height="14" rx="2" />
        {/* Líneas internas que simulan secciones de información */}
        <line x1="7" y1="9" x2="17" y2="9" />
        <line x1="7" y1="13" x2="17" y2="13" />
    </svg>
);

export default TicketIcon;
