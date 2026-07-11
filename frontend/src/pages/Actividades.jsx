import { useEffect, useState } from "react";
import { ClipboardList, CalendarDays, BookOpen } from "lucide-react";

import { getActividades } from "../api/actividades";
import { getMaterias } from "../api/materias";
import "../styles/actividades.css";

const TIPOS = [
    { valor: "tarea", label: "Tarea" },
    { valor: "ejercicio", label: "Ejercicio" },
    { valor: "taller", label: "Taller" },
    { valor: "examen", label: "Examen" },
];

const TODOS = "todos";

// Fecha local en formato YYYY-MM-DD (sin desfase por zona horaria).
function fechaHoy() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Convierte "YYYY-MM-DD" a texto legible, construyendo la fecha en local
// (new Date("YYYY-MM-DD") la interpretaría como UTC y podría correr un día).
function fechaLegible(iso, opciones) {
    const [anio, mes, dia] = iso.split("-").map(Number);
    return new Date(anio, mes - 1, dia).toLocaleDateString("es-PA", opciones);
}

const etiquetaTipo = (tipo) =>
    TIPOS.find((t) => t.valor === tipo)?.label ?? tipo ?? "—";

export default function Actividades() {
    const [actividades, setActividades] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [filtroMateria, setFiltroMateria] = useState(TODOS);
    const [filtroTipo, setFiltroTipo] = useState(TODOS);

    useEffect(() => {
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

        cargarDatos();
    }, []);

    // El backend puede devolver la materia anidada o solo el id.
    const materiaId = (act) =>
        act.materia && typeof act.materia === "object" ? act.materia.id : act.materia;

    const nombreMateria = (act) => {
        if (act.materia && typeof act.materia === "object") return act.materia.nombre;
        return materias.find((m) => m.id === act.materia)?.nombre ?? "—";
    };

    const hoy = fechaHoy();

    const filtradas = actividades.filter((act) => {
        const porMateria =
            filtroMateria === TODOS || materiaId(act) === Number(filtroMateria);
        const porTipo = filtroTipo === TODOS || act.tipo === filtroTipo;
        return porMateria && porTipo;
    });

    const deHoy = filtradas.filter((act) => act.fecha === hoy);
    const futuras = filtradas
        .filter((act) => act.fecha > hoy)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
    const pasadas = filtradas
        .filter((act) => act.fecha < hoy)
        .sort((a, b) => b.fecha.localeCompare(a.fecha));

    // Agrupa una lista en pares [fecha, actividades] respetando el orden recibido.
    const agruparPorFecha = (lista) => {
        const grupos = new Map();
        lista.forEach((act) => {
            if (!grupos.has(act.fecha)) grupos.set(act.fecha, []);
            grupos.get(act.fecha).push(act);
        });
        return [...grupos.entries()];
    };

    const renderGrupos = (lista) =>
        agruparPorFecha(lista).map(([fecha, items]) => (
            <div className="actividades__group" key={fecha}>
                <h3 className="actividades__group-date">
                    {fechaLegible(fecha, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </h3>
                <div className="actividades__list">
                    {items.map((act) => (
                        <div className={`actividad-row tipo--${act.tipo}`} key={act.id}>
                            <span className="actividad-row__name">{act.nombre}</span>
                            <span className={`tipo-badge tipo--${act.tipo}`}>
                                {etiquetaTipo(act.tipo)}
                            </span>
                            <span className="actividad-row__materia">
                                {nombreMateria(act)}
                            </span>
                            <span className="actividad-row__puntaje">
                                {act.puntaje_maximo} pts
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ));

    if (cargando) {
        return (
            <div className="actividades">
                <p className="actividades__message">Cargando actividades…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="actividades">
                <p className="actividades__message actividades__message--error">{error}</p>
            </div>
        );
    }

    return (
        <div className="actividades">
            <header className="actividades__header">
                <h1 className="actividades__title">
                    <ClipboardList size={24} />
                    Actividades
                </h1>
                <span className="actividades__date">
                    <CalendarDays size={16} />
                    {fechaLegible(hoy, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </span>
            </header>

            {/* Filtros */}
            <div className="actividades__filters">
                <div className="actividades__filter">
                    <label className="actividades__filter-label" htmlFor="filtro-materia">
                        Materia
                    </label>
                    <select
                        id="filtro-materia"
                        className="actividades__select"
                        value={filtroMateria}
                        onChange={(e) => setFiltroMateria(e.target.value)}
                    >
                        <option value={TODOS}>Todas</option>
                        {materias.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="actividades__filter">
                    <label className="actividades__filter-label" htmlFor="filtro-tipo">
                        Tipo
                    </label>
                    <select
                        id="filtro-tipo"
                        className="actividades__select"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <option value={TODOS}>Todos</option>
                        {TIPOS.map((t) => (
                            <option key={t.valor} value={t.valor}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                <span className="actividades__count">
                    {filtradas.length} actividad{filtradas.length === 1 ? "" : "es"}
                </span>
            </div>

            {/* Hoy — destacadas */}
            <section className="actividades__section">
                <h2 className="actividades__section-title">
                    Hoy
                    <span className="actividades__section-count">{deHoy.length}</span>
                </h2>

                {deHoy.length === 0 ? (
                    <p className="actividades__message">
                        No hay actividades para hoy.
                    </p>
                ) : (
                    <div className="actividades__today">
                        {deHoy.map((act) => (
                            <article
                                className={`actividad-card tipo--${act.tipo}`}
                                key={act.id}
                            >
                                <div className="actividad-card__head">
                                    <h3 className="actividad-card__name">{act.nombre}</h3>
                                    <span className={`tipo-badge tipo--${act.tipo}`}>
                                        {etiquetaTipo(act.tipo)}
                                    </span>
                                </div>

                                {act.descripcion && (
                                    <p className="actividad-card__desc">{act.descripcion}</p>
                                )}

                                <div className="actividad-card__meta">
                                    <span className="actividad-card__materia">
                                        <BookOpen size={15} />
                                        {nombreMateria(act)}
                                    </span>
                                    <span className="actividad-card__puntaje">
                                        {act.puntaje_maximo} pts
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Próximas — solo si existen */}
            {futuras.length > 0 && (
                <section className="actividades__section">
                    <h2 className="actividades__section-title">
                        Próximas
                        <span className="actividades__section-count">{futuras.length}</span>
                    </h2>
                    {renderGrupos(futuras)}
                </section>
            )}

            {/* Anteriores — historial para revisar */}
            {pasadas.length > 0 && (
                <section className="actividades__section">
                    <h2 className="actividades__section-title">
                        Anteriores
                        <span className="actividades__section-count">{pasadas.length}</span>
                    </h2>
                    {renderGrupos(pasadas)}
                </section>
            )}
        </div>
    );
}
