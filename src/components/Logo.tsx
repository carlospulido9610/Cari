import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    lightText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10", showText = true, lightText = false }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* SVG Logo Icon */}
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto aspect-square"
            >
                {/* Outer C - Dark Blue */}
                <path
                    d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C65.5 15 78.5 25 83 39"
                    stroke="#1e3857"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                {/* Inner C - Light Blue - Rotated/Flipped slightly for style */}
                <path
                    d="M70 50C70 61.046 61.046 70 50 70C38.954 70 30 61.046 30 50C30 38.954 38.954 30 50 30C58.5 30 65.5 35 68.5 42"
                    stroke="#44b6da"
                    strokeWidth="10"
                    strokeLinecap="round"
                    transform="rotate(180 50 50)"
                />
            </svg>

            {showText && (
                <div className="flex flex-col">
                    <span className={`font-bold text-xl leading-none tracking-tight ${lightText ? 'text-white' : 'text-[#1e3857]'}`}>
                        CARI
                    </span>
                    <span className={`text-xs font-medium tracking-[0.2em] ${lightText ? 'text-blue-100' : 'text-[#44b6da]'}`}>
                        INSUMOS
                    </span>
                </div>
            )}
        </div>
    );
};
