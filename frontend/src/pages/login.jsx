import { useState } from "react";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { getPerfil, login } from "../api/auth";
import "../styles/login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [verPassword, setVerPassword] = useState(false);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const camposVacios = !username.trim() || !password.trim();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            await login(username, password);
            const perfil = await getPerfil();
            localStorage.setItem("rol", perfil.rol);

            localStorage.setItem(
                "salon_id",
                perfil.salon?.id
            );

            localStorage.setItem(
                "salon_nombre",
                perfil.salon?.nombre
            );

            localStorage.setItem(
                "perfil",
                JSON.stringify(perfil)
            );

            if (perfil.rol === "docente") {
                window.location.href = "/";
            } else {
                window.location.href = "/"; //! SE MUEVE EL ESTUDIANTE A UN DASHBOARD DISTINTO
            }

        } catch {
            setError("Credenciales incorrectas. Intenta de nuevo.");
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="login">

            <div className="login__form-panel">
                <form className="login__form" onSubmit={handleSubmit}>

                    <div className="login__brand">
                        <span className="login__logo">
                            <GraduationCap size={28} strokeWidth={2.2} />
                        </span>
                        <h1 className="login__title">Gestión Escolar</h1>
                        <p className="login__subtitle">
                            Ingresa con tu cuenta para continuar
                        </p>
                    </div>

                    <div className="login__field">
                        <label className="login__label" htmlFor="username">
                            Nombre de usuario
                        </label>
                        <input
                            id="username"
                            className="login__input"
                            type="text"
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div className="login__field">
                        <label className="login__label" htmlFor="password">
                            Contraseña
                        </label>
                        <div className="login__input-wrap">
                            <input
                                id="password"
                                className="login__input login__input--password"
                                type={verPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="login__toggle"
                                onClick={() => setVerPassword((v) => !v)}
                                aria-label={
                                    verPassword
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                            >
                                {verPassword
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="login__error">{error}</p>}

                    <button
                        className="login__button"
                        type="submit"
                        disabled={cargando || camposVacios}
                    >
                        {cargando ? "Ingresando..." : "Iniciar sesión"}
                    </button>
                </form>
            </div>

            <div className="login__hero-panel">
                <span className="login__blob login__blob--1" />
                <span className="login__blob login__blob--2" />
                <span className="login__blob login__blob--3" />
                <div className="login__hero-content">
                    <h2>Bienvenido de nuevo</h2>
                    <p>
                        Administra la asistencia y las calificaciones de
                        tus estudiantes en un solo lugar.
                    </p>
                </div>
            </div>

        </div>
    )
}

export default Login;
