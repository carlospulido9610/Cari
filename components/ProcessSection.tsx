import React from 'react';
import { Sparkles, Factory } from 'lucide-react';

export const ProcessSection: React.FC = () => {
    return (
        <section className="py-32 bg-brand-ivory relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-ink/5 to-transparent" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-brand-ink/5 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20 opacity-0 animate-reveal">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-ink/40 mb-4">
                        Nuestro Proceso
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-brand-ink tracking-tight display-font">
                        Del <span className="font-bold">diseño</span> a la <span className="font-bold">realidad</span>
                    </h2>
                </div>

                {/* Asymmetric Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

                    {/* Left: Design/Sketches - Larger */}
                    <div className="lg:col-span-7 opacity-0 animate-reveal" style={{ animationDelay: '0.1s' }}>
                        <div className="group relative h-[400px] md:h-[550px] overflow-hidden rounded-sm bg-brand-ink/5">
                            {/* Frame effect */}
                            <div className="absolute inset-0 border border-brand-ink/10 z-20 pointer-events-none transition-all duration-700 group-hover:inset-4" />

                            <img
                                src="/images/process-sketches.jpg"
                                alt="Bocetos de diseño y muestras de tela"
                                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-brand-ink/20 to-transparent z-10" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-brand-accent/90 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/80">
                                        Fase 01
                                    </p>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-medium text-white display-font mb-3">
                                    Diseño Creativo
                                </h3>
                                <p className="text-sm text-white/90 max-w-md leading-relaxed">
                                    Cada proyecto comienza con bocetos detallados, selección de paletas de color y muestras de tela que dan vida a tu visión.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Workshop - Smaller */}
                    <div className="lg:col-span-5 opacity-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
                        <div className="group relative h-[400px] md:h-[550px] overflow-hidden rounded-sm bg-brand-ink/5">
                            {/* Frame effect */}
                            <div className="absolute inset-0 border border-brand-ink/10 z-20 pointer-events-none transition-all duration-700 group-hover:inset-4" />

                            <img
                                src="/images/process-workshop.jpg"
                                alt="Taller de confección con máquinas industriales"
                                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-brand-ink/20 to-transparent z-10" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-brand-gold/90 rounded-full flex items-center justify-center">
                                        <Factory className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/80">
                                        Fase 02
                                    </p>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-medium text-white display-font mb-3">
                                    Producción de Excelencia
                                </h3>
                                <p className="text-sm text-white/90 max-w-md leading-relaxed">
                                    Maquinaria de última generación y artesanos expertos transforman cada diseño en piezas impecables.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
