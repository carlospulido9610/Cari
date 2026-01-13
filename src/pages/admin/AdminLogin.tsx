import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../../services/supabaseClient';
import { Button } from '../../../components/Button';
import { Lock, Mail, Key } from 'lucide-react';

export const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn(email, password);
            localStorage.setItem('admin_auth', 'true');
            navigate('/admin/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Credenciales inválidas. Verifica tu correo y contraseña.');
        } finally {
            setLoading(false);
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

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/30 ml-1 flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@cari.com"
                                className="w-full bg-brand-ivory/50 border-b border-brand-ink/10 py-3 px-1 text-base focus:border-brand-ink outline-none transition-colors placeholder:text-brand-ink/10"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/30 ml-1 flex items-center gap-2">
                                <Key className="w-3 h-3" /> Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-brand-ivory/50 border-b border-brand-ink/10 py-3 px-1 text-base focus:border-brand-ink outline-none transition-colors placeholder:text-brand-ink/10 tracking-widest"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-[10px] uppercase tracking-widest font-bold text-red-500 text-center animate-shake">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-brand-ink text-brand-ivory text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-ink/90 transition-all shadow-xl shadow-brand-ink/10 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Verificando...' : 'Iniciar Sesión'}
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
