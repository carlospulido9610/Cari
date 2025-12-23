import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../../types';

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string, variantName?: string, color?: string) => void;
    updateQuantity: (productId: string, quantity: number, variantName?: string, color?: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('shopping_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error parsing cart from local storage', e);
            }
        }
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        localStorage.setItem('shopping_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: CartItem) => {
        setItems(prevItems => {
            // Check if item already exists (same ID, same variant, same color)
            const existingItemIndex = prevItems.findIndex(item =>
                item.productId === newItem.productId &&
                item.selectedVariant?.name === newItem.selectedVariant?.name &&
                item.selectedColor === newItem.selectedColor
            );

            if (existingItemIndex >= 0) {
                // Update quantity (Immutable)
                const newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + newItem.quantity
                };
                return newItems;
            } else {
                // Add new
                return [...prevItems, newItem];
            }
        });
        // Optional: Open cart drawer when adding
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string, variantName?: string, color?: string) => {
        setItems(prevItems => prevItems.filter(item =>
            !(item.productId === productId &&
                item.selectedVariant?.name === variantName &&
                item.selectedColor === color)
        ));
    };

    const updateQuantity = (productId: string, quantity: number, variantName?: string, color?: string) => {
        if (quantity <= 0) {
            removeFromCart(productId, variantName, color);
            return;
        }

        setItems(prevItems => prevItems.map(item => {
            if (item.productId === productId &&
                item.selectedVariant?.name === variantName &&
                item.selectedColor === color) {
                return { ...item, quantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
