import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchProducts, createProduct, updateProduct, deleteProduct,
    fetchCategories, createCategory, updateCategory, deleteCategory,
    uploadProductImage, fetchContacts, fetchQuotes, deleteContact, deleteQuote,
    updateContact, updateQuote, fetchProductById, signOut
} from '../../services/supabaseClient';
import { Product, Category, ProductVariant, ContactEntry, QuoteEntry } from '../../../types';
import { Button } from '../../../components/Button';
import { Plus, Edit, Trash2, LogOut, CheckCircle, XCircle, Upload, Folder, Package, Search, Filter, MessageSquare, FileText, Scissors, ChevronUp, ChevronDown, ArrowUpDown, Eye, Download, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

type TabType = 'products' | 'categories' | 'contacts' | 'quotes' | 'service_quotes';

// Helper to safely handle number inputs (allows empty string while editing)
// Returns undefined if empty (for Partial<T>) or parses number
const parseNumberInput = (value: string): number | undefined => {
    if (value === '') return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
};

// Export Handler
const handleExport = async (
    config: { format: 'excel' | 'pdf', includeImages: boolean, categoryId: string, maxStock: string },
    allProducts: Product[],
    categories: Category[],
    setLoading: (l: boolean) => void,
    onClose: () => void
) => {
    setLoading(true);
    // 1. Filter Products
    let exportList = [...allProducts];

    // Filter by Category
    if (config.categoryId !== 'all') {
        exportList = exportList.filter(p => p.category_id === config.categoryId);
    }

    // Filter by Max Stock (Minimo de stock interpretation: "stock <= X")
    if (config.maxStock !== '') {
        const threshold = parseInt(config.maxStock);
        if (!isNaN(threshold)) {
            exportList = exportList.filter(p => (p.stock || 0) <= threshold);
        }
    }

    if (exportList.length === 0) {
        alert('No hay productos que coincidan con los filtros de exportación.');
        setLoading(false);
        return;
    }

    // 2. Export
    try {
        if (config.format === 'excel') {
            exportToExcel(exportList, categories);
        } else {
            // PDF
            await exportToPDF(exportList, categories, { includeImages: config.includeImages });
        }
        onClose();
    } catch (error) {
        console.error("Export error:", error);
        alert("Ocurrió un error generaando la exportación.");
    } finally {
        setLoading(false);
    }
};

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [contacts, setContacts] = useState<ContactEntry[]>([]);
    const [quotes, setQuotes] = useState<QuoteEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<'category' | 'price' | 'stock' | 'name' | 'active'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Product Form State
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [formColors, setFormColors] = useState<string>('');
    const [hasColors, setHasColors] = useState(false);
    const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
    const [newVariantName, setNewVariantName] = useState('');
    const [newVariantPrice, setNewVariantPrice] = useState<number | string>(0.01);
    const [newVariantStock, setNewVariantStock] = useState<number | string>(0);
    const [newVariantSku, setNewVariantSku] = useState(''); // New Variant SKU state
    const [newVariantImageUrl, setNewVariantImageUrl] = useState('');
    const [newVariantImageFile, setNewVariantImageFile] = useState<File | null>(null);
    const [variantImagePreview, setVariantImagePreview] = useState<string>('');

    // Image Upload State
    const [useFileUpload, setUseFileUpload] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');
    // Additional Images State
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
    const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

    // Category Form State
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({});

    // Orders Filter & Modal State
    const [orderDateFilter, setOrderDateFilter] = useState<string>(''); // YYYY-MM-DD format
    const [selectedOrder, setSelectedOrder] = useState<QuoteEntry | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Hover Image Preview State
    const [hoverImage, setHoverImage] = useState<{ url: string; name: string; x: number; y: number } | null>(null);

    // Bulk Edit State
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [bulkEditData, setBulkEditData] = useState<{ category_id?: string; price?: number; hardware_color?: 'Dorado' | 'Plata' | 'GoldenRose' | 'Otros' | '' }>({});

    // Export State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [exportConfig, setExportConfig] = useState({
        format: 'excel' as 'excel' | 'pdf',
        includeImages: false,
        categoryId: 'all',
        maxStock: '',
    });

    // Export Menu State
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [prods, cats, con, quo] = await Promise.all([
            fetchProducts(),
            fetchCategories(),
            fetchContacts(),
            fetchQuotes()
        ]);
        setProducts(prods);
        setCategories(cats);
        setContacts(con);
        setQuotes(quo);
        setLoading(false);
        // Reset selection on reload
        setSelectedProductIds(new Set());
    };

    const toggleProductSelection = (id: string) => {
        const newSelection = new Set(selectedProductIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedProductIds(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedProductIds(new Set());
        } else {
            setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedProductIds.size === 0) return;

        setIsUploading(true);
        try {
            const updates = Array.from(selectedProductIds).map((id: string) => {
                const data: Partial<Product> = {};
                if (bulkEditData.category_id) data.category_id = bulkEditData.category_id;
                if (bulkEditData.price !== undefined) data.price = bulkEditData.price;
                if (bulkEditData.hardware_color) data.hardware_color = bulkEditData.hardware_color;
                return updateProduct(id, data);
            });

            await Promise.all(updates);
            alert('Productos actualizados correctamente');
            setIsBulkEditModalOpen(false);
            setBulkEditData({});
            loadData();
        } catch (error) {
            console.error('Error in bulk update:', error);
            alert('Error al actualizar los productos');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = async () => {
        console.log('🔴 handleLogout called');
        await signOut();
        localStorage.removeItem('admin_auth');
        navigate('/admin');
    };

    const handleSort = (field: 'category' | 'price' | 'stock' | 'name' | 'active') => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ field }: { field: 'category' | 'price' | 'stock' | 'name' | 'active' }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />;
        return sortOrder === 'asc'
            ? <ChevronUp className="w-3 h-3 ml-1 text-blue-600" />
            : <ChevronDown className="w-3 h-3 ml-1 text-blue-600" />;
    };

    // ===== PRODUCT MANAGEMENT =====

    const openProductModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
            const colors = product.colors?.join(', ') || '';
            setFormColors(colors);
            setHasColors(!!(product.colors && product.colors.length > 0));
            setProductVariants(product.variants || []);
            setImagePreview(product.image_url || '');
            // Load additional images if they exist
            setAdditionalPreviews(product.additional_images || []);
            setAdditionalFiles([]);
        } else {
            setEditingProduct(null);
            setFormData({
                sku: '',
                name: '',
                description: '',
                price: 0,
                stock: 0, // Default stock
                category_id: categories[0]?.id || '1',
                image_url: '',
                additional_images: [],
                featured: false,
                colors: [],
                min_quantity: 1,
                min_quantity_unit: 'unidad',
                is_customizable: false,
                customization_price: 0,
                has_variants: false,
                variant_price: 0,
                active: true // Default to active for new products
            });
            setFormColors('');
            setHasColors(false);
            setProductVariants([]);
            setNewVariantName('');
            setNewVariantPrice(0.01);
            setNewVariantStock(0);
            setNewVariantSku(''); // Reset SKU
            setNewVariantImageUrl('');
            setNewVariantImageFile(null);
            setVariantImagePreview('');
            setImagePreview('');
            setAdditionalFiles([]);
            setAdditionalPreviews([]);
        }
        setSelectedFile(null);
        setUseFileUpload(false);
        setIsProductModalOpen(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddVariant = async () => {
        if (!newVariantName.trim()) return;

        // Validate price is greater than 0
        if (newVariantPrice <= 0) {
            alert('El precio de la variante debe ser superior a $0');
            return;
        }

        let variantImageUrl = newVariantImageUrl.trim();

        // Upload variant image if file selected
        if (newVariantImageFile) {
            setIsUploading(true);
            const uploadedUrl = await uploadProductImage(newVariantImageFile);
            setIsUploading(false);
            if (uploadedUrl) {
                variantImageUrl = uploadedUrl;
            } else {
                alert('Error al subir la imagen de la variante. Usando URL si existe.');
            }
        }

        const newVariant: ProductVariant = {
            id: crypto.randomUUID(),
            name: newVariantName.trim(),
            price: typeof newVariantPrice === 'string' ? parseFloat(newVariantPrice) : newVariantPrice,
            stock: typeof newVariantStock === 'string' ? parseInt(newVariantStock) : newVariantStock,
            sku: newVariantSku.toUpperCase(), // Include SKU
            active: true,
            image_url: variantImageUrl || undefined
        };
        setProductVariants([...productVariants, newVariant]);
        setNewVariantName('');
        setNewVariantPrice(formData.price || 0.01);
        setNewVariantStock(0);
        setNewVariantSku(''); // Reset
        setNewVariantImageUrl('');
        setNewVariantImageFile(null);
        setVariantImagePreview('');
        setIsUploading(false);
    };

    const generateVariantSKU = () => {
        if (!formData.sku || !newVariantName) {
            alert('Asegúrate de que el producto principal tenga SKU y la variante tenga nombre.');
            return;
        }
        // Basic Logic: MAIN-SKU + VARIANT-CODE (First 3 letters or X)
        const varCode = newVariantName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
        // e.g. TEL-ALG-1001-AZU
        setNewVariantSku(`${formData.sku}-${varCode}`);
    };
    const removeVariant = (index: number) => {
        const newVars = [...productVariants];
        newVars.splice(index, 1);
        setProductVariants(newVars);
    };

    const toggleVariantActive = (index: number) => {
        const newVars = [...productVariants];
        newVars[index].active = !newVars[index].active;
        setProductVariants(newVars);
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('¿Confirmar eliminación del producto?')) {
            try {
                const result = await deleteProduct(id);
                if (result) {
                    await loadData();
                } else {
                    const lastError = (window as any).lastSupabaseError;
                    const errorMsg = lastError ? ` - ${lastError.message || lastError.details}` : '';
                    alert('Error al eliminar el producto' + errorMsg + '. Revisa la consola para más detalles.');
                }
            } catch (error) {
                console.error('Error en handleDeleteProduct:', error);
                alert('Ocurrió un error inesperado al intentar eliminar el producto.');
            }
        }
    };

    const generateSKU = () => {
        if (!formData.category_id) {
            alert('Por favor selecciona una categoría primero');
            return;
        }

        const category = categories.find(c => c.id === formData.category_id);
        // Get first 3 letters of category (or 'GEN' if not found)
        const catCode = category ? category.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') : 'GEN';

        // Random 4 digit number for speed
        const sequence = Math.floor(1000 + Math.random() * 9000);

        const sku = `${catCode}-${sequence}`;
        setFormData(prev => ({ ...prev, sku }));
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            // Validate variant prices if variants exist
            if (productVariants.length > 0) {
                const invalidVariant = productVariants.find(v => v.price <= 0);
                if (invalidVariant) {
                    alert(`El precio de la variante "${invalidVariant.name}" debe ser superior a $0`);
                    setIsUploading(false);
                    return;
                }
            }

            let imageUrl = formData.image_url || '';

            // Upload image if file selected
            if (useFileUpload && selectedFile) {
                const uploadedUrl = await uploadProductImage(selectedFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    alert('Error al subir la imagen. Usando URL existente o dejando vacío.');
                }
            }

            // Upload additional images
            let additionalImageUrls: string[] = [...(additionalPreviews.filter(p => !p.startsWith('data:')))]; // Keep existing URLs
            if (additionalFiles.length > 0) {
                for (const file of additionalFiles) {
                    const uploadedUrl = await uploadProductImage(file);
                    if (uploadedUrl) {
                        additionalImageUrls.push(uploadedUrl);
                    }
                }
            }

            // Process colors
            let processedColors: string[] = [];
            if (hasColors) {
                processedColors = formColors
                    .split(',')
                    .map(c => c.trim())
                    .filter(c => c !== '');
            }

            const dataToSubmit = {
                ...formData,
                image_url: imageUrl,
                additional_images: additionalImageUrls,
                colors: processedColors,
                variants: productVariants.map(v => ({
                    ...v,
                    price: Number(v.price) || 0,
                    stock: Number(v.stock) || 0
                })),
                price: Number(formData.price) || 0,
                stock: Number(formData.stock) || 0, // Submit stock
                min_quantity: Number(formData.min_quantity) || 1,
                customization_price: Number(formData.customization_price) || 0,
                is_customizable: Boolean(formData.is_customizable),
                variant_price: Number(formData.variant_price) || 0,
                has_variants: Boolean(formData.has_variants),
                active: formData.active !== undefined ? Boolean(formData.active) : true
            } as any;

            let result;
            if (editingProduct) {
                result = await updateProduct(editingProduct.id, dataToSubmit);
            } else {
                result = await createProduct(dataToSubmit);
            }

            if (!result) {
                throw new Error('La operación devolvió un resultado nulo (posible error en base de datos)');
            }

            setIsProductModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Error submitting product:', error);
            alert('Error al guardar el producto');
        } finally {
            setIsUploading(false);
        }
    };

    // ===== CATEGORY MANAGEMENT =====

    const openCategoryModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setCategoryFormData(category);
        } else {
            setEditingCategory(null);
            setCategoryFormData({
                name: '',
                slug: ''
            });
        }
        setIsCategoryModalOpen(true);
    };

    const handleDeleteCategory = async (id: string) => {
        // Check for subcategories
        const hasSubcategories = categories.some(c => c.parent_id === id);
        if (hasSubcategories) {
            alert('No se puede eliminar esta categoría porque tiene subcategorías. Primero elimina o reasigna las subcategorías.');
            return;
        }

        // Check if category has products (Local check)
        const hasProducts = products.some(p => p.category_id === id);

        let confirmMessage = '¿Confirmar eliminación de la categoría?';

        if (hasProducts) {
            // If products are detected locally, we warn user but allow them to proceed 
            // in case local state is stale or they want to rely on DB constraints/cascades (if any)
            confirmMessage = 'ADVERTENCIA: El sistema detecta productos asociados a esta categoría.\n\nSi ya los eliminaste externamente, continúa.\nSi no, la base de datos podría rechazar la eliminación.\n\n¿Deseas intentar eliminarla de todos modos?';
        }

        if (window.confirm(confirmMessage)) {
            const result = await deleteCategory(id);
            if (result) {
                await loadData();
            } else {
                alert('No se pudo eliminar la categoría. Es posible que existan restricciones en la base de datos (productos asociados).');
            }
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log('[handleCategorySubmit] Starting category submission...');
            console.log('[handleCategorySubmit] categoryFormData:', categoryFormData);

            // Auto-generate slug from name if not provided
            let dataToSubmit = { ...categoryFormData };
            console.log('[handleCategorySubmit] dataToSubmit after spread:', dataToSubmit);

            if (!dataToSubmit.slug && dataToSubmit.name) {
                dataToSubmit.slug = dataToSubmit.name
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                console.log('[handleCategorySubmit] Auto-generated slug:', dataToSubmit.slug);
            }

            console.log('[handleCategorySubmit] Final dataToSubmit:', dataToSubmit);

            if (editingCategory) {
                console.log('[handleCategorySubmit] Updating existing category:', editingCategory.id);
                const result = await updateCategory(editingCategory.id, dataToSubmit);
                console.log('[handleCategorySubmit] Update result:', result);
                if (!result) {
                    alert('Error al actualizar la categoría. Revisa la consola.');
                    return;
                }
            } else {
                console.log('[handleCategorySubmit] Creating new category...');
                const result = await createCategory(dataToSubmit as Omit<Category, 'id'>);
                console.log('[handleCategorySubmit] Create result:', result);
                if (!result) {
                    alert('Error al crear la categoría. Revisa la consola.');
                    return;
                }
            }

            console.log('[handleCategorySubmit] Success! Closing modal and reloading data...');
            setIsCategoryModalOpen(false);
            await loadData();
        } catch (error) {
            console.error('Error submitting category:', error);
            alert('Ocurrió un error al guardar la categoría: ' + error);
        }
    };

    const handleDeleteContact = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este mensaje de contacto?')) {
            const success = await deleteContact(id);
            if (success) {
                // Refresh data manually or reload
                const updated = contacts.filter(c => c.id !== id);
                setContacts(updated);
            } else {
                alert('No se pudo eliminar el contacto. Intente de nuevo.');
            }
        }
    };

    const handleDeleteQuote = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
            const success = await deleteQuote(id);
            if (success) {
                // Refresh data
                const updated = quotes.filter(q => q.id !== id);
                setQuotes(updated);
            } else {
                alert('No se pudo eliminar la cotización. Intente de nuevo.');
            }
        }
    };

    const handleToggleContactAttended = async (contact: ContactEntry) => {
        const newStatus = !contact.attended;
        // Optimistic update
        const updatedContacts = contacts.map(c =>
            c.id === contact.id ? { ...c, attended: newStatus } : c
        );
        setContacts(updatedContacts);

        const success = await updateContact(contact.id, { attended: newStatus });
        if (!success) {
            // Revert on failure
            alert('Error al actualizar el estado. Intente de nuevo.');
            setContacts(contacts);
        }
    };

    const handleToggleQuoteAttended = async (quote: QuoteEntry) => {
        const newStatus = !quote.attended;
        const confirmMsg = newStatus
            ? '¿Marcar como atendido?\nEsto descontará el stock de los productos.'
            : '¿Marcar como pendiente?\nEsto devolverá el stock a los productos.';

        if (!window.confirm(confirmMsg)) return;

        // Stock Management Logic
        if (quote.items && Array.isArray(quote.items)) {
            let stockUpdated = false;
            try {
                for (const item of quote.items) {
                    // Fetch latest product data
                    const product = await fetchProductById(item.productId);
                    if (product) {
                        // 1. Update Main Stock
                        let newStock = product.stock;
                        // If marking as Attended (true), subtract. If Pending (false), add.
                        if (newStatus) {
                            newStock = Math.max(0, product.stock - item.quantity);
                        } else {
                            newStock = product.stock + item.quantity;
                        }

                        let updates: Partial<Product> = { stock: newStock };

                        // 2. Update Variant Stock if applicable
                        if (item.selectedVariant && product.variants) {
                            const variantIndex = product.variants.findIndex(v => v.name === item.selectedVariant?.name);
                            if (variantIndex >= 0) {
                                // Ensure currentVStock defaults to 0 if undefined to prevent NaN
                                const currentVStock = product.variants[variantIndex].stock || 0;
                                const newVStock = newStatus
                                    ? Math.max(0, currentVStock - item.quantity)
                                    : currentVStock + item.quantity;

                                const newVariants = [...product.variants];
                                newVariants[variantIndex] = { ...newVariants[variantIndex], stock: newVStock };
                                updates.variants = newVariants;
                            }
                        }

                        await updateProduct(product.id, updates);
                        stockUpdated = true;
                    }
                }
            } catch (err) {
                console.error("Error updating stock:", err);
                alert("Hubo un error actualizando el stock, pero se cambiará el estado del pedido.");
            }

            if (stockUpdated) {
                // Refresh local products to reflect stock changes
                const updatedProds = await fetchProducts();
                setProducts(updatedProds);
            }
        }

        // Optimistic update
        const updatedQuotes = quotes.map(q =>
            q.id === quote.id ? { ...q, attended: newStatus } : q
        );
        setQuotes(updatedQuotes);

        const success = await updateQuote(quote.id, { attended: newStatus });
        if (!success) {
            // Revert on failure
            alert('Error al actualizar el estado. Intente de nuevo.');
            setQuotes(quotes);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando panel...</div>;

    // Filter and Sort Products
    const filteredProducts = products
        .filter(product => {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = product.name.toLowerCase().includes(searchLower);
            const matchesDesc = product.description.toLowerCase().includes(searchLower);
            const matchesSku = product.sku?.toLowerCase().includes(searchLower);
            // Also search in variant SKUs
            const matchesVariantSku = product.variants?.some(v =>
                v.sku?.toLowerCase().includes(searchLower)
            );
            const matchesSearch = matchesName || matchesDesc || matchesSku || matchesVariantSku;
            const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'category':
                    const catA = categories.find(c => c.id === a.category_id)?.name || '';
                    const catB = categories.find(c => c.id === b.category_id)?.name || '';
                    comparison = catA.localeCompare(catB);
                    break;
                case 'price':
                    comparison = (a.price || 0) - (b.price || 0);
                    break;
                case 'stock':
                    comparison = (a.stock || 0) - (b.stock || 0);
                    break;
                case 'active':
                    comparison = (a.active === b.active) ? 0 : (a.active ? -1 : 1);
                    break;
                case 'name':
                default:
                    comparison = a.name.localeCompare(b.name);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Floating Hover Image Preview */}
            {hoverImage && (
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{ left: hoverImage.x, top: hoverImage.y }}
                >
                    <div className="bg-white p-2 rounded-lg shadow-2xl border border-slate-300 ring-1 ring-black/5">
                        <img
                            src={hoverImage.url}
                            alt={hoverImage.name}
                            className="w-52 h-52 object-cover rounded"
                        />
                        <p className="text-xs text-slate-500 mt-1 text-center truncate max-w-[208px]">{hoverImage.name}</p>
                    </div>
                </div>
            )}
            {/* Admin Header */}
            <div className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-lg">
                <h1 className="text-xl font-bold">Panel de Administración</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/shop-the-look')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                    >
                        <Eye className="w-4 h-4" />
                        Configurar Shop the Look
                    </button>
                    <button
                        onClick={() => {
                            console.log('🟢 Logout button clicked');
                            handleLogout();
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Salir
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-200 mb-8">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'products'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Package className="w-5 h-5" />
                        Productos
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'categories'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Folder className="w-5 h-5" />
                        Categorías
                    </button>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'contacts'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        Contactos
                    </button>
                    <button
                        onClick={() => setActiveTab('quotes')}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'quotes'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        Pedidos
                    </button>
                    <button
                        onClick={() => setActiveTab('service_quotes')}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'service_quotes'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Scissors className="w-5 h-5" />
                        Servicios
                    </button>
                </div>

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-slate-800">Gestión de Productos</h2>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                {selectedProductIds.size > 0 && (
                                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                                        <span className="text-sm font-medium text-blue-700">
                                            {selectedProductIds.size} seleccionados
                                        </span>
                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => setIsBulkEditModalOpen(true)}
                                        >
                                            Editar Masivo
                                        </Button>
                                    </div>
                                )}
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar productos..."
                                        className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Category Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        className="pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white w-full sm:w-48"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        aria-label="Filtrar por categoría"
                                    >
                                        <option value="all">Todas las Categorías</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Export Button */}
                                <div>
                                    <button
                                        onClick={() => setIsExportModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700 shadow-sm"
                                    >
                                        <Download className="w-4 h-4 text-slate-500" />
                                        Exportar
                                    </button>
                                </div>

                                <Button onClick={() => openProductModal()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="p-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="p-4">Imagen</th>
                                            <th className="p-4">SKU</th>
                                            <th className="p-4 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('name')}>
                                                <div className="flex items-center">Nombre <SortIcon field="name" /></div>
                                            </th>
                                            <th className="p-4 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('category')}>
                                                <div className="flex items-center">Categoría <SortIcon field="category" /></div>
                                            </th>
                                            <th className="p-4 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('price')}>
                                                <div className="flex items-center">Precio <SortIcon field="price" /></div>
                                            </th>
                                            <th className="p-4 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('stock')}>
                                                <div className="flex items-center">Stock <SortIcon field="stock" /></div>
                                            </th>
                                            <th className="p-4 text-center cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('active')}>
                                                <div className="flex items-center justify-center">Estado <SortIcon field="active" /></div>
                                            </th>
                                            <th className="p-4 text-center">Colores</th>
                                            <th className="p-4 text-center">Destacado</th>
                                            <th className="p-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="p-8 text-center text-slate-500">
                                                    No se encontraron productos que coincidan con tu búsqueda.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProducts.map(product => {
                                                const catName = categories.find(c => c.id === product.category_id)?.name || product.category_id;
                                                const hasVars = product.colors && product.colors.length > 0;
                                                return (
                                                    <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${selectedProductIds.has(product.id) ? 'bg-blue-50/50' : ''}`}>
                                                        <td className="p-4">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                                checked={selectedProductIds.has(product.id)}
                                                                onChange={() => toggleProductSelection(product.id)}
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <div
                                                                className="relative"
                                                                onMouseEnter={(e) => {
                                                                    if (product.image_url) {
                                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                                        setHoverImage({
                                                                            url: product.image_url,
                                                                            name: product.name,
                                                                            x: rect.right + 10,
                                                                            y: rect.top
                                                                        });
                                                                    }
                                                                }}
                                                                onMouseLeave={() => setHoverImage(null)}
                                                            >
                                                                <img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover bg-slate-200 cursor-pointer" />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 font-mono text-xs text-slate-500">
                                                            {product.sku || '-'}
                                                            {product.variants && product.variants.length > 0 && (
                                                                <div className="mt-1 text-xs text-slate-500">
                                                                    {product.variants.map((variant, idx) => (
                                                                        <div key={idx} className="flex items-center gap-1">
                                                                            <p className="text-sm font-medium text-slate-800">{variant.name}</p>
                                                                            {variant.sku && <p className="text-xs text-slate-500 font-mono">{variant.sku}</p>}
                                                                            <p className="text-xs text-slate-500">Stock: {variant.stock} | +${variant.price}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4 font-medium">{product.name}</td>
                                                        <td className="p-4 text-slate-500">{catName}</td>
                                                        <td className="p-4 font-mono">${product.price.toFixed(2)}</td>
                                                        <td className={`p-4 font-mono ${product.stock === 0 ? 'text-red-500 font-bold' : ''}`}>{product.stock || 0}</td>
                                                        <td className="p-4 text-center">
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    const newStatus = !product.active;
                                                                    // Optimistic update
                                                                    const updated = products.map(p => p.id === product.id ? { ...p, active: newStatus } : p);
                                                                    setProducts(updated);
                                                                    await updateProduct(product.id, { active: newStatus });
                                                                }}
                                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border ${product.active !== false
                                                                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                                    }`}
                                                            >
                                                                {product.active !== false ? 'Activo' : 'Inactivo'}
                                                            </button>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {hasVars
                                                                ? <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{product.colors!.length} Vars</span>
                                                                : <span className="text-slate-400 text-xs">No</span>}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {product.featured ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-slate-300">-</span>}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); openProductModal(product); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* CATEGORIES TAB */}
                {activeTab === 'categories' && (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
                            <Button onClick={() => openCategoryModal()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Categoría
                            </Button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="p-4">Nombre</th>
                                            <th className="p-4">Slug</th>
                                            <th className="p-4">Tipo</th>
                                            <th className="p-4 text-center">Productos</th>
                                            <th className="p-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {categories.map(category => {
                                            const productCount = products.filter(p => p.category_id === category.id).length;
                                            const isSubcategory = !!category.parent_id;
                                            const parentName = category.parent_id
                                                ? categories.find(c => c.id === category.parent_id)?.name
                                                : null;

                                            return (
                                                <tr key={category.id} className={`hover:bg-slate-50 transition-colors ${isSubcategory ? 'bg-blue-50/30' : ''}`}>
                                                    <td className={`p-4 font-medium ${isSubcategory ? 'pl-10' : ''}`}>
                                                        {isSubcategory && <span className="text-slate-400 mr-2">└─</span>}
                                                        {category.name}
                                                    </td>
                                                    <td className="p-4 text-slate-500 font-mono text-xs">{category.slug}</td>
                                                    <td className="p-4">
                                                        {isSubcategory ? (
                                                            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                                Subcategoría de: {parentName}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                                                Categoría Principal
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full font-medium">
                                                            {productCount} {productCount === 1 ? 'producto' : 'productos'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" onClick={(e) => { e.stopPropagation(); openCategoryModal(category); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* CONTACTS TAB */}
                {activeTab === 'contacts' && (
                    <>
                        <h2 className="text-2xl font-bold mb-8">Solicitudes de Contacto</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="p-4">Fecha</th>
                                            <th className="p-4">Nombre</th>
                                            <th className="p-4">Email / Teléfono</th>
                                            <th className="p-4">Empresa</th>
                                            <th className="p-4">Mensaje</th>
                                            <th className="p-4 text-center">Estado</th>
                                            <th className="p-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {contacts.length === 0 ? (
                                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay mensajes de contacto.</td></tr>
                                        ) : (
                                            contacts.map(c => (
                                                <tr key={c.id} className="hover:bg-slate-50">
                                                    <td className="p-4 whitespace-nowrap text-slate-500">{new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString()}</td>
                                                    <td className="p-4 font-medium">{c.name}</td>
                                                    <td className="p-4">
                                                        <div className="text-blue-600">{c.email}</div>
                                                        <div className="text-slate-500 text-xs">{c.phone}</div>
                                                    </td>
                                                    <td className="p-4 text-slate-500">{c.company || '-'}</td>
                                                    <td className="p-4 max-w-md truncate" title={c.message}>{c.message}</td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => handleToggleContactAttended(c)}
                                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border transition-colors ${c.attended
                                                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                                : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'
                                                                }`}
                                                            title="Clic para cambiar estado"
                                                        >
                                                            {c.attended ? (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Atendido
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                                                    Pendiente
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteContact(c.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Eliminar Mensaje"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* QUOTES TAB */}
                {activeTab === 'quotes' && (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-slate-800">Pedidos de WhatsApp</h2>
                            <div className="flex gap-3 items-center">
                                <label className="text-sm text-slate-600">Filtrar por fecha:</label>
                                <input
                                    type="date"
                                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={orderDateFilter}
                                    onChange={(e) => setOrderDateFilter(e.target.value)}
                                />
                                {orderDateFilter && (
                                    <button
                                        onClick={() => setOrderDateFilter('')}
                                        className="text-xs text-slate-500 hover:text-red-600 underline"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter quotes by date and type (Product Orders) */}
                        {(() => {
                            const filteredQuotes = (orderDateFilter
                                ? quotes.filter(q => {
                                    const orderDate = new Date(q.created_at).toISOString().split('T')[0];
                                    return orderDate === orderDateFilter;
                                })
                                : quotes).filter(q => !q.service_name); // Only product orders

                            return (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10">
                                                <tr>
                                                    <th className="p-4">Fecha</th>
                                                    <th className="p-4">Cliente</th>
                                                    <th className="p-4">Pedido</th>
                                                    <th className="p-4">SKUs</th>
                                                    <th className="p-4">Items</th>
                                                    <th className="p-4">Notas</th>
                                                    <th className="p-4 text-center">Estado</th>
                                                    <th className="p-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredQuotes.length === 0 ? (
                                                    <tr><td colSpan={8} className="p-8 text-center text-slate-500">
                                                        {orderDateFilter ? 'No hay pedidos para esta fecha.' : 'No hay pedidos registrados.'}
                                                    </td></tr>
                                                ) : (
                                                    filteredQuotes.map(q => {
                                                        // Extract SKUs from items array if available
                                                        const itemSkus = (q as any).items?.map((item: any) => {
                                                            const sku = item.sku || item.selectedVariant?.sku || '-';
                                                            return `${sku} x${item.quantity}`;
                                                        }) || [];

                                                        return (
                                                            <tr
                                                                key={q.id}
                                                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                                onClick={() => { setSelectedOrder(q); setIsOrderModalOpen(true); }}
                                                            >
                                                                <td className="p-4 whitespace-nowrap text-slate-500 text-xs">{new Date(q.created_at).toLocaleDateString()} {new Date(q.created_at).toLocaleTimeString()}</td>
                                                                <td className="p-4">
                                                                    <div className="font-medium">{q.customer_name}</div>
                                                                    <div className="text-xs text-slate-400">{q.phone}</div>
                                                                </td>
                                                                <td className="p-4 text-blue-700 font-bold">{q.product_name || `#${q.id.substring(0, 6)}`}</td>
                                                                <td className="p-4">
                                                                    {itemSkus.length > 0 ? (
                                                                        <div className="space-y-1">
                                                                            {itemSkus.map((sku: string, idx: number) => (
                                                                                <div key={idx} className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block mr-1 mb-1">
                                                                                    {sku}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-slate-400">Sin SKU</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-4 font-mono text-center">{q.quantity}</td>
                                                                <td className="p-4 max-w-xs">
                                                                    <div className="text-xs font-mono bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-wrap max-h-24 overflow-y-auto">
                                                                        {q.specifications}
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleToggleQuoteAttended(q); }}
                                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border transition-colors ${q.attended
                                                                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                                            : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'
                                                                            }`}
                                                                        title="Clic para cambiar estado"
                                                                    >
                                                                        {q.attended ? (
                                                                            <>
                                                                                <CheckCircle className="w-3 h-3" />
                                                                                Atendido
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                                                                Pendiente
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </td>
                                                                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteQuote(q.id); }}
                                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                        title="Eliminar Pedido"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()}
                    </>
                )}

                {/* SERVICE QUOTES TAB */}
                {activeTab === 'service_quotes' && (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-slate-800">Cotizaciones de Servicios</h2>
                            <div className="flex gap-3 items-center">
                                <label className="text-sm text-slate-600">Filtrar por fecha:</label>
                                <input
                                    type="date"
                                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={orderDateFilter}
                                    onChange={(e) => setOrderDateFilter(e.target.value)}
                                />
                                {orderDateFilter && (
                                    <button
                                        onClick={() => setOrderDateFilter('')}
                                        className="text-xs text-slate-500 hover:text-red-600 underline"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>

                        {(() => {
                            const filteredQuotes = (orderDateFilter
                                ? quotes.filter(q => {
                                    const orderDate = new Date(q.created_at).toISOString().split('T')[0];
                                    return orderDate === orderDateFilter;
                                })
                                : quotes).filter(q => !!q.service_name); // Only service quotes

                            return (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10">
                                                <tr>
                                                    <th className="p-4">Fecha</th>
                                                    <th className="p-4">Cliente</th>
                                                    <th className="p-4">Servicio</th>
                                                    <th className="p-4">Cantidad</th>
                                                    <th className="p-4">Especificaciones</th>
                                                    <th className="p-4 text-center">Estado</th>
                                                    <th className="p-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredQuotes.length === 0 ? (
                                                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">
                                                        {orderDateFilter ? 'No hay cotizaciones para esta fecha.' : 'No hay cotizaciones de servicios registradas.'}
                                                    </td></tr>
                                                ) : (
                                                    filteredQuotes.map(q => (
                                                        <tr
                                                            key={q.id}
                                                            className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                            onClick={() => { setSelectedOrder(q); setIsOrderModalOpen(true); }}
                                                        >
                                                            <td className="p-4 whitespace-nowrap text-slate-500 text-xs">{new Date(q.created_at).toLocaleDateString()} {new Date(q.created_at).toLocaleTimeString()}</td>
                                                            <td className="p-4">
                                                                <div className="font-medium">{q.customer_name}</div>
                                                                <div className="text-xs text-slate-400">{q.phone}</div>
                                                            </td>
                                                            <td className="p-4 text-cyan-700 font-bold">{q.service_name}</td>
                                                            <td className="p-4 font-mono text-center">{q.quantity}</td>
                                                            <td className="p-4 max-w-xs">
                                                                <div className="text-xs font-mono bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-wrap max-h-24 overflow-y-auto">
                                                                    {q.specifications}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleQuoteAttended(q); }}
                                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border transition-colors ${q.attended
                                                                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'
                                                                        }`}
                                                                    title="Clic para cambiar estado"
                                                                >
                                                                    {q.attended ? (
                                                                        <>
                                                                            <CheckCircle className="w-3 h-3" />
                                                                            Atendido
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                                                            Pendiente
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </td>
                                                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteQuote(q.id); }}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                    title="Eliminar Cotización"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>

            {/* ORDER DETAIL MODAL */}
            {isOrderModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <div>
                                <h3 className="text-xl font-bold">{selectedOrder.product_name || 'Pedido'}</h3>
                                <p className="text-blue-100 text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => { setIsOrderModalOpen(false); setSelectedOrder(null); }}
                                className="text-white/80 hover:text-white p-1"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Customer Info */}
                            <div className="bg-slate-50 rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-slate-800 mb-2">Datos del Cliente</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-slate-500">Nombre:</span> <span className="font-medium">{selectedOrder.customer_name}</span></div>
                                    <div><span className="text-slate-500">Telefono:</span> <span className="font-medium">{selectedOrder.phone}</span></div>
                                </div>
                            </div>

                            {/* Items with Images */}
                            <h4 className="font-bold text-slate-800 mb-3">Productos del Pedido</h4>
                            <div className="space-y-3">
                                {(selectedOrder as any).items?.length > 0 ? (
                                    (selectedOrder as any).items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-semibold text-slate-900 text-sm truncate">{item.productName}</h5>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {item.sku && (
                                                        <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                                            {item.sku}
                                                        </span>
                                                    )}
                                                    {item.selectedVariant?.name && (
                                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                            {item.selectedVariant.name}
                                                        </span>
                                                    )}
                                                    {item.selectedColor && (
                                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                            {item.selectedColor}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs text-slate-500">Cantidad: <strong>{item.quantity}</strong></span>
                                                    <span className="text-sm font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm">No hay items detallados para este pedido.</p>
                                )}
                            </div>

                            {/* Notes */}
                            {selectedOrder.specifications && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-slate-800 mb-2">Notas del Pedido</h4>
                                    <div className="bg-slate-50 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap border border-slate-100">
                                        {selectedOrder.specifications}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={() => { setIsOrderModalOpen(false); setSelectedOrder(null); }}
                                className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium text-slate-700 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* EXPORT MODAL */}
            {
                isExportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Download className="w-5 h-5 text-blue-600" />
                                    Exportar Inventario
                                </h3>
                                <button
                                    onClick={() => setIsExportModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 p-1"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Format Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 block">Formato</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setExportConfig({ ...exportConfig, format: 'excel' })}
                                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${exportConfig.format === 'excel'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                                }`}
                                        >
                                            <FileSpreadsheet className="w-6 h-6 mb-2" />
                                            <span className="text-xs font-medium">Excel</span>
                                        </button>
                                        <button
                                            onClick={() => setExportConfig({ ...exportConfig, format: 'pdf' })}
                                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${exportConfig.format === 'pdf'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                                }`}
                                        >
                                            <FileIcon className="w-6 h-6 mb-2" />
                                            <span className="text-xs font-medium">PDF</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Options for PDF */}
                                {exportConfig.format === 'pdf' && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                checked={exportConfig.includeImages}
                                                onChange={(e) => setExportConfig({ ...exportConfig, includeImages: e.target.checked })}
                                            />
                                            <span className="text-sm text-slate-700">Incluir imágenes de productos</span>
                                        </label>
                                        {exportConfig.includeImages && (
                                            <p className="text-xs text-amber-600 mt-2 ml-7">
                                                Nota: El proceso puede tardar unos segundos.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="border-t border-slate-100 pt-5 space-y-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtros Opcionales</p>

                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
                                        <select
                                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={exportConfig.categoryId}
                                            onChange={(e) => setExportConfig({ ...exportConfig, categoryId: e.target.value })}
                                        >
                                            <option value="all">Todas las categorías</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Stock Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Stock menor o igual a:</label>
                                        <input
                                            type="number"
                                            placeholder="Ej. 5"
                                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={exportConfig.maxStock}
                                            onChange={(e) => setExportConfig({ ...exportConfig, maxStock: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Deja vacío para exportar todo</p>
                                    </div>
                                </div>

                                <button
                                    disabled={exportLoading}
                                    onClick={() => handleExport(
                                        exportConfig,
                                        products, // Use *all* products so filters apply to the full set
                                        categories,
                                        setExportLoading,
                                        () => setIsExportModalOpen(false)
                                    )}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {exportLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Generando...
                                        </>
                                    ) : (
                                        <>Obtener Reporte</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* PRODUCT MODAL */}
            {
                isProductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold">{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>
                                <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar modal">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label htmlFor="product-name" className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
                                        <input
                                            id="product-name"
                                            required
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="product-sku" className="block text-sm font-medium text-slate-700 mb-1">SKU (Código Único)</label>
                                        <div className="flex gap-2">
                                            <input
                                                id="product-sku"
                                                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                                                value={formData.sku || ''}
                                                onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                                placeholder="CATEGORIA-PRODUCTO-0000"
                                            />
                                            <Button type="button" onClick={generateSKU} className="whitespace-nowrap" title="Generar SKU Automático">
                                                Generar SKU
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Formato sugerido: CAT-PRO-0000. Haz clic en Generar para crear uno basado en el nombre y categoría.
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="product-price" className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
                                        <input
                                            id="product-price"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            required
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.price ?? ''}
                                            onChange={e => setFormData({ ...formData, price: parseNumberInput(e.target.value) })}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="product-stock" className="block text-sm font-medium text-slate-700 mb-1">Stock Disponible</label>
                                        <input
                                            id="product-stock"
                                            type="number"
                                            min="0"
                                            required
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.stock ?? ''}
                                            onChange={e => setFormData({ ...formData, stock: parseNumberInput(e.target.value) })}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="category_id" className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                        <select
                                            id="category_id"
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.category_id || ''}
                                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                        >
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Hardware Color Selector - Only for Herrajes category */}
                                    {(() => {
                                        const selectedCat = categories.find(c => c.id === formData.category_id);
                                        const isHerrajesCategory = selectedCat?.slug === 'herrajes' ||
                                            categories.find(c => c.id === selectedCat?.parent_id)?.slug === 'herrajes';

                                        if (!isHerrajesCategory) return null;

                                        return (
                                            <div>
                                                <label htmlFor="hardware_color" className="block text-sm font-medium text-slate-700 mb-1">Color de Herraje</label>
                                                <select
                                                    id="hardware_color"
                                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={formData.hardware_color || ''}
                                                    onChange={e => setFormData({ ...formData, hardware_color: e.target.value as 'Dorado' | 'Plata' | 'GoldenRose' | 'Otros' | undefined })}
                                                >
                                                    <option value="">Sin especificar</option>
                                                    <option value="Dorado">Dorado</option>
                                                    <option value="Plata">Plata</option>
                                                    <option value="GoldenRose">GoldenRose</option>
                                                    <option value="Otros">Otros</option>
                                                </select>
                                            </div>
                                        );
                                    })()}

                                    {/* NEW FIELDS: Quantity & Customization */}
                                    <div className="col-span-2 grid grid-cols-1 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <div className="space-y-3">
                                            <label htmlFor="min-quantity" className="block text-sm font-medium text-slate-700">Cantidad Mínima</label>
                                            <div className="flex gap-2">
                                                <input
                                                    id="min-quantity"
                                                    type="number"
                                                    min="1"
                                                    className="w-24 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={formData.min_quantity ?? ''}
                                                    onChange={e => setFormData({ ...formData, min_quantity: parseNumberInput(e.target.value) })}
                                                />
                                                <select
                                                    id="min_quantity_unit"
                                                    aria-label="Unidad de medida"
                                                    className="flex-1 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={formData.min_quantity_unit || 'unidad'}
                                                    onChange={e => setFormData({ ...formData, min_quantity_unit: e.target.value })}
                                                >
                                                    <option value="unidad">Unidad(es)</option>
                                                    <option value="docena">Docena(s)</option>
                                                    <option value="ciento">Ciento(s)</option>
                                                    <option value="millar">Millar(es)</option>
                                                    <option value="kg">Kilogramo(s)</option>
                                                    <option value="m">Metro(s)</option>
                                                    <option value="otro">Otro</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    id="is_customizable"
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                    checked={formData.is_customizable || false}
                                                    onChange={e => setFormData({ ...formData, is_customizable: e.target.checked })}
                                                />
                                                <label htmlFor="is_customizable" className="text-sm font-medium text-slate-700">¿Producto Personalizable?</label>
                                            </div>

                                            {formData.is_customizable && (
                                                <div>
                                                    <label htmlFor="customization_price" className="block text-xs text-slate-500 mb-1">Costo Adicional por Personalización</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                                                        <input
                                                            id="customization_price"
                                                            type="number"
                                                            step="0.01"
                                                            className="w-full border border-slate-300 rounded-lg pl-7 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                                            value={formData.customization_price ?? ''}
                                                            onChange={e => setFormData({ ...formData, customization_price: parseNumberInput(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 3. Variants */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    id="has_variants"
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                    checked={formData.has_variants || false}
                                                    onChange={e => setFormData({ ...formData, has_variants: e.target.checked })}
                                                />
                                                <label htmlFor="has_variants" className="text-sm font-medium text-slate-700">Variantes de Tipo</label>
                                            </div>

                                            {formData.has_variants && (
                                                <div>
                                                    <label className="block text-xs text-slate-500 mb-1">Descripción del Tipo</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Ej: Material (Algodón, Lino...)"
                                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                                            value={formData.variant_type || ''}
                                                            onChange={e => setFormData({ ...formData, variant_type: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {formData.has_variants && (
                                                <div className="mt-4 pt-4 border-t border-slate-200 animate-fade-in">
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Lista de Variantes</h4>

                                                    {/* Add Variant Form */}
                                                    <div className="space-y-3 mb-4 bg-white p-4 rounded-lg border border-slate-200">
                                                        <h5 className="text-xs font-semibold text-slate-600 uppercase">Agregar Nueva Variante</h5>
                                                        <div className="flex gap-2 items-end">
                                                            <div className="flex-1">
                                                                <label htmlFor="new_variant_name" className="block text-xs text-slate-500 mb-1">Nombre (Ej: XL, 500g)</label>
                                                                <input
                                                                    id="new_variant_name"
                                                                    type="text"
                                                                    value={newVariantName}
                                                                    onChange={e => setNewVariantName(e.target.value)}
                                                                    className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500"
                                                                    placeholder="Opción"
                                                                />
                                                            </div>
                                                            <div className="w-24">
                                                                <label htmlFor="new_variant_price" className="block text-xs text-slate-500 mb-1">Precio</label>
                                                                <input
                                                                    id="new_variant_price"
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0.01"
                                                                    value={newVariantPrice}
                                                                    onChange={e => setNewVariantPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                                    className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500"
                                                                />
                                                            </div>
                                                            <div className="w-32">
                                                                <label htmlFor="new_variant_sku" className="block text-xs text-slate-500 mb-1">SKU (Opcional)</label>
                                                                <div className="flex gap-1">
                                                                    <input
                                                                        id="new_variant_sku"
                                                                        type="text"
                                                                        value={newVariantSku}
                                                                        onChange={e => setNewVariantSku(e.target.value.toUpperCase())}
                                                                        className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500 uppercase font-mono"
                                                                        placeholder="SKU-VAR"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={generateVariantSKU}
                                                                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                                                                        title="Generar SKU basado en Producto"
                                                                    >
                                                                        <Upload className="w-4 h-4 rotate-90" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="w-24">
                                                                <label htmlFor="new_variant_stock" className="block text-xs text-slate-500 mb-1">Stock</label>
                                                                <input
                                                                    id="new_variant_stock"
                                                                    type="number"
                                                                    min="0"
                                                                    value={newVariantStock}
                                                                    onChange={e => setNewVariantStock(e.target.value === '' ? '' : parseInt(e.target.value))}
                                                                    className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={handleAddVariant}
                                                                className="mb-[1px]"
                                                                disabled={isUploading}
                                                            >
                                                                {isUploading ? 'Subiendo...' : 'Agregar'}
                                                            </Button>
                                                        </div>

                                                        {/* Image Upload Options */}
                                                        <div className="space-y-2">
                                                            <label className="block text-xs font-semibold text-slate-600">Imagen de Variante</label>

                                                            {/* File Upload Option */}
                                                            <div className="flex gap-2 items-start">
                                                                <div className="flex-1">
                                                                    <label htmlFor="new_variant_image_file" className="block text-xs text-slate-500 mb-1">Subir Archivo</label>
                                                                    <input
                                                                        id="new_variant_image_file"
                                                                        type="file"
                                                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                setNewVariantImageFile(file);
                                                                                const reader = new FileReader();
                                                                                reader.onloadend = () => {
                                                                                    setVariantImagePreview(reader.result as string);
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                                // Clear URL input if file is selected
                                                                                setNewVariantImageUrl('');
                                                                            }
                                                                        }}
                                                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                                    />
                                                                </div>
                                                                {(variantImagePreview || newVariantImageUrl) && (
                                                                    <img
                                                                        src={variantImagePreview || newVariantImageUrl}
                                                                        alt="Preview"
                                                                        className="w-12 h-12 object-cover rounded border border-slate-200"
                                                                    />
                                                                )}
                                                            </div>

                                                            {/* URL Option */}
                                                            <div>
                                                                <label className="block text-xs text-slate-500 mb-1">O pegar URL</label>
                                                                <input
                                                                    type="text"
                                                                    value={newVariantImageUrl}
                                                                    onChange={e => {
                                                                        setNewVariantImageUrl(e.target.value);
                                                                        // Clear file input if URL is entered
                                                                        if (e.target.value) {
                                                                            setNewVariantImageFile(null);
                                                                            setVariantImagePreview('');
                                                                        }
                                                                    }}
                                                                    className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500"
                                                                    placeholder="https://ejemplo.com/imagen-variante.jpg"
                                                                    disabled={!!newVariantImageFile}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-slate-400">Esta imagen se mostrará cuando el cliente seleccione esta variante</p>
                                                        </div>
                                                    </div>

                                                    {/* Variants List */}
                                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                                                        {productVariants.map((v, idx) => (
                                                            <div key={v.id || idx} className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-3">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex-1 flex items-center gap-2">
                                                                        <div className="flex-1">
                                                                            <label className="block text-xs text-slate-500 mb-1">Nombre</label>
                                                                            <input
                                                                                type="text"
                                                                                value={v.name}
                                                                                onChange={(e) => {
                                                                                    const newVars = [...productVariants];
                                                                                    newVars[idx].name = e.target.value;
                                                                                    setProductVariants(newVars);
                                                                                }}
                                                                                className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                                                                                placeholder="Nombre de variante"
                                                                            />
                                                                        </div>
                                                                        <div className="w-28">
                                                                            <label htmlFor={`variant_price_${idx}`} className="block text-xs text-slate-500 mb-1">Precio</label>
                                                                            <input
                                                                                id={`variant_price_${idx}`}
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0.01"
                                                                                value={isNaN(v.price) ? '' : v.price}
                                                                                onChange={(e) => {
                                                                                    const newVars = [...productVariants];
                                                                                    newVars[idx].price = e.target.value === '' ? NaN : parseFloat(e.target.value);
                                                                                    setProductVariants(newVars);
                                                                                }}
                                                                                className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                                                                            />
                                                                        </div>
                                                                        <div className="w-24">
                                                                            <label htmlFor={`variant_stock_${idx}`} className="block text-xs text-slate-500 mb-1">Stock</label>
                                                                            <input
                                                                                id={`variant_stock_${idx}`}
                                                                                type="number"
                                                                                min="0"
                                                                                value={isNaN(v.stock) ? '' : v.stock}
                                                                                onChange={(e) => {
                                                                                    const newVars = [...productVariants];
                                                                                    newVars[idx].stock = e.target.value === '' ? NaN : parseInt(e.target.value);
                                                                                    setProductVariants(newVars);
                                                                                }}
                                                                                className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-end gap-2 pb-1">
                                                                        <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2 py-1.5 rounded border border-slate-100 hover:bg-slate-100 transition-colors">
                                                                            <div className={`w-2 h-2 rounded-full ${v.active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={v.active}
                                                                                onChange={() => toggleVariantActive(idx)}
                                                                                className="hidden"
                                                                            />
                                                                            <span className={`text-xs font-medium ${v.active ? 'text-green-700' : 'text-slate-500'}`}>
                                                                                {v.active ? 'Activo' : 'Inactivo'}
                                                                            </span>
                                                                        </label>
                                                                        <button type="button" onClick={() => removeVariant(idx)} className="text-slate-400 hover:text-red-500 transition-colors p-1.5" aria-label="Eliminar variante">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                                                    <label className="block text-xs font-semibold text-slate-600">Imagen de Variante</label>

                                                                    {/* File Upload Option */}
                                                                    <div className="flex gap-2 items-start">
                                                                        <div className="flex-1">
                                                                            <label htmlFor={`variant_file_${idx}`} className="block text-xs text-slate-500 mb-1">Subir Archivo</label>
                                                                            <input
                                                                                id={`variant_file_${idx}`}
                                                                                type="file"
                                                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                                                onChange={async (e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (file) {
                                                                                        setIsUploading(true);
                                                                                        const uploadedUrl = await uploadProductImage(file);
                                                                                        setIsUploading(false);
                                                                                        if (uploadedUrl) {
                                                                                            const newVars = [...productVariants];
                                                                                            newVars[idx].image_url = uploadedUrl;
                                                                                            setProductVariants(newVars);
                                                                                        } else {
                                                                                            alert('Error al subir la imagen de la variante.');
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                                                disabled={isUploading}
                                                                            />
                                                                        </div>
                                                                        {v.image_url && (
                                                                            <img src={v.image_url} alt={v.name} className="w-12 h-12 object-cover rounded border border-slate-200 mt-5" />
                                                                        )}
                                                                    </div>

                                                                    {/* URL Option */}
                                                                    <div>
                                                                        <label className="block text-xs text-slate-500 mb-1">O pegar URL</label>
                                                                        <input
                                                                            type="text"
                                                                            value={v.image_url || ''}
                                                                            onChange={(e) => {
                                                                                const newVars = [...productVariants];
                                                                                newVars[idx].image_url = e.target.value || undefined;
                                                                                setProductVariants(newVars);
                                                                            }}
                                                                            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                                                                            placeholder="https://ejemplo.com/imagen-variante.jpg"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {productVariants.length === 0 && (
                                                            <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-50/50 rounded dashed border border-slate-200">
                                                                No hay variantes agregadas para este tipo.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* IMAGE UPLOAD SECTION */}
                                    <div className="col-span-2 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="useFileUpload"
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                checked={useFileUpload}
                                                onChange={e => setUseFileUpload(e.target.checked)}
                                            />
                                            <label htmlFor="useFileUpload" className="text-sm font-bold text-slate-700">Subir imagen desde mi dispositivo</label>
                                        </div>

                                        {useFileUpload ? (
                                            <div className="pl-8 space-y-3">
                                                <div>
                                                    <label htmlFor="product_image_file" className="block text-sm font-medium text-slate-600 mb-2">Seleccionar archivo</label>
                                                    <input
                                                        id="product_image_file"
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                                        onChange={handleFileSelect}
                                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    <p className="text-xs text-slate-400 mt-1">JPG, PNG o WEBP. Máximo 5MB.</p>
                                                </div>
                                                {imagePreview && (
                                                    <div className="mt-3">
                                                        <p className="text-sm font-medium text-slate-600 mb-2">Vista previa:</p>
                                                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-slate-200" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="pl-8">
                                                <label className="block text-sm font-medium text-slate-600 mb-1">URL de Imagen</label>
                                                <input
                                                    required={!useFileUpload}
                                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                    value={formData.image_url || ''}
                                                    onChange={e => {
                                                        setFormData({ ...formData, image_url: e.target.value });
                                                        setImagePreview(e.target.value);
                                                    }}
                                                    placeholder="https://..."
                                                />
                                                {imagePreview && (
                                                    <div className="mt-3">
                                                        <p className="text-sm font-medium text-slate-600 mb-2">Vista previa:</p>
                                                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-slate-200" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* ADDITIONAL IMAGES SECTION */}
                                    <div className="col-span-2 space-y-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-700">
                                                Imágenes Adicionales (Galería)
                                            </label>
                                            <span className="text-xs text-slate-500">{additionalPreviews.length} imagen(es)</span>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label htmlFor="additional_images_file" className="block text-sm font-medium text-slate-600 mb-2">
                                                    Agregar más imágenes
                                                </label>
                                                <input
                                                    id="additional_images_file"
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = e.target.files;
                                                        if (files && files.length > 0) {
                                                            const newFiles = Array.from<File>(files);
                                                            setAdditionalFiles(prev => [...prev, ...newFiles]);

                                                            // Create previews
                                                            newFiles.forEach(file => {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setAdditionalPreviews(prev => [...prev, reader.result as string]);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            });
                                                        }
                                                        // Reset input
                                                        e.target.value = '';
                                                    }}
                                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                <p className="text-xs text-slate-400 mt-1">Puedes seleccionar múltiples archivos. JPG, PNG o WEBP.</p>
                                            </div>

                                            {additionalPreviews.length > 0 && (
                                                <div className="grid grid-cols-4 gap-3">
                                                    {additionalPreviews.map((preview, idx) => (
                                                        <div key={idx} className="relative group">
                                                            <img
                                                                src={preview}
                                                                alt={`Adicional ${idx + 1}`}
                                                                className="w-full h-20 object-cover rounded-lg border border-slate-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setAdditionalPreviews(prev => prev.filter((_, i) => i !== idx));
                                                                    // Also remove from files if it's a new file (data: URL)
                                                                    if (preview.startsWith('data:')) {
                                                                        const dataUrlIndex = additionalPreviews.slice(0, idx).filter(p => p.startsWith('data:')).length;
                                                                        setAdditionalFiles(prev => prev.filter((_, i) => i !== dataUrlIndex));
                                                                    }
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="product_description" className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                        <textarea
                                            id="product_description"
                                            rows={3}
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className="col-span-2 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="hasColors"
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                checked={hasColors}
                                                onChange={e => setHasColors(e.target.checked)}
                                            />
                                            <label htmlFor="hasColors" className="text-sm font-bold text-slate-700">Este producto tiene variantes de color</label>
                                        </div>

                                        {hasColors && (
                                            <div className="animate-fade-in pl-8">
                                                <label className="block text-sm font-medium text-slate-600 mb-1">Colores (separados por coma)</label>
                                                <input
                                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                    value={formColors}
                                                    onChange={e => setFormColors(e.target.value)}
                                                    placeholder="Ej: Rojo, Azul Marino, Negro"
                                                />
                                                <p className="text-xs text-slate-400 mt-1">Escribe los nombres de los colores disponibles.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-2 flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                            checked={formData.featured || false}
                                            onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                        />
                                        <label htmlFor="featured" className="text-sm font-medium text-slate-700">Producto Destacado (aparecerá primero)</label>
                                    </div>

                                    <div className="col-span-2 flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.active !== false ? 'bg-green-500' : 'bg-slate-300'}`}>
                                            <input
                                                id="product_active"
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.active !== false}
                                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                                aria-label="Producto activo o inactivo"
                                            />
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.active !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </div>
                                        <label className="text-sm font-bold text-slate-700">
                                            Producto Activo / Visible
                                            <span className="block text-xs font-normal text-slate-500">Si está desactivado, no aparecerá en el catálogo público.</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center">
                                    <div>
                                        {editingProduct && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleDeleteProduct(editingProduct.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Eliminar Producto
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button type="button" variant="ghost" onClick={() => setIsProductModalOpen(false)}>Cancelar</Button>
                                        <Button type="submit" disabled={isUploading}>
                                            {isUploading ? (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                'Guardar Producto'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* CATEGORY MODAL */}
            {
                isCategoryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold">{editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h3>
                                <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar modal">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                    <input
                                        required
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={categoryFormData.name || ''}
                                        onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                        placeholder="Ej: Botones"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL amigable)</label>
                                    <input
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={categoryFormData.slug || ''}
                                        onChange={e => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                                        placeholder="Ej: botones (se genera automáticamente)"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Si se deja vacío, se generará automáticamente del nombre.</p>
                                </div>

                                <div>
                                    <label htmlFor="category_parent_id" className="block text-sm font-medium text-slate-700 mb-1">Categoría Padre (Opcional)</label>
                                    <select
                                        id="category_parent_id"
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={categoryFormData.parent_id || ''}
                                        onChange={e => setCategoryFormData({ ...categoryFormData, parent_id: e.target.value || undefined })}
                                    >
                                        <option value="">Ninguna (Categoría principal)</option>
                                        {categories
                                            .filter(c => !c.parent_id && (!editingCategory || c.id !== editingCategory.id))
                                            .map(parent => (
                                                <option key={parent.id} value={parent.id}>{parent.name}</option>
                                            ))
                                        }
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1">Selecciona una categoría padre si esta es una subcategoría.</p>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</Button>
                                    <Button type="submit">Guardar Categoría</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* BULK EDIT MODAL */}
            {
                isBulkEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold">Edición Masiva</h3>
                                <button onClick={() => setIsBulkEditModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar modal">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                    <p className="text-sm text-blue-800">
                                        Estás editando <span className="font-bold">{selectedProductIds.size}</span> productos seleccionados.
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Solo se actualizarán los campos que modifiques a continuación.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Categoría (Opcional)</label>
                                        <select
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={bulkEditData.category_id || ''}
                                            onChange={e => setBulkEditData({ ...bulkEditData, category_id: e.target.value })}
                                        >
                                            <option value="">Mantener original</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nuevo Precio (Opcional)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            placeholder="Mantener original"
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={bulkEditData.price ?? ''}
                                            onChange={e => setBulkEditData({ ...bulkEditData, price: parseNumberInput(e.target.value) })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Color de Herraje (Opcional)</label>
                                        <select
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={bulkEditData.hardware_color || ''}
                                            onChange={e => setBulkEditData({ ...bulkEditData, hardware_color: e.target.value as 'Dorado' | 'Plata' | 'GoldenRose' | 'Otros' | '' })}
                                        >
                                            <option value="">Mantener original</option>
                                            <option value="Dorado">Dorado</option>
                                            <option value="Plata">Plata</option>
                                            <option value="GoldenRose">GoldenRose</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                        <p className="text-xs text-slate-400 mt-1">Solo aplica para productos de herrajes.</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setIsBulkEditModalOpen(false)}>Cancelar</Button>
                                    <Button
                                        type="button"
                                        onClick={handleBulkUpdate}
                                        disabled={isUploading || (!bulkEditData.category_id && bulkEditData.price === undefined && !bulkEditData.hardware_color)}
                                    >
                                        {isUploading ? 'Actualizando...' : 'Aplicar a Todos'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};
