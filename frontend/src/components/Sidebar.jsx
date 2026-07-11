import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    School,
    Users,
    ClipboardList,
    FileText,
    Sun,
    Moon,
    LogOut,
} from "lucide-react";

import { logout } from "../api/auth";
import { ThemeContext } from "../context/ThemeContext";
import "../styles/sidebar.css";

// Cada enlace declara los roles que pueden verlo.
// Si `roles` se omite, el enlace es visible para todos.
const NAV_ITEMS = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/salon", label: "Salón", icon: School, roles: ["docente"] },
    { to: "/estudiantes", label: "Estudiantes", icon: Users, roles: ["docente"] },
    { to: "/actividades", label: "Actividades", icon: ClipboardList },
    { to: "/boletin", label: "Boletín escolar", icon: FileText, roles: ["docente"] },
];

const handleLogout = () => {
    logout();
    window.location.href = "/login";
};

// Lee el perfil guardado en el login; devuelve null si no hay o está corrupto.
function leerPerfil() {
    try {
        return JSON.parse(localStorage.getItem("perfil")) || null;
    } catch {
        return null;
    }
}

// Iniciales a partir del nombre completo (máx. 2 letras).
function iniciales(nombre) {
    if (!nombre) return "?";
    return nombre
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}

export default function Sidebar() {

    const { toggleTheme, theme } = useContext(ThemeContext);

    const perfil = leerPerfil();
    const rol = perfil?.rol ?? localStorage.getItem("rol");

    const nombre = perfil?.nombre_completo ?? "Usuario";
    const salon = perfil?.salon?.nombre;
    const rolLabel = rol === "docente" ? "Docente" : "Estudiante";

    const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(rol));

    return (
        <aside className="sidebar">

            {/* Marca */}
            <div className="sidebar__brand">
                <span className="sidebar__brand-mark">GE</span>
                <span className="sidebar__brand-text">
                    Gestión <em>Escolar</em>
                </span>
            </div>

            {/* Perfil del usuario en sesión */}
            <div className="sidebar__profile">
                <span className="sidebar__avatar">{iniciales(nombre)}</span>
                <span className="sidebar__profile-info">
                    <span className="sidebar__profile-name">{nombre}</span>
                    <span className="sidebar__profile-meta">
                        {rolLabel}{salon ? ` · ${salon}` : ""}
                    </span>
                </span>
            </div>

            {/* Navegación (filtrada por rol) */}
            <nav className="sidebar__nav">
                {items.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/"}
                        className={({ isActive }) =>
                            "sidebar__link" + (isActive ? " sidebar__link--active" : "")
                        }
                    >
                        <Icon size={18} className="sidebar__link-icon" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Acciones */}
            <div className="sidebar__footer">
                <button
                    type="button"
                    className="sidebar__action"
                    onClick={toggleTheme}
                >
                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                    <span>{theme === "light" ? "Modo oscuro" : "Modo claro"}</span>
                </button>

                <button
                    type="button"
                    className="sidebar__action sidebar__action--logout"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
}
