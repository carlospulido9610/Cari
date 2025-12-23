export interface CategoryWithSub {
    id: string;
    name: string;
    slug: string;
    subcategories?: SubCategory[];
}

export interface SubCategory {
    id: string;
    name: string;
    slug: string;
}

export const productCategories: CategoryWithSub[] = [
    {
        id: '1',
        name: 'Telas',
        slug: 'telas',
        subcategories: [
            { id: '1-1', name: 'Algodón', slug: 'algodon' },
            { id: '1-2', name: 'Poliéster', slug: 'poliester' },
            { id: '1-3', name: 'Lino', slug: 'lino' },
            { id: '1-4', name: 'Seda', slug: 'seda' },
            { id: '1-5', name: 'Lana', slug: 'lana' },
            { id: '1-6', name: 'Mezclillas', slug: 'mezclillas' },
        ]
    },
    {
        id: '2',
        name: 'Mercería',
        slug: 'merceria',
        subcategories: [
            { id: '2-1', name: 'Botones', slug: 'botones' },
            { id: '2-2', name: 'Cierres', slug: 'cierres' },
            { id: '2-3', name: 'Elásticos', slug: 'elasticos' },
            { id: '2-4', name: 'Velcro', slug: 'velcro' },
        ]
    },
    {
        id: '3',
        name: 'Herrajes',
        slug: 'herrajes',
        subcategories: [
            { id: '3-1', name: 'Hebillas y Reguladores', slug: 'hebillas-reguladores' },
            { id: '3-2', name: 'Remaches y Ojalillos', slug: 'remaches-ojalillos' },
            { id: '3-3', name: 'Mosquetones y Argollas', slug: 'mosquetones-argollas' },
            { id: '3-4', name: 'Terminales de cordón', slug: 'terminales-cordon' },
        ]
    },
    {
        id: '4',
        name: 'Insumos de Etiquetado y Embalaje',
        slug: 'etiquetado-embalaje',
        subcategories: [
            { id: '4-1', name: 'Etiquetas', slug: 'etiquetas' },
            { id: '4-2', name: 'Hangtags', slug: 'hangtags' },
            { id: '4-3', name: 'Bolsas', slug: 'bolsas' },
            { id: '4-4', name: 'Pistolas de plastiflecha y navetes', slug: 'pistolas-navetes' },
        ]
    },
    {
        id: '5',
        name: 'Maquinaria y Herramientas',
        slug: 'maquinaria-herramientas',
        subcategories: [
            { id: '5-1', name: 'Tijeras y Cortadores', slug: 'tijeras-cortadores' },
            { id: '5-2', name: 'Herramientas varias', slug: 'herramientas-varias' },
        ]
    }
];
