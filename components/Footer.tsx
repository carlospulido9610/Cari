import React from 'react';
import { Instagram, Linkedin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-ink text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-6">
            <Logo className="h-10" lightText={true} />
            <p className="text-sm leading-relaxed text-white/80">
              Modernizando la cadena de suministro textil con materiales de ingeniería premium.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-white/80 hover:text-brand-accent transition-colors">Inicio</Link></li>
              <li><Link to="/productos" className="text-white/80 hover:text-brand-accent transition-colors">Catálogo</Link></li>
              <li><Link to="/servicios" className="text-white/80 hover:text-brand-accent transition-colors">Servicios</Link></li>
              <li><Link to="/contacto" className="text-white/80 hover:text-brand-accent transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Horario</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li>
                <div className="font-medium text-white">Lunes - Viernes</div>
                <div>9:00 AM — 5:00 PM</div>
              </li>
              <li>
                <div className="font-medium text-white">Sábados</div>
                <div>Soporte Digital</div>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-3 text-sm text-white/80 mb-6">
              <li>+58 414 792 69 34</li>
              <li>coimpor.es@gmail.com</li>
              <li>Avenida Urdaneta<br />Caracas, Venezuela</li>
            </ul>
            <div className="flex space-x-4">
              {[Instagram, Linkedin, Facebook].map((Icon, idx) => (
                <a key={idx} href="#" className="text-white/60 hover:text-brand-accent transition-colors">
                  <Icon size={20} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/60">
          <p>&copy; {new Date().getFullYear()} Cari Insumos. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-brand-accent transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>

  );
};