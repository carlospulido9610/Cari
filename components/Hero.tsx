import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import heroImage from '../src/Imagenes/wmremove-transformed (1).png';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Full-Width Background Image */}
      <div className="absolute inset-0 z-0 bg-brand-ink">
        <img
          src={heroImage}
          alt="Textura Supply Co. Hero"
          className="w-full h-full object-cover object-center opacity-90"
        />
        {/* Subtle Overlay for better text separation if needed */}
        <div className="absolute inset-0 bg-black/30 z-10" />

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 z-20 opacity-[0.1] pointer-events-none px-6 lg:px-12">
          <div className="w-full h-full border-x border-white/20 max-w-7xl mx-auto" />
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 lg:px-12 relative z-30">
        <div className="max-w-4xl">
          {/* Label */}
          <div className="flex items-center space-x-4 mb-8 opacity-0 animate-reveal" style={{ animationDelay: '0.1s' }}>
            <div className="h-[1px] w-12 bg-white/60" />
            <span className="text-white text-xs uppercase tracking-[0.4em] font-bold">Insumos de Lujo</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium text-white tracking-tight leading-[1.05] display-font opacity-0 animate-reveal mb-10" style={{ animationDelay: '0.2s' }}>
            Redefiniendo la <br />
            <span className="italic text-white">excelencia</span> textil.
          </h1>

          <div className="flex flex-col md:flex-row md:items-start gap-12 opacity-0 animate-reveal" style={{ animationDelay: '0.3s' }}>
            <div className="max-w-md">
              <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium">
                Provisión exclusiva de insumos y servicios técnicos de producción para diseñadores que buscan trascender lo ordinario.
              </p>

              <div className="flex flex-wrap gap-6 pt-10">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/productos')}
                  className="px-10 py-5 text-sm uppercase tracking-widest font-semibold transition-all hover:translate-y-[-2px] hover:shadow-2xl shadow-white/20"
                >
                  Explorar Catálogo
                </Button>
                <button
                  onClick={() => navigate('/cotizar')}
                  className="group relative flex items-center space-x-3 py-5 px-4 text-sm uppercase tracking-widest font-semibold text-white border-b border-white/30 transition-all hover:bg-white/5"
                >
                  <span>Cotizar Servicio</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative vertical line */}
      <div className="absolute right-12 bottom-0 w-px h-32 bg-gradient-to-t from-white/40 to-transparent z-30 hidden lg:block" />
    </section>
  );
};
