// src/components/Layout.tsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Modal from './Modal'; // Import Modal component
import TaskForm from './TaskForm'; // Import TaskForm component

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex h-screen bg-stone-50 dark:bg-black text-stone-900 dark:text-white overflow-hidden">
            {/* Pass the modal open handler to Sidebar */}
            <Sidebar onOpenModal={handleOpenModal} />

            {/* Apply blur conditionally to the main content */}
            <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${isModalOpen ? 'blur-content' : ''}`}>
                {children}
            </main>

            {/* Task Creation Modal - Rendered within Layout */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <TaskForm />
            </Modal>
        </div>
    );
};

export default Layout;