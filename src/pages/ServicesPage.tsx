import React from 'react';
import { ServicesSection } from '../../components/ServicesSection';
import { CheckCircle2, MessageSquare, Rocket, Sparkles, Layout, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ServicesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand-ivory">
            {/* Hero Section - Refined Editorial */}
            <section className="relative pt-40 pb-24 md:pt-60 md:pb-40 overflow-hidden bg-brand-ivory">
                {/* Minimal Background Geometry */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-px h-full bg-brand-ink/5" />
                    <div className="absolute top-1/2 left-0 w-full h-px bg-brand-ink/5" />
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                    <div className="max-w-4xl">


                        <h1 className="text-5xl md:text-8xl font-medium text-brand-gold mb-10 tracking-tight leading-[1.05] display-font opacity-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
                            Elevamos tu producción <br />
                            <span className="font-bold">al siguiente nivel.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-brand-ink/60 leading-relaxed mb-12 max-w-2xl font-medium opacity-0 animate-reveal" style={{ animationDelay: '0.3s' }}>
                            Desde el diseño conceptual hasta la entrega final, proporcionamos la infraestructura y los insumos técnicos que las marcas de lujo necesitan.
                        </p>

                        <div className="flex flex-wrap gap-8 opacity-0 animate-reveal" style={{ animationDelay: '0.4s' }}>
                            <Link to="/contacto" className="px-10 py-5 bg-brand-ink text-brand-ivory text-xs uppercase tracking-widest font-bold transition-all hover:bg-brand-ink/90 hover:translate-y-[-2px] shadow-xl shadow-brand-ink/10 rounded-full">
                                Iniciar Proyecto
                            </Link>
                            <a href="#proceso" className="group flex items-center space-x-4 px-4 py-5 text-xs uppercase tracking-widest font-bold text-brand-ink border-b border-brand-ink/10 transition-all hover:border-brand-ink">
                                <span>Nuestro Proceso</span>
                                <Rocket className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Services Grid */}
            <div id="servicios" className="py-32 bg-brand-ivory border-t border-brand-ink/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center space-x-3 mb-4">
                            <span className="h-[1px] w-4 bg-brand-accent"></span>
                            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-ink/40 display-font">Excelencia</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium text-brand-ink display-font">Nuestras Especialidades</h2>
                    </div>
                    <p className="text-brand-ink/50 max-w-md font-medium text-lg">Combinamos precisión técnica con materiales de la más alta calidad para ofrecer resultados excepcionales y consistentes.</p>
                </div>
                <ServicesSection />
            </div>

            {/* Process Section - Editorial Grid */}
            <section id="proceso" className="py-32 bg-brand-ink text-brand-ivory relative overflow-hidden">
                {/* Decorative textures overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:40px_40px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
                        <div className="lg:col-span-4">
                            <div className="sticky top-40">
                                <h2 className="text-4xl md:text-6xl font-medium mb-8 display-font tracking-tight">
                                    ¿Cómo <br />
                                    <span className="font-bold">trabajamos?</span>
                                </h2>
                                <p className="text-brand-ivory/60 text-lg leading-relaxed font-medium">
                                    Un proceso simplificado diseñado para garantizar la calidad suprema en cada etapa del desarrollo.
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-12">
                            {[
                                { step: "01", title: "Asesoría Técnica", desc: "Entendemos tus necesidades y definimos los mejores materiales para tu colección.", icon: <MessageSquare /> },
                                { step: "02", title: "Prototipado", desc: "Creamos muestras físicas para validar el diseño y la funcionalidad antes de la producción.", icon: <Layout /> },
                                { step: "03", title: "Estandarización", desc: "Garantizamos la consistencia en cada pieza utilizando procesos industriales optimizados.", icon: <Rocket /> },
                                { step: "04", title: "Control de Calidad", desc: "Inspeccionamos minuciosamente cada detalle para asegurar la excelencia en el acabado.", icon: <CheckCircle2 /> }
                            ].map((item, idx) => (
                                <div key={idx} className="group relative grid grid-cols-1 md:grid-cols-12 gap-6 pb-12 border-b border-brand-ivory/10 last:border-0 hover:bg-brand-ivory/[0.02] transition-colors p-4 -m-4 rounded-xl">
                                    <div className="md:col-span-2 flex items-start justify-between md:justify-start">
                                        <span className="text-5xl font-medium text-brand-ivory/10 group-hover:text-brand-accent/40 transition-colors">{item.step}</span>
                                        <div className="text-brand-accent p-3 bg-brand-accent/10 rounded-full md:hidden">
                                            {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                                        </div>
                                    </div>
                                    <div className="md:col-span-8 space-y-3">
                                        <h3 className="text-2xl font-medium display-font group-hover:text-white transition-colors">{item.title}</h3>
                                        <p className="text-brand-ivory/50 font-medium leading-relaxed max-w-lg">{item.desc}</p>
                                    </div>
                                    <div className="md:col-span-2 hidden md:flex justify-end items-start pt-2">
                                        <div className="text-brand-accent p-4 bg-brand-accent/10 rounded-full opacity-40 group-hover:opacity-100 transition-opacity">
                                            {React.cloneElement(item.icon as React.ReactElement, { className: 'w-6 h-6' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Refined & Compact */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center space-x-3 mb-10">
                        <span className="h-[1px] w-12 bg-brand-ink/10"></span>
                        <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-brand-ink/30 px-4">Contact Strategy</span>
                        <span className="h-[1px] w-12 bg-brand-ink/10"></span>
                    </div>

                    <h2 className="text-4xl md:text-7xl font-medium text-brand-ink mb-10 tracking-tight display-font">
                        ¿Listo para <span className="font-bold">transformar</span> tu marca?
                    </h2>

                    <p className="text-lg md:text-xl text-brand-ink/50 mb-14 max-w-2xl mx-auto leading-relaxed font-medium">
                        Únete a las marcas líderes que confían en nuestra infraestructura para llevar sus diseños a la realidad internacional.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                        <Link to="/contacto" className="w-full sm:w-auto px-12 py-5 bg-brand-ink text-brand-ivory text-xs uppercase tracking-widest font-bold shadow-2xl shadow-brand-ink/10 hover:translate-y-[-2px] transition-all rounded-full">
                            Iniciar Colaboración
                        </Link>
                        <Link to="/cotizar" className="w-full sm:w-auto px-12 py-5 bg-transparent text-brand-ink border border-brand-ink/10 text-xs uppercase tracking-widest font-bold hover:bg-brand-ink hover:text-brand-ivory transition-all rounded-full">
                            Pedir Cotización
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
