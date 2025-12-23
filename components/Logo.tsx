import React from 'react';

interface LogoProps {
    className?: string; // Kept for compatibility but might need adjustment
    showText?: boolean; // Kept for compatibility
    lightText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10", showText = true, lightText = false }) => {
    return (
        <img
            src="/logo.png"
            alt="CARI INSUMOS"
            className={`object-contain ${className} ${lightText ? 'brightness-0 invert' : ''}`}
        />
    );
};
