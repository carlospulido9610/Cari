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
    <section className="py-24 bg-brand-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-3 gap-6 overflow-hidden">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative p-10 transition-all duration-500 flex flex-col h-full bg-white rounded-2xl shadow-md hover:shadow-xl opacity-0 animate-reveal border border-brand-ink/5`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >

              <div className="relative z-10 space-y-12 h-full flex flex-col">
                <div className={`w-16 h-16 bg-brand-ivory border border-brand-ink/5 flex items-center justify-center rounded-full transition-all duration-500 group-hover:bg-brand-accent group-hover:border-brand-accent group-hover:rotate-[360deg] text-brand-ink group-hover:text-white`}>
                  {React.cloneElement(service.icon as React.ReactElement, { size: 24, strokeWidth: 1.5 })}
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-medium tracking-tight display-font text-brand-gold transition-colors duration-500">
                    {service.title}
                  </h3>
                  <p className="text-lg font-medium leading-relaxed text-brand-ink/70 transition-colors duration-500">
                    {service.description}
                  </p>
                </div>

                <div className="mt-auto pt-12">
                  <Link
                    to={service.linkPath}
                    className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-bold text-brand-ink group-hover:text-brand-accent transition-all duration-500"
                  >
                    — {service.linkText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};