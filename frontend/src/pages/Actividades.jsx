import { useEffect, useState } from "react";
import { getActividades } from "../api/actividades";
import { getMaterias } from "../api/materias";
import "../styles/actividades.css";

export default function Actividades() {
    const [actividades, setActividades] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [actividadesData, materiasData] = await Promise.all([
                getActividades(),
                getMaterias(),
            ]);
            setActividades(actividadesData);
            setMaterias(materiasData);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la lista de actividades.");
        } finally {
            setCargando(false);
        }
    };

    const obtenerFechaLocal = () => {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        return `${anio}-${mes}-${dia}`;
    };

    const hoy = obtenerFechaLocal();
    const actividadesDeHoy = actividades.filter((act) => act.fecha === hoy);

    const formatearFechaLegible = () => {
        const hoyDate = new Date();
        return hoyDate.toLocaleDateString("es-PA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const renderMateria = (act) => {
        // Si el backend ya devuelve la materia anidada (objeto), usa el nombre directo.
        if (act.materia && typeof act.materia === "object") {
            return act.materia.nombre;
        }

        // Si solo devuelve el id (FK plano), busca el nombre en la lista de materias.
        const materiaEncontrada = materias.find((m) => m.id === act.materia);
        return materiaEncontrada?.nombre ?? "—";
    };

    const renderPuntaje = (act) => {
        const puntaje = Number(act.puntaje_maximo);
        return Number.isFinite(puntaje) ? puntaje : "—";
    };

    return (
        <div className="actividades-layout">
            <header className="actividades-header">
                <div className="header-title">
                    <div className="header-bar"></div>
                    <h1>Actividades del día</h1>
                </div>
                <div className="header-fecha">
                    {formatearFechaLegible()}
                </div>
            </header>

            <section className="actividades-content">
                {cargando ? (
                    <p className="estado-mensaje">Cargando actividades...</p>
                ) : error ? (
                    <p className="estado-mensaje error">{error}</p>
                ) : actividadesDeHoy.length === 0 ? (
                    <p className="estado-mensaje">No hay actividades registradas para hoy.</p>
                ) : (
                    <div className="actividades-tabla-wrapper">
                        <table className="actividades-tabla">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Materia</th>
                                    <th>Tipo</th>
                                    <th>Puntaje</th>
                                    <th>Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actividadesDeHoy.map((act) => (
                                    <tr key={act.id}>
                                        <td>{act.nombre}</td>
                                        <td>{renderMateria(act)}</td>
                                        <td>
                                            <span className="tipo-badge">{act.tipo || "—"}</span>
                                        </td>
                                        <td>{renderPuntaje(act)}</td>
                                        <td className="descripcion-cell">
                                            {act.descripcion || "—"}
                                        </td>
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