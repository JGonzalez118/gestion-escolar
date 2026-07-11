import { useEffect, useState } from "react";
import { FileText, Printer } from "lucide-react";

import { getPeriodos } from "../api/periodos";
import { getBoletin } from "../api/notas";
import "../styles/boletin.css";

const NOTA_MINIMA_APROBATORIA = 3;

// Lee el perfil guardado en el login; null si no hay o está corrupto.
function leerPerfil() {
    try {
        return JSON.parse(localStorage.getItem("perfil")) || null;
    } catch {
        return null;
    }
}

// "Kinder A" -> "kinder-a" (sin acentos ni espacios), para el nombre del archivo.
function comoSlug(texto) {
    return texto
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export default function Boletin() {
    const [periodos, setPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
    const [boletin, setBoletin] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarPeriodos = async () => {
            try {
                const data = await getPeriodos();
                setPeriodos(data);
                setPeriodoSeleccionado(data[0] ?? null);

                // Sin períodos no se dispara la carga del boletín: hay que
                // soltar el "cargando" aquí o la vista se queda colgada.
                if (data.length === 0) setCargando(false);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar los períodos.");
                setCargando(false);
            }
        };

        cargarPeriodos();
    }, []);

    useEffect(() => {
        if (!periodoSeleccionado) return;

        const cargarBoletin = async () => {
            try {
                setCargando(true);
                const data = await getBoletin(periodoSeleccionado.id);
                setBoletin(data);
            } catch (err) {
                console.error(err);
                setError("No se pudo cargar el boletín.");
            } finally {
                setCargando(false);
            }
        };

        cargarBoletin();
    }, [periodoSeleccionado]);

    const cambiarPeriodo = (e) => {
        const idSeleccionado = Number(e.target.value);
        setPeriodoSeleccionado(periodos.find((p) => p.id === idSeleccionado) ?? null);
    };

    // Las materias son las mismas para todos: se toman del primer estudiante.
    const materiasColumnas = boletin[0]?.materias ?? [];

    // ---------- RESUMEN DEL SALÓN ----------

    const finales = boletin
        .map((est) => est.promedio_final)
        .filter((n) => n !== null && n !== undefined);

    const promedioSalon = finales.length
        ? (finales.reduce((suma, n) => suma + n, 0) / finales.length).toFixed(2)
        : "—";

    const aprobados = finales.filter((n) => n >= NOTA_MINIMA_APROBATORIA).length;
    const reprobados = finales.filter((n) => n < NOTA_MINIMA_APROBATORIA).length;
    const sinCalificar = boletin.length - finales.length;

    // ---------- UI ----------

    const renderNota = (valor) => {
        if (valor === null || valor === undefined) {
            return <span className="nota-badge nota-badge--vacia">—</span>;
        }
        const clase =
            valor >= NOTA_MINIMA_APROBATORIA
                ? "nota-badge--aprobada"
                : "nota-badge--reprobada";
        return <span className={`nota-badge ${clase}`}>{valor.toFixed(2)}</span>;
    };

    const perfil = leerPerfil();
    const salonNombre = perfil?.salon?.nombre ?? "—";

    // El navegador toma el nombre del PDF del título del documento, así que lo
    // cambiamos justo antes de imprimir y lo restauramos al terminar.
    const imprimir = () => {
        const tituloOriginal = document.title;
        document.title = `boletin-${comoSlug(salonNombre)}`;

        const restaurar = () => {
            document.title = tituloOriginal;
            window.removeEventListener("afterprint", restaurar);
        };

        window.addEventListener("afterprint", restaurar);
        window.print();
    };

    return (
        <div className="boletin">

            {/* Solo visible al imprimir */}
            <div className="boletin__print-head">
                <h1 className="boletin__print-title">Boletín de calificaciones</h1>
                <p className="boletin__print-meta">
                    Salón: {salonNombre} · {periodoSeleccionado?.nombre ?? "—"} ·
                    Emitido el {new Date().toLocaleDateString("es-PA")}
                </p>
            </div>

            <header className="boletin__header boletin__no-print">
                <h1 className="boletin__title">
                    <FileText size={24} />
                    Boletín de calificaciones
                </h1>
                <button
                    type="button"
                    className="boletin__print"
                    onClick={imprimir}
                    disabled={boletin.length === 0}
                >
                    <Printer size={17} />
                    Imprimir / PDF
                </button>
            </header>

            <div className="boletin__toolbar boletin__no-print">
                <label className="boletin__toolbar-label" htmlFor="periodo-select">
                    Trimestre
                </label>
                <select
                    id="periodo-select"
                    className="boletin__select"
                    value={periodoSeleccionado?.id ?? ""}
                    onChange={cambiarPeriodo}
                >
                    {periodos.map((periodo) => (
                        <option key={periodo.id} value={periodo.id}>
                            {periodo.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {cargando ? (
                <p className="boletin__message">Cargando boletín…</p>
            ) : error ? (
                <p className="boletin__message boletin__message--error">{error}</p>
            ) : boletin.length === 0 ? (
                <p className="boletin__message">No hay estudiantes registrados.</p>
            ) : (
                <>
                    {/* Resumen del salón */}
                    <div className="boletin__summary">
                        <div className="boletin__stat">
                            <span className="boletin__stat-label">Promedio del salón</span>
                            <span className="boletin__stat-value">{promedioSalon}</span>
                        </div>
                        <div className="boletin__stat boletin__stat--aprobados">
                            <span className="boletin__stat-label">Aprobados</span>
                            <span className="boletin__stat-value">{aprobados}</span>
                        </div>
                        <div className="boletin__stat boletin__stat--reprobados">
                            <span className="boletin__stat-label">Reprobados</span>
                            <span className="boletin__stat-value">{reprobados}</span>
                        </div>
                        <div className="boletin__stat">
                            <span className="boletin__stat-label">Sin calificar</span>
                            <span className="boletin__stat-value">{sinCalificar}</span>
                        </div>
                    </div>

                    <section className="boletin__panel">
                        <div className="boletin__table-wrap">
                            <table className="boletin__table">
                                <thead>
                                    <tr>
                                        <th className="col-estudiante">Estudiante</th>
                                        {materiasColumnas.map((m) => (
                                            <th key={m.materia_id}>{m.materia_nombre}</th>
                                        ))}
                                        <th className="col-final">Promedio final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {boletin.map((est) => (
                                        <tr key={est.estudiante_id}>
                                            <td className="col-estudiante">
                                                {est.nombre} {est.apellido}
                                            </td>
                                            {est.materias.map((m) => (
                                                <td key={m.materia_id}>
                                                    {renderNota(m.promedio)}
                                                </td>
                                            ))}
                                            <td className="col-final">
                                                {renderNota(est.promedio_final)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
