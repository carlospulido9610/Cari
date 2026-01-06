import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-brand-ivory">
      {/* Editorial Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[60vw] h-[60vw] border-[1px] border-brand-ink/5 rounded-full" />
        <div className="absolute top-[20%] -left-[10%] w-[40vw] h-[40vw] border-[1px] border-brand-ink/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none px-4">
          <div className="w-full h-full border-x-[1px] border-brand-ink max-w-7xl mx-auto" />
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Main Text Content */}
          <div className="lg:col-span-8 flex flex-col space-y-10">


            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium text-brand-gold tracking-tight leading-[1.05] display-font opacity-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
              Redefiniendo la <br />
              <span className="font-bold">excelencia</span> textil.
            </h1>

            <div className="flex flex-col md:flex-row md:items-start gap-12 opacity-0 animate-reveal" style={{ animationDelay: '0.3s' }}>
              <div className="max-w-md">
                <p className="text-lg md:text-xl text-brand-ink/70 leading-relaxed font-medium">
                  Provisión exclusiva de insumos y servicios técnicos de producción para diseñadores que buscan trascender lo ordinario.
                </p>

                <div className="flex flex-wrap gap-6 pt-10">
                  <Button
                    size="lg"
                    onClick={() => navigate('/productos')}
                    className="bg-brand-ink hover:bg-brand-ink/90 text-brand-ivory px-10 py-5 text-sm uppercase tracking-widest font-semibold transition-all hover:translate-y-[-2px] hover:shadow-2xl shadow-brand-ink/20"
                  >
                    Explorar Catálogo
                  </Button>
                  <button
                    onClick={() => navigate('/cotizar')}
                    className="group relative flex items-center space-x-3 py-5 px-4 text-sm uppercase tracking-widest font-semibold text-brand-ink border-b border-brand-ink transition-all hover:bg-brand-ink/5"
                  >
                    <span>Cotizar Servicio</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Product Image */}
          <div className="lg:col-span-4 hidden lg:flex justify-end opacity-0 animate-reveal" style={{ animationDelay: '0.5s' }}>
            <div className="relative w-80 h-[480px] overflow-hidden group">
              {/* Decorative frame */}
              <div className="absolute inset-0 border border-brand-ink/10 z-20 pointer-events-none transition-all duration-700 group-hover:inset-3" />

              {/* Main image */}
              <img
                src="/images/hero-hardware.jpg"
                alt="Detalle de herraje dorado en traje de baño"
                className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/40 via-transparent to-transparent opacity-60 z-10" />

              {/* Caption */}
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-ivory/80">
                  Herrajes Premium
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};