import { useEffect, useState } from "react";
import { Users, ClipboardCheck, PenLine, CalendarDays } from "lucide-react";

import { getEstudiantes } from "../api/estudiantes";
import { getAsistencias, registrarAsistencia } from "../api/asistencia";
import { getMaterias } from "../api/materias";
import { getActividades } from "../api/actividades";
import { getNotas, crearNota } from "../api/notas";
import EstadoAsistenciaSelect from "../components/EstadoAsistenciaSelect";
import { alertaExito, alertaError, toastExito } from "../utils/alertas";
import "../styles/estudiantes.css";

// Fecha local en formato YYYY-MM-DD (sin desfase por zona horaria).
function fechaHoy() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Devuelve el id, ya venga como objeto anidado o como id plano.
const obtenerId = (campo) =>
    campo && typeof campo === "object" ? campo.id : campo;

export default function Estudiantes() {
    const [tab, setTab] = useState("asistencia");

    const [estudiantes, setEstudiantes] = useState([]);
    // Estados de hoy, indexados por `${materiaId}-${estudianteId}`.
    const [estadosHoy, setEstadosHoy] = useState({});
    const [materias, setMaterias] = useState([]);
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

    const [actividades, setActividades] = useState([]);
    const [notasEnEdicion, setNotasEnEdicion] = useState({});
    const [guardandoActividadId, setGuardandoActividadId] = useState(null);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const hoy = fechaHoy();

    useEffect(() => {
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
                setMaterias(materiasData);
                setMateriaSeleccionada(materiasData[0] ?? null);
                setActividades(actividadesData);

                // Estados de asistencia ya guardados hoy
                const estados = {};
                asistenciasData
                    .filter((a) => a.fecha === hoy)
                    .forEach((a) => {
                        const clave = `${obtenerId(a.materia)}-${obtenerId(a.estudiante)}`;
                        estados[clave] = a.estado;
                    });
                setEstadosHoy(estados);

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

        cargarDatos();
    }, [hoy]);

    // ---------- ASISTENCIA ----------

    const cambiarMateria = (e) => {
        const idSeleccionado = Number(e.target.value);
        const materiaEncontrada = materias.find((m) => m.id === idSeleccionado);
        setMateriaSeleccionada(materiaEncontrada ?? null);
    };

    // Guarda al instante (el backend hace upsert) con actualización optimista.
    const cambiarAsistencia = async (estudianteId, estado) => {
        if (!materiaSeleccionada) return;

        const clave = `${materiaSeleccionada.id}-${estudianteId}`;
        const anterior = estadosHoy[clave];

        setEstadosHoy((prev) => ({ ...prev, [clave]: estado }));

        try {
            await registrarAsistencia({
                estudiante: estudianteId,
                materia: materiaSeleccionada.id,
                fecha: hoy,
                estado,
            });
            toastExito("Asistencia actualizada");
        } catch (err) {
            console.error(err);
            // Revertir si el guardado falla
            setEstadosHoy((prev) => ({ ...prev, [clave]: anterior }));
            alertaError("No se pudo actualizar la asistencia.");
        }
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

            alertaExito("Notas guardadas", `Se registraron las notas de "${actividad.nombre}".`);
        } catch (err) {
            console.error(err);
            alertaError("Ocurrió un error al guardar las notas.");
        } finally {
            setGuardandoActividadId(null);
        }
    };

    // ---------- UI ----------

    const fechaLegible = new Date().toLocaleDateString("es-PA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="estudiantes">
            <header className="estudiantes__header">
                <h1 className="estudiantes__title">
                    <Users size={24} />
                    Estudiantes
                </h1>
                <span className="estudiantes__date">
                    <CalendarDays size={16} />
                    {fechaLegible}
                </span>
            </header>

            <div className="estudiantes__tabs">
                <button
                    className={"estudiantes__tab" + (tab === "asistencia" ? " estudiantes__tab--active" : "")}
                    onClick={() => setTab("asistencia")}
                >
                    <ClipboardCheck size={17} />
                    Asistencia
                </button>
                <button
                    className={"estudiantes__tab" + (tab === "calificar" ? " estudiantes__tab--active" : "")}
                    onClick={() => setTab("calificar")}
                >
                    <PenLine size={17} />
                    Calificar actividades
                </button>
            </div>

            {cargando ? (
                <p className="estudiantes__message">Cargando…</p>
            ) : error ? (
                <p className="estudiantes__message estudiantes__message--error">{error}</p>
            ) : tab === "asistencia" ? (
                <>
                    <div className="estudiantes__filter">
                        <label className="estudiantes__filter-label" htmlFor="materia-select">
                            Materia
                        </label>
                        <select
                            id="materia-select"
                            className="estudiantes__select"
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

                    <section className="estudiantes__panel">
                        {estudiantes.length === 0 ? (
                            <p className="estudiantes__message">No hay estudiantes registrados.</p>
                        ) : (
                            <div className="estudiantes__table-wrap">
                                <table className="estudiantes__table">
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
                                                <td>
                                                    <EstadoAsistenciaSelect
                                                        value={
                                                            estadosHoy[
                                                            `${materiaSeleccionada?.id}-${est.id}`
                                                            ] ?? ""
                                                        }
                                                        onChange={(estado) =>
                                                            cambiarAsistencia(est.id, estado)
                                                        }
                                                        disabled={!materiaSeleccionada}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            ) : actividadesDeHoy.length === 0 ? (
                <section className="estudiantes__panel">
                    <p className="estudiantes__message">
                        No hay actividades registradas para hoy.
                    </p>
                </section>
            ) : (
                actividadesDeHoy.map((actividad) => (
                    <div className="calificar__block" key={actividad.id}>
                        <div className="calificar__head">
                            <h3 className="calificar__name">{actividad.nombre}</h3>
                            <span className="calificar__materia">{nombreMateria(actividad)}</span>
                            <span className="calificar__max">
                                Puntaje máximo: {actividad.puntaje_maximo}
                            </span>
                        </div>

                        <div className="estudiantes__table-wrap">
                            <table className="estudiantes__table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Puntos obtenidos</th>
                                        <th>Nota (0–5)</th>
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
                                                <td className="calificar__nota">
                                                    {calcularNotaPreview(valor, actividad.puntaje_maximo)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <button
                            className="estudiantes__save"
                            disabled={guardandoActividadId === actividad.id}
                            onClick={() => guardarNotasDeActividad(actividad)}
                        >
                            {guardandoActividadId === actividad.id
                                ? "Guardando…"
                                : "Guardar notas"}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
