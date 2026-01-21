import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Product, Category } from '../../types';

// Helper to convert image URL to Base64
const getImageDataUrl = async (url: string): Promise<string | null> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error fetching image for export:', error);
        return null;
    }
};

export const exportToExcel = (products: Product[], categories: Category[]) => {
    const data = products.map(p => {
        const categoryName = categories.find(c => c.id === p.category_id)?.name || 'Sin Categoría';
        const stock = p.stock || 0;
        const price = p.price || 0;
        return {
            SKU: p.sku || '-',
            Nombre: p.name,
            Categoría: categoryName,
            Precio: price,
            Stock: stock,
            'Valor Total': price * stock,
            Estado: p.active ? 'Activo' : 'Inactivo',
            'Imagen URL': p.image_url || ''
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
    XLSX.writeFile(workbook, `Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export interface ExportPDFOptions {
    includeImages?: boolean;
    title?: string;
}

export const exportToPDF = async (products: Product[], categories: Category[], options: ExportPDFOptions = {}) => {
    const doc = new jsPDF();
    const { includeImages = false, title = "Reporte de Inventario" } = options;

    // Company/Header Info
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185); // Blue
    doc.text(title, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total items: ${products.length}`, 14, 35);

    // Prepare data
    const tableBody = [];

    // If images are included, we need to fetch them first
    // This might be slow for many products, so we process in chunks or parallel if possible
    // For simplicity in client-side, we map normally but wait for images if needed.

    for (const p of products) {
        const categoryName = categories.find(c => c.id === p.category_id)?.name || '-';

        const rowData: any[] = [
            p.sku || '-',
            p.name,
            categoryName,
            `$${(p.price || 0).toFixed(2)}`,
            (p.stock || 0).toString(),
            `$${((p.price || 0) * (p.stock || 0)).toFixed(2)}`
        ];

        if (includeImages) {
            // Unshift empty string placeholder for image column at index 0
            rowData.unshift('');
        }

        // We attach the image data to the row object for the hook to use, 
        // or we can pre-fetch. Let's pre-fetch if needed.
        let imageData = null;
        if (includeImages && p.image_url) {
            imageData = await getImageDataUrl(p.image_url);
        }

        // Add metadata to the row for the draw hook
        (rowData as any).imageData = imageData;

        tableBody.push(rowData);
    }

    // Totals
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    const headers = ['SKU', 'Producto', 'Categoría', 'Precio', 'Stock', 'Total'];
    if (includeImages) {
        headers.unshift('img'); // Placeholder header for image column
    }

    const footerRow = ['', '', 'Totales:', '', totalStock.toString(), `$${totalValue.toFixed(2)}`];
    if (includeImages) {
        footerRow.unshift(''); // Adjust for image column
    }

    autoTable(doc, {
        head: [headers],
        body: tableBody,
        startY: 45,
        theme: 'striped',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            halign: 'center',
            fontStyle: 'bold'
        },
        columnStyles: includeImages ? {
            0: { cellWidth: 25, minCellHeight: 25, halign: 'center', valign: 'middle' }, // Image column
            1: { cellWidth: 25 }, // SKU
            2: { cellWidth: 'auto' }, // Name
        } : {
            0: { cellWidth: 25 }, // SKU
        },
        styles: {
            fontSize: 8,
            cellPadding: 2,
            valign: 'middle',
            overflow: 'linebreak'
        },
        foot: [footerRow],
        footStyles: {
            fillColor: [245, 247, 250],
            textColor: 0,
            fontStyle: 'bold',
            halign: 'right'
        },
        didDrawCell: (data) => {
            if (includeImages && data.section === 'body' && data.column.index === 0) {
                const row: any = data.row.raw;
                if (row.imageData) {
                    try {
                        const imgProps = doc.getImageProperties(row.imageData);
                        // Center image in cell
                        const cellWidth = data.cell.width;
                        const cellHeight = data.cell.height;
                        const imgSize = 20; // Max size

                        // Simple fitting logic
                        const x = data.cell.x + (cellWidth - imgSize) / 2;
                        const y = data.cell.y + (cellHeight - imgSize) / 2;

                        doc.addImage(row.imageData, 'JPEG', x, y, imgSize, imgSize);
                    } catch (e) {
                        // Ignore invalid images
                    }
                }
            }
        }
    });

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save(`Inventario_${new Date().toISOString().split('T')[0]}.pdf`);
};
