import React, { useState, useMemo, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '../types';
import { Button } from './Button';

interface FilterPanelProps {
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
    priceRange: { min: number; max: number };
    onPriceRangeChange: (range: { min: number; max: number }) => void;
    showFeaturedOnly: boolean;
    onFeaturedToggle: (value: boolean) => void;
    onClearFilters: () => void;
    isOpen: boolean;
    onClose: () => void;
    // Hardware color filter props
    isHerrajesSelected?: boolean;
    selectedHardwareColor?: string;
    onHardwareColorChange?: (color: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
    priceRange,
    onPriceRangeChange,
    showFeaturedOnly,
    onFeaturedToggle,
    onClearFilters,
    isOpen,
    onClose,
    isHerrajesSelected,
    selectedHardwareColor,
    onHardwareColorChange
}) => {
    // Collapsible states for sections
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);

    const hasActiveFilters = selectedCategory !== 'all' || showFeaturedOnly || priceRange.min > 0 || priceRange.max < 1000;

    // Build hierarchical category structure
    const categoryTree = useMemo(() => {
        const parents = categories.filter(c => !c.parent_id);
        return parents.map(parent => ({
            ...parent,
            subcategories: categories.filter(c => c.parent_id === parent.id)
        }));
    }, [categories]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[9999] lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Filter Panel */}
            <aside className={`
        fixed inset-y-0 left-0 z-[9999] w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:static lg:w-full lg:shadow-none lg:transform-none lg:z-auto lg:inset-auto lg:bg-transparent
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 h-full overflow-y-auto flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900">
                            Filtros
                        </h3>
                        <div className="flex items-center gap-4">
                            {hasActiveFilters && (
                                <button
                                    onClick={onClearFilters}
                                    className="text-xs font-bold text-[#44b6da] hover:text-[#3aaacd] tracking-wider uppercase transition-colors"
                                >
                                    LIMPIAR
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="lg:hidden p-1 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Categories Accordion */}
                    <div className="border-b border-slate-100 pb-6 mb-6">
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-full flex items-center justify-between mb-4 group"
                        >
                            <h4 className="text-sm font-bold text-slate-900">Categoría</h4>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isCategoryOpen && (
                            <div className="space-y-3">
                                {/* All Option (Optional, or explicit clear) - Visual check for 'all' */}
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === 'all' ? 'bg-[#44b6da] border-[#44b6da]' : 'border-slate-300 group-hover:border-[#44b6da]'}`}>
                                        {selectedCategory === 'all' && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className={`text-sm ${selectedCategory === 'all' ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                        Todas las categorías
                                    </span>
                                    <input
                                        type="radio"
                                        name="category"
                                        className="hidden"
                                        checked={selectedCategory === 'all'}
                                        onChange={() => onCategoryChange('all')}
                                    />
                                </label>

                                {categoryTree.map(parent => {
                                    const isExpanded = selectedCategory === parent.id || parent.subcategories?.some(sub => sub.id === selectedCategory);

                                    return (
                                        <div key={parent.id}>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === parent.id ? 'bg-[#44b6da] border-[#44b6da]' : 'border-slate-300 group-hover:border-[#44b6da]'}`}>
                                                    {selectedCategory === parent.id && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <span className={`text-sm ${selectedCategory === parent.id ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                                    {parent.name}
                                                </span>
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    className="hidden"
                                                    checked={selectedCategory === parent.id}
                                                    onChange={() => onCategoryChange(parent.id)}
                                                />
                                            </label>

                                            {/* Subcategories - Only show if expanded */}
                                            {isExpanded && parent.subcategories && parent.subcategories.length > 0 && (
                                                <div className="ml-8 mt-2 space-y-2 animate-fade-in">
                                                    {parent.subcategories.map(sub => (
                                                        <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategory === sub.id ? 'bg-[#44b6da] border-[#44b6da]' : 'border-slate-300 group-hover:border-[#44b6da]'}`}>
                                                                {selectedCategory === sub.id && <CheckIcon className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <span className={`text-sm ${selectedCategory === sub.id ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                                                                {sub.name}
                                                            </span>
                                                            <input
                                                                type="radio"
                                                                name="category"
                                                                className="hidden"
                                                                checked={selectedCategory === sub.id}
                                                                onChange={() => onCategoryChange(sub.id)}
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Price Range Accordion */}
                    <div className="border-b border-slate-100 pb-6 mb-6">
                        <button
                            onClick={() => setIsPriceOpen(!isPriceOpen)}
                            className="w-full flex items-center justify-between mb-4 group"
                        >
                            <h4 className="text-sm font-bold text-slate-900">Rango de Precio</h4>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isPriceOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isPriceOpen && (
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 mb-1 block font-medium">Mínimo</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={priceRange.min}
                                            onChange={(e) => onPriceRangeChange({ ...priceRange, min: Number(e.target.value) })}
                                            className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#44b6da] focus:border-[#44b6da] outline-none transition-all placeholder:text-slate-300"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <span className="text-slate-300 mt-5">-</span>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 mb-1 block font-medium">Máximo</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={priceRange.max}
                                            onChange={(e) => onPriceRangeChange({ ...priceRange, max: Number(e.target.value) })}
                                            className="w-full rounded-lg border border-slate-200 pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#44b6da] focus:border-[#44b6da] outline-none transition-all placeholder:text-slate-300"
                                            placeholder="1000"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hardware Color Filter - Only shows when Herrajes is selected */}
                    {isHerrajesSelected && onHardwareColorChange && (
                        <div className="border-b border-slate-100 pb-6 mb-6">
                            <h4 className="text-sm font-bold text-slate-900 mb-4">Color de Herraje</h4>
                            <div className="space-y-2">
                                {['all', 'Dorado', 'Plata', 'GoldenRose', 'Otros'].map(color => (
                                    <label key={color} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedHardwareColor === color || (color === 'all' && !selectedHardwareColor)
                                                ? 'bg-[#44b6da] border-[#44b6da]'
                                                : 'border-slate-300 group-hover:border-[#44b6da]'
                                            }`}>
                                            {(selectedHardwareColor === color || (color === 'all' && !selectedHardwareColor)) && (
                                                <CheckIcon className="w-3.5 h-3.5 text-white" />
                                            )}
                                        </div>
                                        <span className={`text-sm ${selectedHardwareColor === color || (color === 'all' && !selectedHardwareColor)
                                                ? 'text-slate-900 font-medium'
                                                : 'text-slate-600'
                                            }`}>
                                            {color === 'all' ? 'Todos los colores' : color}
                                        </span>
                                        <input
                                            type="radio"
                                            name="hardwareColor"
                                            className="hidden"
                                            checked={selectedHardwareColor === color || (color === 'all' && !selectedHardwareColor)}
                                            onChange={() => onHardwareColorChange(color === 'all' ? '' : color)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Featured/Other Filters */}
                    <div>
                        <label className="flex items-center justify-between cursor-pointer group py-2">
                            <span className="text-sm font-medium text-slate-700">Solo Destacados</span>

                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={showFeaturedOnly}
                                    onChange={(e) => onFeaturedToggle(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#44b6da] peer-focus:ring-4 peer-focus:ring-[#44b6da]/20 transition-all"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                            </div>
                        </label>
                    </div>

                    {/* Apply Button (Mobile Only) */}
                    <div className="mt-auto pt-6 lg:hidden">
                        <Button
                            onClick={onClose}
                            className="w-full bg-[#020617] text-white hover:bg-[#0f172a] py-4 rounded-full font-bold"
                        >
                            Ver Resultados
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
};

// Simple Check Icon Component for local use
const CheckIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
