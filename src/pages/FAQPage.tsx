import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Package, Truck, CreditCard, MessageCircle, Users, Shield, ShoppingBag } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqData: FAQItem[] = [
    // Productos y Materiales
    {
        category: 'Productos y Materiales',
        question: '¿Qué tipo de productos ofrecen?',
        answer: 'Ofrecemos una solución integral en insumos textiles. Nuestro catálogo incluye una amplia gama de telas de alta calidad, elásticas de diversas resistencias y herrajes especializados. También contamos con productos personalizables diseñados para uso industrial, comercial y personal.'
    },
    {
        category: 'Productos y Materiales',
        question: '¿De qué material están hechos los herrajes?',
        answer: 'Nuestros herrajes están fabricados con materiales de alta resistencia para garantizar durabilidad. Zamac: Una aleación premium (zinc, aluminio, magnesio y cobre) ideal por su resistencia a la corrosión y acabados estéticos. Aluminio: Utilizado en piezas ligeras y productos de ferretería por su versatilidad y ligereza.'
    },

    // Pedidos y Ventas al Mayor
    {
        category: 'Pedidos y Ventas al Mayor',
        question: '¿Atienden solo ventas minoristas o también mayoristas?',
        answer: 'Atendemos ambas modalidades. Nos especializamos en ventas al detal, pero ofrecemos precios especiales y descuentos por volumen para mayoristas. Puedes consultar los mínimos de compra en la descripción de cada producto.'
    },
    {
        category: 'Pedidos y Ventas al Mayor',
        question: '¿Cuál es el mínimo de compra mayorista para herrajes?',
        answer: 'Para acceder a precios de mayoreo en herrajes, el mínimo es de 50 unidades por modelo. El tiempo de procesamiento para estos pedidos es de 7 a 10 días hábiles.'
    },
    {
        category: 'Pedidos y Ventas al Mayor',
        question: '¿Hay un monto mínimo de compra?',
        answer: 'Tienda física y domicilios: Desde una unidad (sin mínimo). Envíos nacionales: El monto mínimo de compra es de $10. Nota: Cada producto tiene su propio mínimo especificado en el catálogo según el material.'
    },

    // Personalización y Garantía
    {
        category: 'Personalización y Garantía',
        question: '¿Ofrecen personalización de productos?',
        answer: 'Sí, ofrecemos servicios de estampado y grabado láser. Los productos aptos para personalizar están marcados claramente en el catálogo. El costo se cotiza de forma personalizada según el diseño, la cantidad y la técnica requerida.'
    },
    {
        category: 'Personalización y Garantía',
        question: '¿Los productos tienen garantía?',
        answer: 'Todos nuestros productos cuentan con garantía de calidad. Cada artículo es revisado minuciosamente antes de ser enviado. La garantía cubre exclusivamente defectos de fábrica y debe ser reportada en un plazo máximo de 5 días hábiles tras recibir el pedido. No cubre desgaste normal o uso inadecuado.'
    },

    // Pagos y Facturación
    {
        category: 'Pagos y Facturación',
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos transferencias bancarias y Pago Móvil en bolívares. También recibimos depósitos y pagos en efectivo (tanto en bolívares como en divisas extranjeras).'
    },
    {
        category: 'Pagos y Facturación',
        question: '¿Emiten factura?',
        answer: 'Sí, emitimos factura electrónica para todos los pedidos una vez confirmado el pago. Solo necesitamos tus datos fiscales completos al realizar la orden. Ten en cuenta que los precios del catálogo no incluyen el IVA.'
    },

    // Envíos y Entregas
    {
        category: 'Envíos y Entregas',
        question: '¿Cómo puedo realizar un pedido?',
        answer: 'Agrega los productos a tu carrito en nuestro catálogo web, completa el formulario y presiona el botón "Hacer pedido a través de WhatsApp". Un asesor validará tu pedido, confirmará el stock y te enviará las instrucciones de pago.'
    },
    {
        category: 'Envíos y Entregas',
        question: '¿Realizan envíos a todo el país y puedo rastrearlos?',
        answer: 'Sí, realizamos envíos nacionales exclusivamente a través de Zoom y MRW. Una vez despachado, recibirás tu número de guía por WhatsApp o correo para rastrear tu envío en tiempo real.'
    },
    {
        category: 'Envíos y Entregas',
        question: '¿Cuánto tiempo tarda la entrega?',
        answer: 'Productos en stock: Se despachan en 24 horas tras confirmar el pago. Domicilios (Área Metropolitana): 24 horas dependiendo de la disponibilidad. Productos personalizados o mayoristas: El tiempo de entrega es de 7 a 10 días hábiles.'
    }
];

