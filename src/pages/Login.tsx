import React, { useState } from 'react';
import ThemeToggle from "../components/ThemeToggle";
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import TicketIcon from "../components/TicketIcon";
import { loginRequest } from '../services/auth/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await loginRequest(email, password);
            localStorage.setItem('token', response.token);
            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-black text-stone-900 dark:text-white flex flex-col items-center pt-16 sm:justify-center sm:pt-0">

            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <a href="#" className="flex items-center gap-2 text-2xl font-semibold tracking-tighter text-stone-700 dark:text-white">
                <TicketIcon className="h-6 w-6 text-stone-700 dark:text-white" />
                Ticketera
            </a>

            <div className="relative mt-12 w-full max-w-md px-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-stone-300 dark:via-sky-300 to-transparent mb-[-1px]" />

                <div className="rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-black p-6 shadow-md">
                    <h3 className="text-xl font-semibold leading-6 tracking-tight text-stone-900 dark:text-white">Iniciar sesión</h3>
                    <p className="mt-1.5 text-sm text-stone-500 dark:text-white/50">
                        Bienvenido, ingresa tus credenciales para continuar.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div className="group relative rounded-lg border border-stone-300 dark:border-white/20 focus-within:border-stone-500 dark:focus-within:border-sky-400 px-3 pb-1.5 pt-2.5 focus-within:ring focus-within:ring-stone-500/50 dark:focus-within:ring-sky-400/20">
                            <label className="text-xs text-stone-500 dark:text-white/50 group-focus-within:text-stone-900 dark:group-focus-within:text-white">Correo electrónico</label>
                            <div className="flex items-center gap-2">
                                <EnvelopeIcon className="h-5 w-5 text-stone-400 dark:text-white/40" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent border-0 p-0 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-0"
                                    placeholder="ejemplo@correo.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="group relative rounded-lg border border-stone-300 dark:border-white/20 focus-within:border-stone-500 dark:focus-within:border-sky-400 px-3 pb-1.5 pt-2.5 focus-within:ring focus-within:ring-stone-500/50 dark:focus-within:ring-sky-400/20">
                            <label className="text-xs text-stone-500 dark:text-white/50 group-focus-within:text-stone-900 dark:group-focus-within:text-white">Contraseña</label>
                            <div className="flex items-center gap-2">
                                <LockClosedIcon className="h-5 w-5 text-stone-400 dark:text-white/40" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent border-0 p-0 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-0"
                                    placeholder="********"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-stone-500 dark:text-white/60">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="accent-stone-500 hover:cursor-pointer" />
                                Recordarme
                            </label>
                            <a href="#" className="underline hover:text-stone-900 dark:hover:text-white">¿Olvidaste tu contraseña?</a>
                        </div>

                        <div className="flex justify-end gap-2">
                            <a
                                href="#"
                                className="px-4 py-2 text-sm font-medium rounded-md border border-stone-300 dark:border-white/20 text-stone-700 dark:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition"
                            >
                                Crear cuenta
                            </a>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-semibold rounded-md bg-stone-900 dark:bg-white text-white dark:text-black hover:bg-stone-700 dark:hover:bg-stone-300 transition hover:cursor-pointer"
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;