import React from 'react';
import { Instagram, Linkedin, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#020617] text-slate-300 pt-16 pb-8 border-t border-[#44b6da]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center text-white">
              <Logo className="h-10" lightText={true} />
            </div>
            <p className="text-sm text-slate-400 font-light leading-relaxed">
              Modernizando la cadena de suministro textil con materiales premium, abastecimiento global y servicio digital primero.
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone size={14} className="text-[#44b6da]" />
                <span>+58 414 792 69 34</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail size={14} className="text-[#44b6da]" />
                <span>coimpor.es@gmail.com</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-400 font-light">
                <MapPin size={14} className="text-[#44b6da] shrink-0 mt-0.5" />
                <span>Torre Insbanca, Esquina de Santa Capilla a Mijares, Avenida Urdaneta. Caracas</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Enlaces Rápidos</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/" className="text-slate-300 hover:text-white transition-colors">Inicio</Link></li>
              <li><Link to="/productos" className="text-slate-300 hover:text-white transition-colors">Productos</Link></li>
              <li><Link to="/servicios" className="text-slate-300 hover:text-white transition-colors">Servicios</Link></li>
              <li><Link to="/contacto" className="text-slate-300 hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Horario de Atención</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-light">
              <li className="flex justify-between border-b border-slate-700/50 pb-2"><span>Lun - Vie:</span> <span className="text-slate-300 font-medium">9:00 AM - 5:00 PM</span></li>
              <li className="flex justify-between border-b border-slate-700/50 pb-2"><span>Sábado:</span> <span className="text-slate-300 font-medium">Solo Online</span></li>
              <li className="flex justify-between"><span>Domingo:</span> <span className="text-slate-500">Cerrado</span></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-slate-800/50 p-2.5 rounded-xl hover:bg-[#44b6da] hover:text-white transition-all transform hover:-translate-y-1"><Instagram size={18} /></a>
              <a href="#" className="bg-slate-800/50 p-2.5 rounded-xl hover:bg-[#44b6da] hover:text-white transition-all transform hover:-translate-y-1"><Linkedin size={18} /></a>
              <a href="#" className="bg-slate-800/50 p-2.5 rounded-xl hover:bg-[#44b6da] hover:text-white transition-all transform hover:-translate-y-1"><Twitter size={18} /></a>
              <a href="#" className="bg-slate-800/50 p-2.5 rounded-xl hover:bg-[#44b6da] hover:text-white transition-all transform hover:-translate-y-1"><Facebook size={18} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p className="font-light">&copy; {new Date().getFullYear()} Cari Insumos. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#44b6da] transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-[#44b6da] transition-colors">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};