import React from 'react';
import { Instagram, Linkedin, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-ink text-brand-ivory/60 pt-24 pb-12 border-t border-brand-ivory/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

          {/* Brand */}
          <div className="space-y-8">
            <Logo className="h-10" lightText={true} />
            <p className="text-sm font-light leading-relaxed max-w-xs">
              Modernizando la cadena de suministro textil con materiales de <span className="font-medium text-brand-ivory">ingeniería premium</span> y servicio digital vanguardista.
            </p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest font-bold text-brand-ivory/30">
                <span className="w-4 h-px bg-brand-accent/30"></span>
                <span>+58 414 792 69 34</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest font-bold text-brand-ivory/30">
                <span className="w-4 h-px bg-brand-accent/30"></span>
                <span>coimpor.es@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-ivory mb-10 display-font">Navegación</h4>
            <ul className="space-y-4 text-xs tracking-widest font-bold uppercase">
              <li><Link to="/" className="hover:text-brand-accent transition-colors">Inicio</Link></li>
              <li><Link to="/productos" className="hover:text-brand-accent transition-colors">Colección</Link></li>
              <li><Link to="/servicios" className="hover:text-brand-accent transition-colors">Atelier Digital</Link></li>
              <li><Link to="/contacto" className="hover:text-brand-accent transition-colors">Enlace</Link></li>
            </ul>
          </div>

          {/* Utility / Hours */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-ivory mb-10 display-font">Operaciones</h4>
            <ul className="space-y-4 text-xs font-light">
              <li className="flex justify-between border-b border-brand-ivory/5 pb-2">
                <span className="uppercase tracking-widest text-brand-ivory/30 font-bold">Lunes - Viernes</span>
                <span className="tabular-nums font-bold text-lg">9:00 AM — 5:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-brand-ivory/5 pb-2">
                <span className="uppercase tracking-widest text-brand-ivory/30 font-bold">Sábados</span>
                <span className="font-medium text-lg">Soporte Digital</span>
              </li>
            </ul>
          </div>

          {/* Social & Location */}
          <div className="space-y-12">
            <div>
              <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-ivory mb-8 display-font">Social Connect</h4>
              <div className="flex space-x-6">
                {[Instagram, Linkedin, Facebook].map((Icon, idx) => (
                  <a key={idx} href="#" className="text-brand-ivory/40 hover:text-brand-accent transition-all transform hover:-translate-y-1">
                    <Icon size={20} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-ivory/30 leading-relaxed group">
                <span className="block mb-2 text-brand-accent/40">— Localización</span>
                Avenida Urdaneta.<br />Caracas, Venezuela.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-brand-ivory/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-brand-ivory/20">
          <p>&copy; {new Date().getFullYear()} Cari Insumos &bull; Industrial Luxury Insumos</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-brand-ivory transition-colors">Privacidad</a>
            <a href="#" className="hover:text-brand-ivory transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>

  );
};