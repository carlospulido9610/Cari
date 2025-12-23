import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { Lock } from 'lucide-react';

export const AdminLogin: React.FC = () => {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple client-side hardcoded key for demonstration. 
        // In production, use Supabase Auth or Environment Variables.
        if (key === 'admin123' || key === import.meta.env.VITE_ADMIN_KEY) {
            localStorage.setItem('admin_auth', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Clave incorrecta');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6">
                    <Lock className="text-white w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso Administrativo</h1>
                <p className="text-slate-500 mb-8">Ingrese su clave de acceso para gestionar el catálogo.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="Clave de acceso"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    />
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <Button type="submit" className="w-full">
                        Ingresar
                    </Button>
                </form>
            </div>
        </div>
    );
};
