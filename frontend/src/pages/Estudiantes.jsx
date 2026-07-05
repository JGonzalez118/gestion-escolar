import { useEffect, useState } from "react";
import { getEstudiantes } from "../api/estudiantes";
import "../styles/estudiantes.css";

const ESTADOS = {
    presente: { label: "Presente", className: "estado-presente" },
    ausente: { label: "Ausente", className: "estado-ausente" },
    tardanza: { label: "Tardanza", className: "estado-tardanza" },
};

export default function Estudiantes() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarEstudiantes();
    }, []);

    const cargarEstudiantes = async () => {
        try {
            setCargando(true);
            const data = await getEstudiantes();
            setEstudiantes(data);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la lista de estudiantes.");
        } finally {
            setCargando(false);
        }
    };

    const renderEstado = (estudiante) => {
        const estadoKey = estudiante?.asistencia?.estado ?? "ausente";
        const estado = ESTADOS[estadoKey] ?? ESTADOS.ausente;
        return (
            <span className={`estado-badge ${estado.className}`}>
                {estado.label}
            </span>
        );
    };

    return (
        <div className="estudiantes-layout">
            <header className="estudiantes-header">
                <div className="header-title">
                    <div className="header-bar"></div>
                    <h1>Estudiantes</h1>
                </div>
            </header>

            <section className="estudiantes-content">
                {cargando ? (
                    <p className="estado-mensaje">Cargando estudiantes...</p>
                ) : error ? (
                    <p className="estado-mensaje error">{error}</p>
                ) : estudiantes.length === 0 ? (
                    <p className="estado-mensaje">No hay estudiantes registrados.</p>
                ) : (
                    <div className="estudiantes-tabla-wrapper">
                        <table className="estudiantes-tabla">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Asistencia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map((est) => (
                                    <tr key={est.id}>
                                        <td>{est.nombre}</td>
                                        <td>{est.apellido}</td>
                                        <td>{renderEstado(est)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}