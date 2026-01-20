import React, { useState, useEffect, useRef } from 'react';
import { Look, Hotspot, Product } from '../../types';
import { fetchLooks, createLook, updateLook, deleteLook, uploadProductImage } from '../../services/supabaseClient';
import { Plus, Trash2, Edit2, Save, X, Target, Image as ImageIcon } from 'lucide-react';
import { Button } from '../Button';

interface Props {
    products: Product[];
}

export const ShopTheLookEditor: React.FC<Props> = ({ products }) => {
    const [looks, setLooks] = useState<Look[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingLook, setEditingLook] = useState<Partial<Look> | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeHotspotIndex, setActiveHotspotIndex] = useState<number | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        loadLooks();
    }, []);

    const loadLooks = async () => {
        setLoading(true);
        const data = await fetchLooks();
        setLooks(data);
        setLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const url = await uploadProductImage(file);
        setIsUploading(false);

        if (url) {
            setEditingLook(prev => ({ ...prev, image_url: url }));
        }
    };

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!editingLook || !imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newHotspot: Hotspot = {
            id: crypto.randomUUID(),
            x: Math.round(x * 100) / 100,
            y: Math.round(y * 100) / 100,
            productId: products[0]?.id || ''
        };

        const currentHotspots = editingLook.hotspots || [];
        setEditingLook({
            ...editingLook,
            hotspots: [...currentHotspots, newHotspot]
        });
        setActiveHotspotIndex(currentHotspots.length);
    };

    const updateHotspotProduct = (index: number, productId: string) => {
        if (!editingLook || !editingLook.hotspots) return;
        const newHotspots = [...editingLook.hotspots];
        newHotspots[index] = { ...newHotspots[index], productId };
        setEditingLook({ ...editingLook, hotspots: newHotspots });
    };

    const removeHotspot = (index: number) => {
        if (!editingLook || !editingLook.hotspots) return;
        const newHotspots = editingLook.hotspots.filter((_, i) => i !== index);
        setEditingLook({ ...editingLook, hotspots: newHotspots });
        setActiveHotspotIndex(null);
    };

    const handleSave = async () => {
        if (!editingLook?.image_url) {
            alert('La imagen es obligatoria');
            return;
        }

        const lookData = {
            image_url: editingLook.image_url,
            title: editingLook.title || '',
            hotspots: editingLook.hotspots || [],
            order_index: editingLook.order_index || looks.length
        };

        let result;
        if (editingLook.id) {
            result = await updateLook(editingLook.id, lookData);
        } else {
            result = await createLook(lookData);
        }

        if (result) {
            setEditingLook(null);
            loadLooks();
        } else {
            alert('Error al guardar el look');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este look?')) return;
        const success = await deleteLook(id);
        if (success) loadLooks();
    };

    if (loading) return <div className="p-8 text-center text-slate-500 italic">Cargando Looks...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Shop The Look</h2>
                {!editingLook && (
                    <Button onClick={() => setEditingLook({ hotspots: [], title: '', order_index: looks.length })}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Look
                    </Button>
                )}
            </div>

            {editingLook ? (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-semibold text-slate-800">
                            {editingLook.id ? 'Editar Look' : 'Crear Nuevo Look'}
                        </h3>
                        <button onClick={() => setEditingLook(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image Preview & Hotspot Placement */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Imagen del Look</label>
                            {editingLook.image_url ? (
                                <div
                                    className="relative rounded-xl overflow-hidden cursor-crosshair border-2 border-slate-100 shadow-inner group"
                                    onClick={handleImageClick}
                                >
                                    <img
                                        ref={imageRef}
                                        src={editingLook.image_url}
                                        alt="Preview"
                                        className="w-full h-auto block select-none"
                                    />
                                    {/* Edit Overlay */}
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none" />

                                    {/* Render Hotspots */}
                                    {editingLook.hotspots?.map((spot, idx) => (
                                        <div
                                            key={spot.id}
                                            className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-lg
                                                ${activeHotspotIndex === idx ? 'bg-blue-600 border-white scale-110 z-20' : 'bg-white/80 border-blue-600 z-10'}`}
                                            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveHotspotIndex(idx);
                                            }}
                                        >
                                            <span className={`text-xs font-bold ${activeHotspotIndex === idx ? 'text-white' : 'text-blue-600'}`}>
                                                {idx + 1}
                                            </span>
                                        </div>
                                    ))}

                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Haz clic en la imagen para añadir un punto
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-[4/5] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-4 text-slate-400">
                                    <ImageIcon className="w-12 h-12 opacity-20" />
                                    <p className="text-sm">No hay imagen seleccionada</p>
                                    <label className="cursor-pointer">
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        <span className="text-blue-600 font-medium hover:underline">Subir Imagen</span>
                                    </label>
                                </div>
                            )}

                            {editingLook.image_url && (
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-3 text-center transition-colors">
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        <span className="text-sm font-medium text-slate-600 flex items-center justify-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            {isUploading ? 'Subiendo...' : 'Cambiar Imagen'}
                                        </span>
                                    </label>
                                    <button
                                        onClick={() => setEditingLook({ ...editingLook, image_url: '' })}
                                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Configuration */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título (Opcional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingLook.title || ''}
                                    onChange={(e) => setEditingLook({ ...editingLook, title: e.target.value })}
                                    placeholder="Ej: Detalle de Herraje"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-slate-700">Puntos del Look ({editingLook.hotspots?.length || 0})</label>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Configuración de Productos</p>
                                </div>

                                {editingLook.hotspots && editingLook.hotspots.length > 0 ? (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {editingLook.hotspots.map((spot, idx) => (
                                            <div
                                                key={spot.id}
                                                className={`p-4 border rounded-xl transition-all ${activeHotspotIndex === idx ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 hover:border-slate-300'}`}
                                                onClick={() => setActiveHotspotIndex(idx)}
                                            >
                                                <div className="flex justify-between items-start gap-4 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${activeHotspotIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-500">Posición: {spot.x}%, {spot.y}%</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeHotspot(idx); }}
                                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <select
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={spot.productId}
                                                    onChange={(e) => updateHotspotProduct(idx, e.target.value)}
                                                >
                                                    <option value="">Seleccionar Producto</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center rounded-xl border-2 border-dashed border-slate-100 text-slate-400">
                                        <Target className="w-10 h-10 mx-auto mb-2 opacity-10" />
                                        <p className="text-sm">Haz clic en la imagen para añadir puntos de venta</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex gap-4">
                                <Button className="flex-1" onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar Look
                                </Button>
                                <Button variant="outline" onClick={() => setEditingLook(null)}>
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {looks.map((look) => (
                        <div key={look.id} className="group bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="aspect-[4/5] relative overflow-hidden">
                                <img src={look.image_url} alt={look.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-white font-bold text-lg leading-tight truncate">{look.title || 'Sin título'}</p>
                                    <p className="text-white/70 text-sm mt-1">{look.hotspots.length} puntos seleccionados</p>
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                    <button
                                        onClick={() => setEditingLook(look)}
                                        className="p-2.5 bg-white text-slate-800 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(look.id)}
                                        className="p-2.5 bg-white text-red-600 rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {looks.length === 0 && (
                        <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400">
                            <ImageIcon className="w-16 h-16 opacity-10" />
                            <div className="text-center">
                                <p className="text-lg font-medium text-slate-600">No hay looks configurados</p>
                                <p className="text-sm">Comienza añadiendo tu primer look para la portada.</p>
                            </div>
                            <Button onClick={() => setEditingLook({ hotspots: [], title: '', order_index: 0 })} className="mt-4">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Primer Look
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Simple Upload helper
const Upload = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
