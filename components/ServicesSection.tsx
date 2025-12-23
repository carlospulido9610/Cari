import React from 'react';
import { Shirt, Scissors, Ruler, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: <Shirt className="w-8 h-8" />,
    title: "Insumos y Herrajes",
    description: "Accesorios premium (metálicos y plásticos) diseñados para resistir y destacar en trajes de baño y prendas de vestir.",
    linkText: "Ver Catálogo",
    linkPath: "/productos",
    active: false
  },
  {
    icon: <Tag className="w-8 h-8" />,
    title: "Identidad de Marca",
    description: "Placas identificadoras, etiquetas y packaging especializado que dan el toque final de lujo a cada pieza.",
    linkText: "Personalizar",
    linkPath: "/servicios",
    active: true // Highlighted
  },
  {
    icon: <Ruler className="w-8 h-8" />,
    title: "Confección", // Changed from Servicios de Maquila
    description: "Soluciones integrales de patronaje, corte y confección técnica para marcas que exigen precisión.",
    linkText: "Conocer Taller",
    linkPath: "/servicios",
    active: false
  }
];

export const ServicesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid md:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative rounded-3xl p-8 transition-all duration-500 flex flex-col h-full border ${service.active
                ? 'bg-[#1e3857] border-[#1e3857] text-white shadow-2xl scale-[1.02]'
                : 'bg-white border-slate-100 text-slate-900 hover:border-[#44b6da]/20 hover:shadow-xl hover:-translate-y-1'
                }`}
            >
              {/* Decorative accent for non-active cards */}
              {!service.active && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#44b6da]/5 rounded-bl-[5rem] -mr-8 -mt-8 transition-all group-hover:bg-[#44b6da]/10" />
              )}

              <div className={`mb-8 p-5 rounded-2xl inline-block w-fit transition-transform duration-500 group-hover:scale-110 ${service.active
                ? 'bg-[#44b6da]/10 text-[#44b6da]'
                : 'bg-slate-50 text-[#1e3857]'
                }`}>
                {service.icon}
              </div>

              <h3 className="text-2xl font-bold mb-4 tracking-tight">
                {service.title}
              </h3>

              <p className={`text-base mb-10 leading-relaxed ${service.active ? 'text-slate-300' : 'text-slate-600'
                }`}>
                {service.description}
              </p>

              <div className="mt-auto">
                <Link
                  to={service.linkPath}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${service.active
                    ? 'bg-[#44b6da] text-white hover:bg-[#39a5c8]'
                    : 'bg-[#1e3857] text-white hover:bg-[#0f172a]'
                    }`}
                >
                  {service.linkText}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};