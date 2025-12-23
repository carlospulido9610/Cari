import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';
import { ProductsDropdown } from './ProductsDropdown';
import { fetchCategories } from '../services/supabaseClient';
import { Category } from '../types';
import { useCart } from '../src/context/CartContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); // New state for mobile search
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null); // Ref for mobile search focus

  // Load Categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      // Filter only main categories (no parent_id)
      const mainCategories = fetchedCategories.filter(c => !c.parent_id);
      setCategories(mainCategories);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setMobileSearchOpen(false);
      setIsOpen(false);
    }
  };

  const navLinks = [
    { name: 'Servicios', path: '/servicios' },
    { name: 'Contacto', path: '/contacto' },
    { name: 'Preguntas Frecuentes', path: '/preguntas-frecuentes' },
  ];

  return (
    <nav className="sticky top-4 z-50 flex justify-center px-4 transition-all duration-300 w-full pointer-events-none">
      <div className={`pointer-events-auto relative z-50 w-full max-w-7xl bg-white/90 backdrop-blur-3xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 px-6 py-4 transition-all duration-300 ${scrolled ? 'py-3 bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.08)]' : 'py-4'}`}>
        <div className="flex justify-between items-center relative">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer group pr-8">
            <Logo className="h-12 md:h-16 transition-transform duration-300 group-hover:scale-105" />
          </Link>

          {/* Desktop Menu & Search */}
          <div className="hidden md:flex items-center flex-1 justify-end space-x-8">

            {/* Search Input (Animated) */}
            <div className={`relative flex items-center transition-all duration-300 ease-in-out ${isSearchOpen ? 'w-64' : 'w-10'}`}>
              <form
                onSubmit={handleSearch}
                className={`absolute right-0 top-1/2 -translate-y-1/2 h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center overflow-hidden transition-all duration-300 ${isSearchOpen ? 'w-full px-4 border-slate-300' : 'w-10 border-transparent bg-transparent'}`}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar..."
                  className={`w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 ${isSearchOpen ? 'opacity-100' : 'opacity-0'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setIsSearchOpen(false)} // Auto close if empty on blur
                />
              </form>

              {/* Search Toggle Icon */}
              <button
                className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-[#1e3857] transition-colors rounded-full z-10 ${isSearchOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>


            {/* Links */}
            <Link
              to="/"
              className="text-slate-600 hover:text-[#1e3857] font-medium text-[15px] transition-colors"
            >
              Inicio
            </Link>
            <ProductsDropdown categories={categories} />
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-600 hover:text-[#1e3857] font-medium text-[15px] transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            {/* Cart Button */}
            <button
              className="relative p-2.5 text-slate-600 hover:text-[#1e3857] transition-all hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold leading-none text-white bg-[#1e3857] rounded-full shadow-sm group-hover:bg-[#44b6da] transition-colors border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-1">
            {/* Mobile Search Toggle */}
            <button
              className="p-2 text-slate-600 hover:text-[#1e3857] hover:bg-slate-50 rounded-full transition-colors"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setIsOpen(false); // Close menu if opening search
              }}
            >
              <Search className="w-6 h-6" />
            </button>

            <button
              className="relative p-2 text-slate-600 hover:text-[#1e3857] transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#1e3857] rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setIsOpen(!isOpen);
                setMobileSearchOpen(false); // Close search if opening menu
              }}
              className="p-2 text-slate-600 hover:text-[#1e3857] hover:bg-slate-50 rounded-full transition-colors focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      <div className={`md:hidden absolute top-full left-0 mt-2 w-full px-4 pointer-events-auto transition-all duration-300 ease-in-out z-40 ${mobileSearchOpen ? 'max-h-24 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4 overflow-hidden'}`}>
        <div className="bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl border border-white/60 p-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              ref={mobileSearchInputRef}
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#44b6da] focus:border-transparent transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden pointer-events-auto backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 mt-2 w-full px-4 pointer-events-auto transition-all duration-300 ease-in-out z-50 ${isOpen ? 'max-h-[80vh] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4 overflow-hidden'}`}>
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2rem] border border-white/60 p-4 space-y-6 max-h-[70vh] overflow-y-auto ring-1 ring-black/5">
          {/* Mobile Search REMOVED from here */}

          <div className="space-y-2">
            <Link
              to="/"
              className="block px-3 py-3 rounded-xl text-base font-medium text-slate-700 hover:text-[#1e3857] hover:bg-slate-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <ProductsDropdown
              categories={categories}
              isMobile={true}
              onClose={() => setIsOpen(false)}
            />
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-3 rounded-xl text-base font-medium text-slate-700 hover:text-[#1e3857] hover:bg-slate-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6">
              <Button
                className="w-full bg-[#1e3857] hover:bg-[#0f172a] text-white rounded-xl py-4 shadow-lg shadow-[#1e3857]/20"
                onClick={() => {
                  setIsOpen(false);
                  setIsCartOpen(true);
                }}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Ver Carrito ({cartCount})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};