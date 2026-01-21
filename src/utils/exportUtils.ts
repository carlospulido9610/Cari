import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Product, Category } from '../../types';

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
            Estado: p.active ? 'Activo' : 'Inactivo'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
    XLSX.writeFile(workbook, `Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (products: Product[], categories: Category[]) => {
    const doc = new jsPDF();

    // Company/Header Info
    doc.setFontSize(20);
    doc.text("Reporte de Inventario", 14, 22);

    doc.setFontSize(10);
    doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total de productos: ${products.length}`, 14, 35);

    // Calculate Totals
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    const tableData = products.map(p => {
        const categoryName = categories.find(c => c.id === p.category_id)?.name || '-';
        return [
            p.sku || '-',
            p.name,
            categoryName,
            `$${(p.price || 0).toFixed(2)}`,
            (p.stock || 0).toString(),
            `$${((p.price || 0) * (p.stock || 0)).toFixed(2)}`
        ];
    });

    autoTable(doc, {
        head: [['SKU', 'Producto', 'Categoría', 'Precio', 'Stock', 'Valor Total']],
        body: tableData,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Blue header
        styles: { fontSize: 8, cellPadding: 2 },
        foot: [['', '', 'Totales Generales:', '', totalStock.toString(), `$${totalValue.toFixed(2)}`]],
        footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save(`Inventario_${new Date().toISOString().split('T')[0]}.pdf`);
};
