import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    X,
    Upload,
    Save,
    Trash2,
    ArrowLeft,
    MousePointer2,
    Search,
    Loader2
} from 'lucide-react';
import {
    fetchProducts,
    uploadProductImage,
    createLook,
    fetchLooks,
    deleteLook
} from '../../services/supabaseClient';
import { Product, Look, Hotspot } from '../../../types';
import { Button } from '../../../components/Button';

export const ConfiguradorShopTheLook: React.FC = () => {
    const navigate = useNavigate();
    const [looks, setLooks] = useState<Look[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [looksData, productsData] = await Promise.all([
            fetchLooks(),
            fetchProducts()
        ]);
        setLooks(looksData);
        setProducts(productsData);
        setLoading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setHotspots([]); // Reset hotspots for new image
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newHotspot: Hotspot = {
            id: crypto.randomUUID(),
            x: parseFloat(x.toFixed(2)),
            y: parseFloat(y.toFixed(2)),
            productId: '' // Initially empty, user must select product
        };

        setHotspots([...hotspots, newHotspot]);
        setActiveHotspotId(newHotspot.id);
    };

    const handleProductSelect = (hotspotId: string, productId: string) => {
        setHotspots(hotspots.map(h =>
            h.id === hotspotId ? { ...h, productId } : h
        ));
    };

    const removeHotspot = (id: string) => {
        setHotspots(hotspots.filter(h => h.id !== id));
        if (activeHotspotId === id) setActiveHotspotId(null);
    };

    const handleSaveLook = async () => {
        if (!title.trim() || !selectedFile) {
            alert('Por favor agrega un título y selecciona una imagen.');
            return;
        }

        if (hotspots.length === 0) {
            alert('Agrega al menos un punto (hotspot) a la imagen.');
            return;
        }

        if (hotspots.some(h => !h.productId)) {
            alert('Todos los puntos deben tener un producto vinculado.');
            return;
        }

        setIsSaving(true);
        try {
            const imageUrl = await uploadProductImage(selectedFile);
            if (!imageUrl) throw new Error('Error al subir la imagen');

            const lookData: Omit<Look, 'id'> = {
                title,
                image_url: imageUrl,
                hotspots,
                order_index: looks.length
            };

            const result = await createLook(lookData);
            if (result) {
                alert('Look guardado correctamente');
                // Reset form
                setTitle('');
                setSelectedFile(null);
                setImagePreview('');
                setHotspots([]);
                loadData();
            }
        } catch (error) {
            console.error('Error saving look:', error);
            alert('Error al guardar el look');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteLook = async (id: string) => {
        if (window.confirm('¿Confirmar eliminación de este look?')) {
            const success = await deleteLook(id);
            if (success) {
                loadData();
            } else {
                alert('Error al eliminar el look');
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Panel
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">Configurador Shop The Look</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Editor Column */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                Crear Nuevo Look
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Title and Image Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Título del Look</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Estilo de Verano"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Imagen</label>
                                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                                        <Upload className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-600">{selectedFile ? selectedFile.name : 'Subir Imagen'}</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                    </label>
                                </div>
                            </div>

                            {/* Interactive Image Area */}
                            {imagePreview ? (
                                <div className="space-y-4">
                                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2">
                                            <MousePointer2 className="w-3.5 h-3.5 text-blue-600" />
                                            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Haz clic para añadir puntos</span>
                                        </div>

                                        <img
                                            ref={imageRef}
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full cursor-crosshair select-none"
                                            onClick={handleImageClick}
                                        />

                                        {/* Render Hotspots */}
                                        {hotspots.map((spot) => (
                                            <div
                                                key={spot.id}
                                                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group/spot
                                                ${activeHotspotId === spot.id ? 'z-30' : ''}`}
                                                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveHotspotId(spot.id);
                                                    }}
                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl
                                                    ${activeHotspotId === spot.id
                                                            ? 'bg-blue-600 border-white text-white scale-110'
                                                            : 'bg-white/80 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>

                                                {/* Tooltip for product name if linked */}
                                                {spot.productId && (
                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/spot:opacity-100 transition-opacity">
                                                        {products.find(p => p.id === spot.productId)?.name}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setImagePreview('');
                                                setSelectedFile(null);
                                                setHotspots([]);
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                            onClick={handleSaveLook}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Guardar Todo
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                                    <Upload className="w-12 h-12 text-slate-300 mb-4" />
                                    <p className="text-slate-400 font-medium text-center px-8">
                                        Primero sube una imagen para empezar a configurar los puntos de interés.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Hotspot Configuration */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Vincular Productos</h3>
                        </div>

                        <div className="p-4 h-[600px] flex flex-col">
                            {activeHotspotId ? (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-xs font-bold text-blue-600 uppercase">Punto Seleccionado</div>
                                        <button
                                            onClick={() => removeHotspot(activeHotspotId)}
                                            className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar producto..."
                                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {filteredProducts.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleProductSelect(activeHotspotId, product.id)}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all text-left
                                                ${hotspots.find(h => h.id === activeHotspotId)?.productId === product.id
                                                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                                                        : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                            >
                                                <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                                                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{product.name}</p>
                                                    <p className="text-[10px] text-slate-500">{product.sku}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <MousePointer2 className="w-10 h-10 mb-4" />
                                    <p className="text-sm font-medium">Selecciona un punto en la imagen para vincular un producto.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Published Looks List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Looks Publicados</h3>
                        </div>
                        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                            {looks.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 py-8">No hay looks publicados aún.</p>
                            ) : (
                                looks.map((look) => (
                                    <div key={look.id} className="group relative rounded-xl overflow-hidden border border-slate-200">
                                        <img src={look.image_url} alt={look.title} className="w-full aspect-video object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                                            <p className="text-white font-bold text-sm truncate">{look.title}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-[10px] text-white/70">{look.hotspots.length} productos</p>
                                                <button
                                                    onClick={() => handleDeleteLook(look.id)}
                                                    className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
