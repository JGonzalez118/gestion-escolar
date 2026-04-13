import { useState } from "react";
import { getPerfil, login } from "../api/auth";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await login(username, password);
            const perfil = await getPerfil();
            localStorage.setItem("rol", perfil.rol);
            
            console.log(perfil);
            alert("Login Exitoso");

            if (perfil.rol === "docente") {
                window.location.href = "/";
            } else {
                window.location.href = "/"; //! SE MUEVE EL ESTUDIANTE A UN DASHBOARD DISTINTO
            }

        } catch (error) {
            alert("Error en el login.");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Nombre de Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="text"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Iniciar Sesión</button>
        </form>
    )
}

export default Login;

const styles = {

    header: {
        background: "var(--card-bg)",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    cards: {
        display: "flex",
        gap: "20px",
        marginBottom: "20px",
    },

    card: {
        flex: 1,
        background: "var(--card-bg)",
        padding: "20px",
        borderRadius: "12px",
        textAlign: "center",
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px",
    },

    box: {
        background: "var(--card-bg)",
        padding: "20px",
        borderRadius: "12px",
    },

    item: {
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #eee",
    },
};