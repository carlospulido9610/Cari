import React from 'react';
import { Instagram, Music2 as TikTok } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
    return (
        <div className="bg-[#44b6da] text-white py-2 px-4 md:px-12 flex items-center justify-between">
            <div className="flex items-center gap-5">
                <a
                    href="https://www.instagram.com/carinsumos.ve/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                >
                    <Instagram size={22} strokeWidth={2.5} />
                </a>
                <a
                    href="https://www.tiktok.com/@carinsumos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                >
                    <TikTok size={22} strokeWidth={2.5} />
                </a>
            </div>
            <p className="flex-1 text-center text-[13px] md:text-sm font-bold tracking-[0.05em] font-sans">
                Envío gratis para compras superiores a $100 (Gran Caracas)
            </p>
            <div className="w-[88px] hidden md:block"></div> {/* Spacer to balance larger icons (22*2 + 5* gap = 44 + 5? no, 22+22+20 = 64... adjusted to 88 for better centering visually) */}
        </div>
    );
};
