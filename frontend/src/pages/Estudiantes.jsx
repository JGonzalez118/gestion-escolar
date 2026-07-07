import { useEffect, useState } from "react";
import { getEstudiantes } from "../api/estudiantes";
import { getAsistencias } from "../api/asistencia";
import "../styles/estudiantes.css";

const ESTADOS = {
    P: { label: "Presente", className: "estado-presente" },
    A: { label: "Ausente", className: "estado-ausente" },
    T: { label: "Tarde", className: "estado-tardanza" },
    E: { label: "Excusa", className: "estado-excusa" },
};

const ESTADO_SIN_REGISTRAR = {
    label: "Sin registrar",
    className: "estado-sin-registrar",
};

export default function Estudiantes() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [asistenciasHoy, setAsistenciasHoy] = useState({});
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const obtenerFechaLocal = () => {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        return `${anio}-${mes}-${dia}`;
    };

    const hoy = obtenerFechaLocal();

    const cargarDatos = async () => {
        try {
            setCargando(true);

            const [estudiantesData, asistenciasData] = await Promise.all([
                getEstudiantes(),
                getAsistencias(),
            ]);

            setEstudiantes(estudiantesData);

            // Construye un mapa { estudianteId: estado } solo con las asistencias de hoy
            const mapaHoy = {};
            asistenciasData
                .filter((a) => a.fecha === hoy)
                .forEach((a) => {
                    const estudianteId =
                        a.estudiante && typeof a.estudiante === "object"
                            ? a.estudiante.id
                            : a.estudiante;
                    mapaHoy[estudianteId] = a.estado;
                });

            setAsistenciasHoy(mapaHoy);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la lista de estudiantes.");
        } finally {
            setCargando(false);
        }
    };

    const renderEstado = (estudiante) => {
        const estadoKey = asistenciasHoy[estudiante.id];
        const estado = estadoKey ? ESTADOS[estadoKey] : ESTADO_SIN_REGISTRAR;

        return (
            <span className={`estado-badge ${estado.className}`}>
                {estado.label}
            </span>
        );
    };

    const formatearFechaLegible = () => {
        const hoyDate = new Date();
        return hoyDate.toLocaleDateString("es-PA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="estudiantes-layout">
            <header className="estudiantes-header">
                <div className="header-title">
                    <div className="header-bar"></div>
                    <h1>Estudiantes</h1>
                </div>
                <div className="header-fecha">
                    {formatearFechaLegible()}
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
                                    <th>Asistencia de hoy</th>
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