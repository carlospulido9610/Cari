import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Category } from '../types';

interface ProductsDropdownProps {
    categories: Category[];
    isMobile?: boolean;
    onClose?: () => void;
}

export const ProductsDropdown: React.FC<ProductsDropdownProps> = ({
    categories,
    isMobile = false,
    onClose
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen && !isMobile) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, isMobile]);

    const handleLinkClick = () => {
        setIsOpen(false);
        onClose?.();
    };

    if (isMobile) {
        // Mobile accordion style - Integrated with brand aesthetic
        return (
            <div className="border-b border-brand-ink/5">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-lg font-medium uppercase tracking-widest text-brand-ink/80 hover:text-brand-ink hover:bg-brand-ink/5 transition-all display-font"
                >
                    <span>Catálogo</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="pl-4 pb-4 space-y-1">
                        <Link
                            to="/productos"
                            className="block px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 hover:text-brand-accent transition-colors display-font"
                            onClick={handleLinkClick}
                        >
                            Ver Todo
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/productos?categoria=${category.slug}`}
                                className="block px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 hover:text-brand-accent transition-colors display-font"
                                onClick={handleLinkClick}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Desktop dropdown - Industrial Luxury Menu
    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className={`flex items-center gap-1 text-[13px] uppercase tracking-widest font-medium transition-all display-font ${isOpen ? 'text-brand-ink' : 'text-brand-ink/70 hover:text-brand-ink'}`}
                aria-expanded={isOpen}
            >
                Catálogo
                <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${isOpen ? 'rotate-180 text-brand-accent' : ''}`} />
            </button>

            {/* Dropdown Menu Wrapper */}
            <div
                className={`absolute top-full left-0 pt-6 w-72 z-50 transition-all duration-500
                ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
            >
                {/* Visual Card - Editorial Style */}
                <div className="bg-brand-ivory/95 backdrop-blur-md rounded-sm border border-brand-ink/10 shadow-2xl p-6 relative">
                    {/* Minimal Accents */}
                    <div className="absolute top-0 right-0 w-12 h-px bg-brand-accent/20"></div>
                    <div className="absolute bottom-0 left-0 w-px h-12 bg-brand-accent/20"></div>

                    <div className="flex flex-col space-y-2">


                        <Link
                            to="/productos"
                            className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-ink/40 hover:text-brand-accent transition-all duration-300 py-2 flex items-center justify-between group"
                            onClick={handleLinkClick}
                        >
                            Ver Todo
                            <span className="w-4 h-px bg-brand-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></span>
                        </Link>

                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/productos?categoria=${category.slug}`}
                                className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-ink/60 hover:text-brand-accent transition-all duration-300 py-2 flex items-center justify-between group"
                                onClick={handleLinkClick}
                            >
                                {category.name}
                                <span className="w-4 h-px bg-brand-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
