import React from 'react';
import { Instagram, Music2 as TikTok } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
    const text = "Envío gratis para compras superiores a $100 (Gran Caracas)";

    const MarqueeContent = () => (
        <div className="flex items-center min-w-full justify-center">
            {[...Array(1)].map((_, i) => (
                <React.Fragment key={i}>
                    <p className="text-[13px] md:text-sm font-bold tracking-[0.05em] font-sans px-8">
                        {text}
                    </p>
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="bg-[#44b6da] text-white py-2 flex items-center relative overflow-hidden h-[40px]">
            <div className="flex items-center gap-5 px-4 md:px-12 z-10 bg-[#44b6da] h-full absolute left-0">
                <a
                    href="https://www.instagram.com/carinsumos.ve/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                >
                    <Instagram size={20} strokeWidth={2.5} />
                </a>
                <a
                    href="https://www.tiktok.com/@carinsumos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                >
                    <TikTok size={20} strokeWidth={2.5} />
                </a>
            </div>

            <div className="flex-1 overflow-hidden h-full flex items-center">
                <div className="flex whitespace-nowrap animate-marquee">
                    <MarqueeContent />
                    <MarqueeContent />
                </div>
            </div>
        </div>
    );
};
