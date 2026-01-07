import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';
import { ProductsDropdown } from './ProductsDropdown';
import { fetchCategories } from '../src/services/supabaseClient';
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
    <nav className="relative z-50 w-full transition-all duration-500">
      <div className={`w-full bg-brand-ivory/95 backdrop-blur-2xl border-b border-brand-ink/5 px-4 md:px-12 py-3 md:py-4 transition-all duration-500 shadow-sm`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center relative">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer group pr-10">
            <Logo className="h-10 md:h-12 transition-transform duration-500 group-hover:scale-105" />
          </Link>

          {/* Desktop Menu & Search */}
          <div className="hidden md:flex items-center flex-1 justify-end space-x-10">

            {/* Search Input (Animated) */}
            <div className={`relative flex items-center transition-all duration-500 ease-out ${isSearchOpen ? 'w-64' : 'w-10'}`}>
              <form
                onSubmit={handleSearch}
                className={`absolute right-0 top-1/2 -translate-y-1/2 h-10 bg-brand-ink/5 border border-brand-ink/10 rounded-full flex items-center overflow-hidden transition-all duration-500 ${isSearchOpen ? 'w-full px-5 border-brand-ink/20 opacity-100' : 'w-10 border-transparent bg-transparent opacity-0 pointer-events-none'}`}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-transparent border-none outline-none text-sm text-brand-ink placeholder:text-brand-ink/40 font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                />
              </form>

              {/* Search Toggle Icon */}
              <button
                className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 text-brand-ink/60 hover:text-brand-ink transition-all rounded-full z-10 ${isSearchOpen ? 'pointer-events-none opacity-0 scale-90' : 'opacity-100 scale-100'}`}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5 stroke-[1.5px]" />
              </button>
            </div>


            {/* Links */}
            <Link
              to="/"
              className="text-brand-ink/70 hover:text-brand-ink font-medium text-[13px] uppercase tracking-widest transition-all display-font"
            >
              Inicio
            </Link>
            <ProductsDropdown categories={categories} />
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-brand-ink/70 hover:text-brand-ink font-medium text-[13px] uppercase tracking-widest transition-all display-font"
              >
                {link.name}
              </Link>
            ))}

            {/* Divider */}
            <div className="h-4 w-px bg-brand-ink/10 mx-2"></div>

            {/* Cart Button */}
            <button
              className="relative p-2 text-brand-ink/70 hover:text-brand-ink transition-all group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-brand-ivory bg-brand-ink rounded-full transition-transform group-hover:scale-110">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="relative p-2 text-brand-ink/70 hover:text-brand-ink transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.5px]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-brand-ivory bg-brand-ink rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-brand-ink/70 hover:text-brand-ink transition-colors focus:outline-none"
            >
              {isOpen ? <X size={24} className="stroke-[1.5px]" /> : <Menu size={24} className="stroke-[1.5px]" />}
            </button>
          </div>
        </div>
      </div>



      {/* Mobile Menu Backdrop */}
      {
        isOpen && (
          <div
            className="fixed inset-0 bg-brand-ink/10 z-40 md:hidden pointer-events-auto backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )
      }

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 mt-4 w-full px-6 pointer-events-auto transition-all duration-500 ease-out z-50 ${isOpen ? 'max-h-[80vh] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4 overflow-hidden'}`}>
        <div className="bg-brand-ivory/95 backdrop-blur-2xl shadow-2xl rounded-3xl border border-brand-ink/5 p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Mobile Search Bar - Inside Menu */}
          <form onSubmit={handleSearch} className="relative">
            <input
              ref={mobileSearchInputRef}
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-ink/10 bg-brand-ink/5 focus:bg-brand-ivory focus:outline-none focus:ring-1 focus:ring-brand-ink/20 transition-all text-sm font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40" />
          </form>

          <div className="space-y-4">
            <Link
              to="/"
              className="block px-4 py-3 rounded-xl text-lg font-medium text-brand-ink/80 hover:text-brand-ink hover:bg-brand-ink/5 transition-all display-font uppercase tracking-widest"
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
                className="block px-4 py-3 rounded-xl text-lg font-medium text-brand-ink/80 hover:text-brand-ink hover:bg-brand-ink/5 transition-all display-font uppercase tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-8">
              <Button
                className="w-full bg-brand-ink hover:bg-brand-ink/90 text-brand-ivory rounded-full py-5 text-sm uppercase tracking-widest font-bold shadow-xl shadow-brand-ink/10"
                onClick={() => {
                  setIsOpen(false);
                  setIsCartOpen(true);
                }}
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Ver Carrito ({cartCount})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav >
  );
};