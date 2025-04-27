# Ticketera - Aplicación de Gestíon de Tickets

Proyecto en desarrollo de una aplicación de ticketing minimalista y moderna, enfocada en un diseño tipo pizarra de trabajo (“kanban”). 

---

## 👨‍💼 Tecnologías utilizadas

- **React 19** (experimental, v19 beta)
- **TypeScript** (programación tipada estricta)
- **Vite** (entorno de desarrollo ultrarrápido)
- **Tailwind CSS 4** (con `@custom-variant dark` y `@theme` para animaciones)
- **Heroicons** (iconografía moderna de interfaz)
- **Axios** (gestión de solicitudes HTTP y token JWT)
- **React Router DOM v6** (navegación SPA)


## 📆 Estado actual del proyecto

### Funcionalidades principales implementadas:

- ✅ **Login funcional**:
  - Autenticación usando **Axios** conectado a un backend real (`/auth/login`).
  - Almacenamiento del token JWT en **localStorage**.
  - Actualización automática del estado de autenticación.
  - Redirección dinámica basada en si el usuario está autenticado.

- ✅ **Dark Mode / Light Mode** totalmente funcional:
  - ⚫ **Modo oscuro:** fondo negro, textos blancos.
  - ⚪ **Modo claro:** escala de grises (`stone-*` de Tailwind).
  - Cambio de tema implementado mediante un **botón flotante** (ThemeToggle).

- ✅ **Diseño minimalista responsivo**:
  - Basado en tarjetas suaves, bordes ligeros, sombras sutiles.
  - Inspirado en pizarra de trabajo moderna (tipo Kanban / Trello).

- ✅ **Autenticación global**:
  - Creación de un **AuthContext** (con `AuthProvider` + `useAuth` hook).
  - Protección de rutas (únicamente usuarios autenticados acceden a `/dashboard`).

- ✅ **Animación sutil para prioridades**:
  - Animación `subtle-pulse-kf` para resaltar tarjetas con prioridad alta.


## 🚀 Objetivos conseguidos hasta ahora

- Flujo completo de login / token / dashboard.
- Contexto de autenticación centralizado y reutilizable.
- Tema oscuro y tema claro coherentes en todo el sistema.
- Óptima estructura de carpetas y separación de responsabilidades.
- Preparación para escalar a Dashboard, Tickets, Usuarios, Roles.


## 🖊þ Estructura actual del proyecto
