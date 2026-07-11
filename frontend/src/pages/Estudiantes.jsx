import { useEffect, useState } from "react";
import { getEstudiantes } from "../api/estudiantes";
import { getAsistencias } from "../api/asistencia";
import { getMaterias } from "../api/materias";
import { getActividades } from "../api/actividades";
import { getNotas, crearNota } from "../api/notas";
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
    const [tab, setTab] = useState("asistencia");

    const [estudiantes, setEstudiantes] = useState([]);
    const [asistenciasTodas, setAsistenciasTodas] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

    const [actividades, setActividades] = useState([]);
    const [notasEnEdicion, setNotasEnEdicion] = useState({});
    const [guardandoActividadId, setGuardandoActividadId] = useState(null);

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

    const obtenerId = (campo) =>
        campo && typeof campo === "object" ? campo.id : campo;

    const cargarDatos = async () => {
        try {
            setCargando(true);

            const [
                estudiantesData,
                asistenciasData,
                materiasData,
                actividadesData,
                notasData,
            ] = await Promise.all([
                getEstudiantes(),
                getAsistencias(),
                getMaterias(),
                getActividades(),
                getNotas(),
            ]);

            setEstudiantes(estudiantesData);
            setAsistenciasTodas(asistenciasData);
            setMaterias(materiasData);
            setMateriaSeleccionada(materiasData[0] ?? null);
            setActividades(actividadesData);

            // Prellenar el editor con los puntos ya guardados anteriormente
            const inicial = {};
            notasData.forEach((n) => {
                const estudianteId = obtenerId(n.estudiante);
                const actividadId = obtenerId(n.actividad);
                inicial[`${actividadId}-${estudianteId}`] = n.puntos_obtenidos;
            });
            setNotasEnEdicion(inicial);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la información.");
        } finally {
            setCargando(false);
        }
    };

    // ---------- ASISTENCIA ----------

    const cambiarMateria = (e) => {
        const idSeleccionado = Number(e.target.value);
        const materiaEncontrada = materias.find((m) => m.id === idSeleccionado);
        setMateriaSeleccionada(materiaEncontrada ?? null);
    };

    const renderEstadoAsistencia = (estudiante) => {
        if (!materiaSeleccionada) return null;

        const asistencia = asistenciasTodas.find(
            (a) =>
                obtenerId(a.estudiante) === estudiante.id &&
                obtenerId(a.materia) === materiaSeleccionada.id &&
                a.fecha === hoy
        );

        const estado = asistencia ? ESTADOS[asistencia.estado] : ESTADO_SIN_REGISTRAR;

        return (
            <span className={`estado-badge ${estado.className}`}>
                {estado.label}
            </span>
        );
    };

    // ---------- CALIFICAR ----------

    const actividadesDeHoy = actividades.filter((act) => act.fecha === hoy);

    const nombreMateria = (act) => {
        if (act.materia && typeof act.materia === "object") {
            return act.materia.nombre;
        }
        const materiaEncontrada = materias.find((m) => m.id === act.materia);
        return materiaEncontrada?.nombre ?? "—";
    };

    const cambiarPuntos = (actividadId, estudianteId, valor) => {
        setNotasEnEdicion((prev) => ({
            ...prev,
            [`${actividadId}-${estudianteId}`]: valor,
        }));
    };

    const calcularNotaPreview = (puntos, puntajeMaximo) => {
        const p = Number(puntos);
        if (!Number.isFinite(p) || !puntajeMaximo) return "—";
        const nota = Math.max(0, Math.min(5, (p / puntajeMaximo) * 5));
        return nota.toFixed(1);
    };

    const guardarNotasDeActividad = async (actividad) => {
        setGuardandoActividadId(actividad.id);

        try {
            for (const estudiante of estudiantes) {
                const clave = `${actividad.id}-${estudiante.id}`;
                const valor = notasEnEdicion[clave];

                if (valor === undefined || valor === "") continue;

                await crearNota({
                    estudiante: estudiante.id,
                    actividad: actividad.id,
                    puntos_obtenidos: Number(valor),
                });
            }

            alert(`Notas guardadas para "${actividad.nombre}"`);
        } catch (err) {
            console.error(err);
            alert("Ocurrió un error al guardar las notas.");
        } finally {
            setGuardandoActividadId(null);
        }
    };

    // ---------- HELPERS DE UI ----------

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
                <div className="header-fecha">{formatearFechaLegible()}</div>
            </header>

            <div className="tabs">
                <button
                    className={`tab-btn ${tab === "asistencia" ? "activo" : ""}`}
                    onClick={() => setTab("asistencia")}
                >
                    Asistencia
                </button>
                <button
                    className={`tab-btn ${tab === "calificar" ? "activo" : ""}`}
                    onClick={() => setTab("calificar")}
                >
                    Calificar actividades
                </button>
            </div>

            {cargando ? (
                <p className="estado-mensaje">Cargando...</p>
            ) : error ? (
                <p className="estado-mensaje error">{error}</p>
            ) : tab === "asistencia" ? (
                <>
                    <div className="materia-selector">
                        <label htmlFor="materia-select">Materia:</label>
                        <select
                            id="materia-select"
                            value={materiaSeleccionada?.id ?? ""}
                            onChange={cambiarMateria}
                        >
                            {materias.map((materia) => (
                                <option key={materia.id} value={materia.id}>
                                    {materia.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <section className="estudiantes-content">
                        {estudiantes.length === 0 ? (
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
                                                <td>{renderEstadoAsistencia(est)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            ) : (
                <section className="estudiantes-content">
                    {actividadesDeHoy.length === 0 ? (
                        <p className="estado-mensaje">
                            No hay actividades registradas para hoy.
                        </p>
                    ) : (
                        actividadesDeHoy.map((actividad) => (
                            <div className="actividad-calificar-bloque" key={actividad.id}>
                                <div className="actividad-calificar-header">
                                    <h3>{actividad.nombre}</h3>
                                    <span className="tipo-badge">{nombreMateria(actividad)}</span>
                                    <span className="puntaje-max">
                                        Puntaje máximo: {actividad.puntaje_maximo}
                                    </span>
                                </div>

                                <div className="estudiantes-tabla-wrapper">
                                    <table className="estudiantes-tabla">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Apellido</th>
                                                <th>Puntos obtenidos</th>
                                                <th>Nota (1-5)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estudiantes.map((est) => {
                                                const clave = `${actividad.id}-${est.id}`;
                                                const valor = notasEnEdicion[clave] ?? "";
                                                return (
                                                    <tr key={est.id}>
                                                        <td>{est.nombre}</td>
                                                        <td>{est.apellido}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={actividad.puntaje_maximo}
                                                                step="0.5"
                                                                className="nota-input"
                                                                value={valor}
                                                                onChange={(e) =>
                                                                    cambiarPuntos(actividad.id, est.id, e.target.value)
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            {calcularNotaPreview(valor, actividad.puntaje_maximo)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <button
                                    className="primary-btn"
                                    disabled={guardandoActividadId === actividad.id}
                                    onClick={() => guardarNotasDeActividad(actividad)}
                                >
                                    {guardandoActividadId === actividad.id
                                        ? "Guardando..."
                                        : `Guardar notas de "${actividad.nombre}"`}
                                </button>
                            </div>
                        ))
                    )}
                </section>
            )}
        </div>
    );
}