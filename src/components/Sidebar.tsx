// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import TicketIcon from './TicketIcon';
import NavButton from './NavButton'; // Import the new NavButton component
import Modal from './Modal'; // Import the new Modal component
import TaskForm from './TaskForm'; // Import the new TaskForm component
import { useAuth } from '../hooks/useAuth';
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    PlusIcon // Assuming you want a plus icon for adding a task
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

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

                {/* New button to create a task */}
                <NavButton
                    icon={<PlusIcon className="h-5 w-5" />}
                    text="Crear Tarea"
                    onClick={handleOpenModal}
                />

                <NavLink to="/settings" className={navLinkClass}>
                    <Cog6ToothIcon className="h-5 w-5" />
                    Ajustes
                </NavLink>

                {/* ThemeToggle integration */}
                <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                    <span className='text-stone-600 dark:text-white/60'>Tema</span>
                    <ThemeToggle />
                </div>

            </nav>

            {/* Lower Actions (Logout) */}
            <div className="px-4 py-4 border-t border-stone-200 dark:border-white/10 mt-auto space-y-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-stone-300 dark:border-white/20 text-stone-700 dark:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition"
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>

            {/* Task Creation Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <TaskForm />
            </Modal>
        </aside>
    );
};

export default Sidebar;