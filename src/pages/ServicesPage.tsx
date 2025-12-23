import React from 'react';
import { ServicesSection } from '../../components/ServicesSection';
import { CheckCircle2, MessageSquare, Rocket, Sparkles, Layout, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ServicesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#fdfdfd]">
            {/* Hero Section - Light background with decorative blobs */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-[#fdfdfd]">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#44b6da]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                    <div className="absolute top-[20%] left-[-20%] w-[600px] h-[600px] bg-[#1e3857]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#44b6da]/10 border border-[#44b6da]/20 text-[#44b6da] text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Soluciones de Clase Mundial</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tighter leading-tight">
                            Elevamos tu producción al <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#44b6da] to-[#1e3857] font-black">siguiente nivel</span>.
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">
                            Desde el diseño conceptual hasta la entrega final, proporcionamos la infraestructura y los insumos técnicos que las marcas premium necesitan para destacar.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/contacto" className="px-8 py-4 bg-[#1e3857] hover:bg-[#0f172a] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#1e3857]/20 hover:scale-105">
                                Iniciar Proyecto
                            </Link>
                            <a href="#proceso" className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold transition-all">
                                Nuestro Proceso
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Services Grid */}
            <div id="servicios" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Nuestras Especialidades</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">Combinamos precisión técnica con materiales de la más alta calidad para ofrecer resultados excepcionales.</p>
                </div>
                <ServicesSection />
            </div>

            {/* Process Section - Clean Structured Layout */}
            <section id="proceso" className="py-24 bg-[#fdfdfd] border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">¿Cómo trabajamos?</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Un proceso simplificado diseñado para garantizar la calidad en cada etapa del desarrollo.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Asesoría Técnica", desc: "Entendemos tus necesidades y definimos los mejores materiales para tu colección.", icon: <MessageSquare /> },
                            { step: "02", title: "Prototipado", desc: "Creamos muestras físicas para validar el diseño y la funcionalidad antes de la producción.", icon: <Layout /> },
                            { step: "03", title: "Estandarización", desc: "Garantizamos la consistencia en cada pieza utilizando procesos industriales optimizados.", icon: <Rocket /> },
                            { step: "04", title: "Control de Calidad", desc: "Inspeccionamos minuciosamente cada detalle para asegurar la excelencia en el acabado.", icon: <CheckCircle2 /> }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-[#44b6da] mb-6 p-4 bg-[#44b6da]/5 rounded-2xl w-fit">
                                    {item.icon}
                                </div>
                                <span className="text-sm font-bold text-[#44b6da] mb-2 block">{item.step}</span>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Brand Visual Focus */}
            <section className="py-16 md:py-20 px-4">
                <div className="max-w-4xl mx-auto bg-[#1e3857] rounded-[2.5rem] p-10 md:p-14 text-center relative overflow-hidden">
                    {/* Background Accents for CTA */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#44b6da]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#44b6da]/5 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            ¿Listo para <span className="text-[#44b6da]">transformar</span> tu marca?
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Únete a las cientos de marcas que confían en nuestra experiencia para llevar sus diseños a la realidad.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/contacto" className="px-8 py-4 bg-[#44b6da] hover:bg-[#39a5c8] text-white rounded-2xl font-bold transition-all hover:scale-105">
                                Contáctanos ahora
                            </Link>
                            <Link to="/cotizar" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-bold transition-all backdrop-blur-sm">
                                Pedir Cotización
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
