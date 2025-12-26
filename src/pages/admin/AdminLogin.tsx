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
        <div className="min-h-screen bg-brand-ivory flex items-center justify-center px-4 relative overflow-hidden">
            {/* Architectural Background Detail */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-ink/[0.02] -skew-x-12 transform origin-top translate-x-20" />

            <div className="relative max-w-md w-full">
                <div className="bg-white p-12 shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-brand-ink/5">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-12 h-12 border border-brand-ink flex items-center justify-center mb-8 rotate-45 group hover:rotate-90 transition-transform duration-700">
                            <Lock className="w-5 h-5 text-brand-ink -rotate-45 group-hover:-rotate-90 transition-transform duration-700" />
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/30 ml-1">Clave de Enlace</label>
                            <input
                                type="password"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                                className="w-full bg-brand-ivory/50 border-b border-brand-ink/10 py-4 px-1 text-center text-lg focus:border-brand-ink outline-none transition-colors placeholder:text-brand-ink/10 tracking-[0.5em]"
                            />
                        </div>

                        {error && (
                            <p className="text-[10px] uppercase tracking-widest font-bold text-red-500 text-center animate-shake">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-5 bg-brand-ink text-brand-ivory text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-brand-ink/90 transition-all shadow-xl shadow-brand-ink/10"
                        >
                            Verificar Identidad
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-[9px] uppercase tracking-widest font-bold text-brand-ink/20">
                    &copy; {new Date().getFullYear()} CARI INSUMOS VENEZUELA
                </p>
            </div>
        </div>
    );
};
