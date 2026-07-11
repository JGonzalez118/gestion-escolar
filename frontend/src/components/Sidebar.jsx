import React, { useContext } from "react";
import {
    CSidebar,
    CSidebarNav,
} from "@coreui/react";

import { NavLink } from "react-router-dom";
import { logout } from "../api/auth";
import { ThemeContext } from "../context/ThemeContext";

const handleLogout = () => {
    logout();
    window.location.href = "/login";
};

export default function Sidebar() {

    const { toggleTheme, theme } = useContext(ThemeContext);

    return (
        <CSidebar
            style={{
                width: "220px",
                height: "100vh",
                backgroundColor: "var(--secondary)",
                color: "white",
                padding: "20px 10px",
            }}
        >
            {/* LOGO DEFAULT PQ HAY Q PONER ALGO NS */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 style={{ fontSize: "40px" }}>⭐</h1>
            </div>


            <CSidebarNav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                <NavItem to="/" label="Dashboard" />
                <NavItem to="/salon" label="Salón" />
                <NavItem to="/estudiantes" label="Estudiantes" />
                <NavItem to="/actividades" label="Actividades" />
                <NavItem to="/boletin" label="Boletin escolar" />

            </CSidebarNav>

            <button
                onClick={toggleTheme}
                style={{
                    marginTop: "auto",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer"
                }}
            >

                {
                    theme === "light"
                        ? "🌙 Modo oscuro"
                        : "☀️ Modo claro"
                }

            </button>

            <button onClick={handleLogout}>
                Cerrar Sesión
            </button>
        </CSidebar>
    );
}


function NavItem({ to, label }) {
    return (
        <NavLink
            to={to}
            style={({ isActive }) => ({
                textDecoration: "none",
                backgroundColor: isActive ? "#e4e7f2" : "transparent",
                color: isActive ? "#000" : "white",
                padding: "12px",
                borderRadius: "12px",
                textAlign: "center",
                fontWeight: "500",
                transition: "0.2s",
            })}
        >
            {label}
        </NavLink>
    );
}