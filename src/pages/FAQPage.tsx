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
        <div className="min-h-screen bg-brand-ivory pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
            {/* Background Details */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-1/4 w-px h-full bg-brand-ink/5" />
                <div className="absolute bottom-1/3 left-0 w-full h-px bg-brand-ink/5" />
            </div>

            <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">

                {/* Header */}
                <div className="text-center mb-24 opacity-0 animate-reveal" style={{ animationDelay: '0.1s' }}>

                    <h1 className="text-4xl md:text-6xl font-medium text-brand-ink display-font mb-6">
                        Preguntas <span className="font-bold">frecuentes</span>
                    </h1>
                    <p className="text-brand-ink/40 font-light text-lg max-w-2xl mx-auto">
                        Resolviendo sus dudas técnicas sobre insumos, tiempos de despacho y procesos de personalización de alto nivel.
                    </p>
                </div>

                {/* Category Filters - Minimal */}
                <div className="flex flex-wrap justify-center gap-3 mb-16 opacity-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
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
                                    px-6 py-3 text-[10px] uppercase tracking-widest font-bold border transition-all duration-300
                                    ${isActive
                                        ? 'border-brand-ink bg-brand-ink text-brand-ivory'
                                        : 'border-brand-ink/5 text-brand-ink/40 hover:border-brand-ink/20'
                                    }
                                `}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* FAQ Accordion - Minimal Editorial */}
                <div className="space-y-0 opacity-0 animate-reveal" style={{ animationDelay: '0.3s' }}>
                    {filteredFAQs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`border-b border-brand-ink/5 transition-colors duration-500 ${isOpen ? 'bg-brand-ink/[0.01]' : ''}`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full py-8 flex items-center justify-between text-left group"
                                >
                                    <span className={`text-lg md:text-xl font-medium display-font transition-colors duration-300 pr-8 ${isOpen ? 'text-brand-ink' : 'text-brand-ink/60 group-hover:text-brand-ink'}`}>
                                        {faq.question}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-brand-ink/20 transition-transform duration-500 ${isOpen ? 'rotate-180 text-brand-accent' : ''}`} />
                                </button>

                                <div
                                    className={`
                                        overflow-hidden transition-all duration-500 ease-in-out
                                        ${isOpen ? 'max-h-[500px] pb-8' : 'max-h-0'}
                                    `}
                                >
                                    <p className="text-brand-ink/50 leading-relaxed font-light text-lg">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Contact CTA - Premium Finish */}
                <div className="mt-48 opacity-0 animate-reveal" style={{ animationDelay: '0.4s' }}>
                    <div className="relative p-12 md:p-20 text-center bg-brand-ink rounded-sm overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent"></div>

                        <div className="relative z-10 space-y-8 flex flex-col items-center">
                            <h3 className="text-3xl md:text-5xl font-medium text-brand-ivory display-font">
                                ¿Requiere asistencia <span className="font-bold">personalizada?</span>
                            </h3>
                            <p className="text-brand-ivory/40 max-w-xl text-lg font-light leading-relaxed">
                                Nuestros consultores técnicos están disponibles para orientar su elección de insumos según las necesidades de su marca.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto pt-4">
                                <a
                                    href="/contacto"
                                    className="px-12 py-5 bg-brand-ivory text-brand-ink text-[10px] uppercase tracking-[0.5em] font-bold hover:translate-y-[-2px] transition-all shadow-2xl"
                                >
                                    Hablar con el Centro Técnico
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
