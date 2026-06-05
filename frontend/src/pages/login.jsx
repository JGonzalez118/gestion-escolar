import { useState, useContext } from "react";
import { Eye, EyeOff, ArrowRight, Sun, Moon } from "lucide-react";
import { getPerfil, login } from "../api/auth";
import { ThemeContext } from "../context/ThemeContext";
import "../styles/login.css";

const Login = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
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

            <button
                type="button"
                className="login__theme"
                onClick={toggleTheme}
                aria-label={
                    theme === "light"
                        ? "Activar modo oscuro"
                        : "Activar modo claro"
                }
            >
                {theme === "light"
                    ? <Moon size={18} />
                    : <Sun size={18} />}
            </button>

            <div className="login__card">

                <header className="login__head">
                    <h1 className="login__title">
                        Gestión <em>Escolar</em>
                    </h1>
                    <p className="login__lead">
                        Ingresa para gestionar la asistencia y las
                        calificaciones de tu salón.
                    </p>
                </header>

                <form className="login__form" onSubmit={handleSubmit}>

                    <div className="login__field">
                        <label className="login__label" htmlFor="username">
                            Nombre de usuario
                        </label>
                        <input
                            id="username"
                            className="login__input"
                            type="text"
                            placeholder="Tu usuario"
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
                                className="login__input"
                                type={verPassword ? "text" : "password"}
                                placeholder="••••••••"
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

                    {error && (
                        <p className="login__error">{error}</p>
                    )}

                    <button
                        className="login__button"
                        type="submit"
                        disabled={cargando || camposVacios}
                    >
                        <span>
                            {cargando ? "Ingresando…" : "Iniciar sesión"}
                        </span>
                        <ArrowRight size={18} />
                    </button>
                </form>

                <p className="login__footnote">
                    Acceso exclusivo para docentes y estudiantes
                    registrados.
                </p>
            </div>
        </div>
    )
}

export default Login;
