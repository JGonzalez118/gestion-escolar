import { useEffect, useState } from "react";
import { getPeriodos } from "../api/periodos";
import { getBoletin } from "../api/notas";
import "../styles/boletin.css";

const NOTA_MINIMA_APROBATORIA = 3;

export default function Boletin() {
    const [periodos, setPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
    const [boletin, setBoletin] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarPeriodos();
    }, []);

    useEffect(() => {
        if (periodoSeleccionado) {
            cargarBoletin(periodoSeleccionado.id);
        }
    }, [periodoSeleccionado]);

    const cargarPeriodos = async () => {
        try {
            const data = await getPeriodos();
            setPeriodos(data);
            setPeriodoSeleccionado(data[0] ?? null);
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar los períodos.");
            setCargando(false);
        }
    };

    const cargarBoletin = async (periodoId) => {
        try {
            setCargando(true);
            const data = await getBoletin(periodoId);
            setBoletin(data);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar el boletín.");
        } finally {
            setCargando(false);
        }
    };

    const cambiarPeriodo = (e) => {
        const idSeleccionado = Number(e.target.value);
        const encontrado = periodos.find((p) => p.id === idSeleccionado);
        setPeriodoSeleccionado(encontrado ?? null);
    };

    const materiasColumnas = boletin[0]?.materias ?? [];

    const renderPromedio = (valor) => {
        if (valor === null || valor === undefined) {
            return <span className="nota-badge nota-sin-registrar">—</span>;
        }
        const clase = valor >= NOTA_MINIMA_APROBATORIA ? "nota-aprobada" : "nota-reprobada";
        return <span className={`nota-badge ${clase}`}>{valor.toFixed(2)}</span>;
    };

    return (
        <div className="boletin-layout">
            <header className="boletin-header">
                <div className="header-title">
                    <div className="header-bar"></div>
                    <h1>Boletín de calificaciones</h1>
                </div>
            </header>

            <div className="materia-selector">
                <label htmlFor="periodo-select">Trimestre:</label>
                <select
                    id="periodo-select"
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

            <section className="boletin-content">
                {cargando ? (
                    <p className="estado-mensaje">Cargando boletín...</p>
                ) : error ? (
                    <p className="estado-mensaje error">{error}</p>
                ) : boletin.length === 0 ? (
                    <p className="estado-mensaje">No hay estudiantes registrados.</p>
                ) : (
                    <div className="boletin-tabla-wrapper">
                        <table className="boletin-tabla">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    {materiasColumnas.map((m) => (
                                        <th key={m.materia_id}>{m.materia_nombre}</th>
                                    ))}
                                    <th className="col-promedio-final">Promedio final</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boletin.map((est) => (
                                    <tr key={est.estudiante_id}>
                                        <td>{est.nombre}</td>
                                        <td>{est.apellido}</td>
                                        {est.materias.map((m) => (
                                            <td key={m.materia_id}>{renderPromedio(m.promedio)}</td>
                                        ))}
                                        <td className="col-promedio-final">
                                            {renderPromedio(est.promedio_final)}
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