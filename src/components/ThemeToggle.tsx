// src/components/ThemeToggle.tsx
import { useState } from "react";
import { SunIcon, MoonIcon, Cog8ToothIcon } from "@heroicons/react/20/solid";
import useTheme from "../hooks/useTheme";
import React from "react";

// Definición de los tipos posibles para el tema
type ThemeOption = "dark" | "light" | "system";

// Objeto con la información de cada tema: nombre e ícono
const themes: Record<ThemeOption, { name: string; icon: React.JSX.Element }> = {
    light: { name: "Light", icon: <SunIcon className="h-6 w-6 text-stone-700 dark:text-white" /> },
    dark: { name: "Dark", icon: <MoonIcon className="h-6 w-6 text-stone-700 dark:text-white" /> },
    system: { name: "System", icon: <Cog8ToothIcon className="h-6 w-6 text-stone-700 dark:text-white" /> },
};

const ThemeToggle = () => {
    // Estado para manejar la visibilidad del dropdown
    const [dropdownOpen, setDropdownOpen] = useState(false);
    // Hook personalizado para obtener y modificar el tema
    const { theme, setTheme } = useTheme();

    // Alterna la visibilidad del menú
    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    // Cambia el tema al seleccionar una opción y cierra el dropdown
    const handleThemeSelect = (selectedTheme: ThemeOption) => {
        setTheme(selectedTheme);
        setDropdownOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
            {/* Botón que muestra el icono del tema actual */}
            <button
                onClick={toggleDropdown}
                className="inline-flex justify-center items-center w-10 h-10 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-full shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 dark:focus:ring-sky-500"
                aria-label="Toggle theme"
            >
                {themes[theme as ThemeOption]?.icon}
            </button>
            {/* Dropdown del menú de temas */}
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 origin-top-right bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md shadow-lg z-10">
                    <div className="py-1">
                        {Object.entries(themes).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => handleThemeSelect(key as ThemeOption)}
                                className="flex items-center w-full px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-none focus:bg-stone-100 dark:focus:bg-stone-800"
                            >
                                {React.cloneElement(value.icon, { className: `${value.icon.props.className} text-stone-700 dark:text-white` })}
                                <span className="ml-2">{value.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;