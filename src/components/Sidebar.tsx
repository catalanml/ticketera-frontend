// src/components/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// Asegúrate que la ruta de importación a tu NUEVO ThemeToggle sea correcta
import ThemeToggle from './ThemeToggle';
import TicketIcon from './TicketIcon';
import { useAuth } from '../hooks/useAuth';
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Estilo base para los NavLink (igual que antes)
    const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
            ? 'bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white'
            : 'text-stone-600 dark:text-white/60 hover:bg-stone-100 dark:hover:bg-white/10 hover:text-stone-900 dark:hover:text-white'
        }`;

    return (
        <aside className="w-64 flex-shrink-0 border-r border-stone-200 dark:border-white/10 bg-white dark:bg-black flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center px-4 border-b border-stone-200 dark:border-white/10 flex-shrink-0">
                <NavLink to="/dashboard" className="flex items-center gap-2 text-xl font-semibold tracking-tighter text-stone-700 dark:text-white">
                    <TicketIcon className="h-6 w-6 text-stone-700 dark:text-white" />
                    Ticketera
                </NavLink>
            </div>

            {/* Navegación Principal */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <NavLink to="/dashboard" className={navLinkClass} end>
                    <HomeIcon className="h-5 w-5" />
                    Dashboard
                </NavLink>
                <NavLink to="/tasks" className={navLinkClass}>
                    <ClipboardDocumentListIcon className="h-5 w-5" />
                    Tareas
                </NavLink>
                <NavLink to="/settings" className={navLinkClass}>
                    <Cog6ToothIcon className="h-5 w-5" />
                    Ajustes
                </NavLink>

                {/* --- Integración del ThemeToggle aquí --- */}
                {/* Usamos un div wrapper para darle un padding similar a los NavLink */}
                {/* y centrar verticalmente el botón del ThemeToggle */}
                <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                    <span className='text-stone-600 dark:text-white/60'>Tema</span> {/* Etiqueta opcional */}
                    <ThemeToggle /> {/* Tu componente ThemeToggle con dropdown */}
                </div>
                {/* Puedes ajustar el 'justify-between' si prefieres otra alineación */}

            </nav>

            {/* Acciones Inferiores (Logout) */}
            <div className="px-4 py-4 border-t border-stone-200 dark:border-white/10 mt-auto space-y-2">
                {/* Eliminamos el ThemeToggle simple que estaba aquí */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-stone-300 dark:border-white/20 text-stone-700 dark:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition"
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;