const categories = [
    { name: 'Productos y Materiales', icon: Package },
    { name: 'Pedidos y Ventas al Mayor', icon: ShoppingBag },
    { name: 'Personalización y Garantía', icon: Shield },
    { name: 'Pagos y Facturación', icon: CreditCard },
    { name: 'Envíos y Entregas', icon: Truck }
];

export const FAQPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('General');

    const filteredFAQs = faqData.filter(faq => faq.category === activeCategory);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[#fdfdfd] pt-20 pb-10 md:pt-24 md:pb-16 relative overflow-hidden">
            {/* Ambient Background Elements - Light Theme */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#44b6da]/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1e3857]/5 rounded-full blur-[120px] animation-delay-2000"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-10 md:mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-[#f0f9ff] to-[#e0f2fe] rounded-2xl mb-4 md:mb-6 shadow-xl shadow-blue-900/5 transform rotate-3 hover:rotate-0 transition-transform duration-300 border border-white">
                        <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-[#1e3857]" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-[#1e3857] mb-4 md:mb-6 tracking-tight">
                        Preguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#44b6da] to-[#1e3857]">Frecuentes</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
                        Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios textiles.
                    </p>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 animate-fade-in-up animation-delay-300">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.name;
                        return (
                            <button
                                key={cat.name}
                                onClick={() => {
                                    setActiveCategory(cat.name);
                                    setOpenIndex(null);
                                }}
                                className={`
                                    group flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-sm transition-all duration-300 border
                                    ${isActive
                                        ? 'bg-[#1e3857] border-[#1e3857] text-white shadow-lg shadow-[#1e3857]/20 translate-y-[-2px]'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3 md:space-y-4 animate-fade-in-up animation-delay-500">
                    {filteredFAQs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`
                                    group relative rounded-2xl transition-all duration-300 border
                                    ${isOpen
                                        ? 'bg-white border-[#44b6da]/30 shadow-xl shadow-slate-200/50'
                                        : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100'
                                    }
                                `}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-5 py-4 md:px-8 md:py-6 flex items-center justify-between text-left transition-all duration-300"
                                >
                                    <span className={`text-base md:text-lg font-bold tracking-tight transition-colors duration-300 pr-4 ${isOpen ? 'text-[#1e3857]' : 'text-slate-700 group-hover:text-[#1e3857]'}`}>
                                        {faq.question}
                                    </span>
                                    <div className={`
                                        w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0
                                        ${isOpen ? 'bg-[#44b6da] text-white rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-[#e0f2fe] group-hover:text-[#44b6da]'}
                                    `}>
                                        <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                </button>

                                <div
                                    className={`
                                        overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                                        ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                                    `}
                                >
                                    <div className="px-5 pb-5 md:px-8 md:pb-8">
                                        <p className="text-slate-600 leading-relaxed text-sm md:text-base font-light">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Contact CTA */}
                <div className="mt-12 md:mt-20 relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-center animate-fade-in-up animation-delay-700 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
                    {/* Decorative blobs inside CTA */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#44b6da]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1e3857]/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#e0f2fe] rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-[#44b6da]/20 rotate-3">
                            <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-[#1e3857]" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-[#1e3857] mb-2 md:mb-3 tracking-tight">
                            ¿Aún tienes dudas?
                        </h3>
                        <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8 max-w-lg font-light">
                            Nuestro equipo experto en textiles está a un mensaje de distancia para asesorarte de forma personalizada.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center w-full sm:w-auto">
                            <a
                                href="/contacto"
                                className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 bg-[#1e3857] hover:bg-[#0f172a] text-white text-sm md:text-base font-bold rounded-full transition-all duration-300 shadow-xl shadow-[#1e3857]/20 hover:scale-105"
                            >
                                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                                Hablar con un Experto
                            </a>
                            <a
                                href="/cotizar"
                                className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 bg-white hover:bg-slate-50 text-[#1e3857] text-sm md:text-base font-bold rounded-full transition-all duration-300 border-2 border-slate-100 hover:border-[#44b6da]/30 hover:shadow-lg"
                            >
                                Solicitar Cotización
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
