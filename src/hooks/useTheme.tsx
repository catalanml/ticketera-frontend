// src/hooks/useTheme.tsx
import { useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

const useTheme = () => {
    // Inicializa el estado con el valor de localStorage (si existe) o 'system'
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme === 'dark' || storedTheme === 'light'
            ? (storedTheme as Theme)
            : 'system';
    });

    // Elemento raíz; document.documentElement es constante
    const element = document.documentElement;
    // Consulta de media para detectar preferencia oscura del sistema
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Función que sincroniza la clase 'dark' según localStorage o preferencia del sistema
    const onWindowMatch = useCallback((): void => {
        if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && darkQuery.matches)) {
            element.classList.add('dark');
        } else {
            element.classList.remove('dark');
        }
    }, [element, darkQuery]);

    // Al montar, se sincroniza el tema
    useEffect(() => {
        onWindowMatch();
    }, [onWindowMatch]);

    // Cada vez que cambia el estado 'theme', actualiza localStorage y la clase 'dark'
    useEffect(() => {
        if (theme === 'dark') {
            element.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else if (theme === 'light') {
            element.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.removeItem('theme');
            onWindowMatch();
        }
    }, [theme, element, onWindowMatch]);

    // Escucha cambios en la preferencia del sistema si no se ha fijado un tema en localStorage
    useEffect(() => {
        const changeHandler = (e: MediaQueryListEvent): void => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    element.classList.add('dark');
                } else {
                    element.classList.remove('dark');
                }
            }
        };

        darkQuery.addEventListener('change', changeHandler);
        return () => {
            darkQuery.removeEventListener('change', changeHandler);
        };
    }, [element, darkQuery]);

    return { theme, setTheme };
};

export default useTheme;
