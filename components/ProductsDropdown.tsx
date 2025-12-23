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
        // Mobile accordion style
        return (
            <div className="border-b border-slate-100">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-slate-600 hover:text-[#44b6da] hover:bg-slate-50 rounded-md transition-colors"
                >
                    <span>Productos</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="pl-4 pb-2 space-y-1">
                        <Link
                            to="/productos"
                            className="block px-3 py-2 text-sm text-slate-500 hover:text-[#44b6da] hover:bg-slate-50 rounded-md transition-colors"
                            onClick={handleLinkClick}
                        >
                            Todos los productos
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/productos?categoria=${category.slug}`}
                                className="block px-3 py-2 text-sm text-slate-500 hover:text-[#44b6da] hover:bg-slate-50 rounded-md transition-colors"
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

    // Desktop dropdown
    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className={`flex items-center gap-1 font-medium transition-colors text-[15px] ${isOpen ? 'text-[#1e3857]' : 'text-slate-600 hover:text-[#1e3857]'}`}
                aria-expanded={isOpen}
            >
                Productos
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Wrapper - Uses pt-4 to bridge the gap interaction-wise */}
            <div
                className={`absolute top-full left-0 pt-4 w-64 z-50 transition-all duration-200 origin-top
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
            >
                {/* Visual Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-[#1e3857]/10 border border-slate-100 p-2 relative">
                    {/* Arrow up pointing to menu */}
                    <div className="absolute -top-1.5 left-8 w-3 h-3 bg-white border-t border-l border-slate-100 transform rotate-45"></div>

                    <div className="flex flex-col">
                        {/* All Products Link */}
                        <Link
                            to="/productos"
                            className="px-4 py-3 text-sm font-semibold text-[#1e3857] hover:text-[#44b6da] hover:bg-slate-50 rounded-xl mb-1 flex items-center justify-between group"
                            onClick={handleLinkClick}
                        >
                            Ver todos
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#44b6da]">→</span>
                        </Link>

                        <div className="h-px bg-slate-100 my-1 mx-2" />

                        {/* Categories */}
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/productos?categoria=${category.slug}`}
                                className="px-4 py-2.5 text-sm text-slate-600 hover:text-[#44b6da] hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between group"
                                onClick={handleLinkClick}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
