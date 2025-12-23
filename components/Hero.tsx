import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative pt-24 pb-20 overflow-hidden bg-[#fdfdfd]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#44b6da]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] left-[-20%] w-[600px] h-[600px] bg-[#1e3857]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">

        {/* Text Content */}
        <div className="space-y-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Elevamos tu marca con insumos y <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#44b6da] to-[#1e3857]">soluciones textiles de alta calidad.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-normal">
            De la conceptualización a la realidad: acompañamos el crecimiento de diseñadores y empresas de moda a través de la provisión de insumos y servicios técnicos de producción con altos estándares.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              size="lg"
              onClick={() => navigate('/productos')}
              className="bg-[#020617] hover:bg-[#020617]/90 text-white px-8 py-4 text-base font-bold rounded-full shadow-xl shadow-slate-900/10 transition-all hover:scale-105"
            >
              Ver Catálogo
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/cotizar')}
              className="px-8 py-4 text-base font-bold rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
            >
              Cotizar Servicio
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};