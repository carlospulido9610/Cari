import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { ServicesSection } from './components/ServicesSection';
import { ProductsPage } from './src/pages/ProductsPage';
import { QuotePage } from './src/pages/QuotePage';
import { ServicesPage } from './src/pages/ServicesPage';
import { ContactPage } from './src/pages/ContactPage';
import { ProductDetailsPage } from './src/pages/ProductDetailsPage';
import { FAQPage } from './src/pages/FAQPage';
import { AdminLogin } from './src/pages/admin/AdminLogin';
import { AdminDashboard } from './src/pages/admin/AdminDashboard';
import { ToastMessage } from './types';
import { CartProvider } from './src/context/CartContext';
import { CartDrawer } from './src/components/CartDrawer';
import { ProtectedRoute } from './src/components/ProtectedRoute';

function HomePage() {
  return (
    <>
      <Hero />
      <ServicesSection />
      {/* Home page can be expanded later with teasers */}
    </>
  );
}

function AppLayout() {
  const location = useLocation();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hide Navbar and Footer on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-ink bg-brand-ivory overflow-x-hidden w-full relative">
      <CartDrawer />
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/productos"
            element={<ProductsPage />}
          />
          <Route
            path="/producto/:id"
            element={<ProductDetailsPage />}
          />
          <Route
            path="/cotizar"
            element={
              <QuotePage
                onSuccess={(msg) => addToast('success', msg)}
                onError={(msg) => addToast('error', msg)}
              />
            }
          />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/preguntas-frecuentes" element={<FAQPage />} />
          <Route
            path="/contacto"
            element={
              <ContactPage
                onSuccess={(msg) => addToast('success', msg)}
                onError={(msg) => addToast('error', msg)}
              />
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>
    </div>
  );
}

import { ScrollToTop } from './src/components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <AppLayout />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;