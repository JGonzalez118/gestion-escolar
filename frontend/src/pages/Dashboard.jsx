import { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    GraduationCap,
    Users,
    ClipboardList,
    School,
    CalendarDays,
} from "lucide-react";

import { getEstudiantes } from "../api/estudiantes";
import { getActividades } from "../api/actividades";
import "../styles/dashboard.css";

const ANIO_ESCOLAR = 2026;

// Colores de los segmentos de la gráfica (tomados del tema).
const GENERO_COLORS = ["var(--accent)", "var(--ink-soft)"];

// Etiqueta legible para cada tipo de actividad.
const TIPO_LABEL = {
    tarea: "Tarea",
    ejercicio: "Ejercicio",
    taller: "Taller",
    examen: "Examen",
};

// Lee el perfil guardado en el login; null si no hay o está corrupto.
function leerPerfil() {
    try {
        return JSON.parse(localStorage.getItem("perfil")) || null;
    } catch {
        return null;
    }
}

// Fecha local en formato YYYY-MM-DD (sin desfase por zona horaria).
function fechaHoy() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export default function Dashboard() {

    const [estudiantes, setEstudiantes] = useState([]);
    const [actividades, setActividades] = useState([]);

    useEffect(() => {
        getEstudiantes().then(setEstudiantes).catch(console.error);
        getActividades().then(setActividades).catch(console.error);
    }, []);

    const perfil = leerPerfil();
    const rol = perfil?.rol ?? localStorage.getItem("rol");
    const esEstudiante = rol === "estudiante";

    const nombre = perfil?.nombre_completo ?? "Usuario";
    const grado = perfil?.salon?.grado ?? "—";
    const salonNombre = perfil?.salon?.nombre ?? "—";

    const hoy = fechaHoy();
    const actividadesDeHoy = actividades.filter((act) => act.fecha === hoy);

    // Distribución por género (solo relevante con varios estudiantes).
    const distribucionGenero = [
        { name: "Masculino", value: estudiantes.filter((e) => e.genero === "M").length },
        { name: "Femenino", value: estudiantes.filter((e) => e.genero === "F").length },
    ];
    const hayEstudiantes = estudiantes.length > 0;

    // Tarjetas según el rol: el estudiante ve su salón en vez del conteo global.
    const stats = esEstudiante
        ? [
            { label: "Grado", value: grado, icon: GraduationCap },
            { label: "Mi salón", value: salonNombre, icon: School },
            { label: "Actividades", value: actividades.length, icon: ClipboardList },
        ]
        : [
            { label: "Grado", value: grado, icon: GraduationCap },
            { label: "Estudiantes", value: estudiantes.length, icon: Users },
            { label: "Actividades", value: actividades.length, icon: ClipboardList },
        ];

    return (
        <div className="dashboard">

            {/* Encabezado */}
            <header className="dashboard__header">
                <div>
                    <h2 className="dashboard__welcome">
                        Bienvenido <em>{nombre}</em>
                    </h2>
                    <p className="dashboard__subtitle">
                        Panel de {esEstudiante ? "estudiante" : "gestión"} · {salonNombre}
                    </p>
                </div>
                <span className="dashboard__year">
                    <CalendarDays size={16} />
                    Año escolar {ANIO_ESCOLAR}
                </span>
            </header>

            {/* Tarjetas de resumen */}
            <div className="dashboard__stats">
                {stats.map(({ label, value, icon: Icon }) => (
                    <div className="dashboard__stat" key={label}>
                        <span className="stat__icon">
                            <Icon size={20} />
                        </span>
                        <span className="stat__body">
                            <span className="stat__label">{label}</span>
                            <span className="stat__value">{value}</span>
                        </span>
                    </div>
                ))}
            </div>

            {/* Paneles de información */}
            <div className={"dashboard__grid" + (esEstudiante ? " dashboard__grid--single" : "")}>

                {/* Actividades del día */}
                <section className="dashboard__panel">
                    <h3 className="panel__title">Actividades del día</h3>
                    {actividadesDeHoy.length === 0 ? (
                        <p className="dashboard__empty">No hay actividades para hoy.</p>
                    ) : (
                        <ul className="panel__list">
                            {actividadesDeHoy.slice(0, 6).map((act) => (
                                <li className="panel__item" key={act.id}>
                                    <span className="item__name">{act.nombre}</span>
                                    <span className="item__meta">
                                        <span className="item__badge">
                                            {TIPO_LABEL[act.tipo] ?? act.tipo}
                                        </span>
                                        <span className="item__score">
                                            {act.puntaje_maximo} pts
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Distribución por género (no aplica al estudiante) */}
                {!esEstudiante && (
                    <section className="dashboard__panel">
                        <h3 className="panel__title">Distribución por género</h3>
                        {hayEstudiantes ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={distribucionGenero}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        stroke="none"
                                    >
                                        {distribucionGenero.map((entry, i) => (
                                            <Cell key={entry.name} fill={GENERO_COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        height={28}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="dashboard__empty">Sin estudiantes para mostrar.</p>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}
