import { useEffect, useState } from "react";
import { getActividades } from "../api/actividades";
import "../styles/actividades.css";

export default function Actividades() {
    const [actividades, setActividades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarActividades();
    }, []);

    const cargarActividades = async () => {
        try {
            setCargando(true);
            const data = await getActividades();
            setActividades(data);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la lista de actividades.");
        } finally {
            setCargando(false);
        }
    };

    const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const actividadesDeHoy = actividades.filter((act) => act.fecha === hoy);

    const renderMateria = (act) => {
        // Si el backend devuelve la materia anidada (objeto), muestra el nombre.
        // Si solo devuelve el id (FK plano), muestra el id como respaldo.
        if (act.materia && typeof act.materia === "object") {
            return act.materia.nombre;
        }
        return act.materia_nombre ?? act.materia ?? "—";
    };

    return (
        <div className="actividades-layout">
            <header className="actividades-header">
                <div className="header-title">
                    <div className="header-bar"></div>
                    <h1>Actividades del día</h1>
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
                                        <td>{act.puntaje}</td>
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