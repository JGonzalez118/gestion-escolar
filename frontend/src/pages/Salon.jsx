import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import CrearActividadForm from "../components/CrearActividadForm";
import AsistenciaCard from "../components/AsistenciaCard";
import ClaseActualCard from "../components/ClaseActualCard";
import { getMaterias } from "../api/materias";
import { getPeriodoActual } from "../api/periodos";
import "../styles/salon.css";

// Lee el perfil guardado en el login; null si no hay o está corrupto.
function leerPerfil() {
    try {
        return JSON.parse(localStorage.getItem("perfil")) || null;
    } catch {
        return null;
    }
}

const Salon = () => {
    const [materias, setMaterias] = useState([]);
    const [materiaActual, setMateriaActual] = useState(null);
    const [periodoActual, setPeriodoActual] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const materiasData = await getMaterias();
                setMaterias(materiasData);
                setMateriaActual(materiasData[0] ?? null);
            } catch (error) {
                console.error(error);
            }

            try {
                const periodoData = await getPeriodoActual();
                setPeriodoActual(periodoData);
            } catch (error) {
                console.error("No se pudo obtener el período actual:", error);
                setPeriodoActual(null);
            }
        };

        cargarDatos();
    }, []);

    const cambiarMateria = (e) => {
        const idSeleccionado = Number(e.target.value);
        const materiaEncontrada = materias.find((m) => m.id === idSeleccionado);
        setMateriaActual(materiaEncontrada ?? null);
    };

    const perfil = leerPerfil();
    const salonNombre = perfil?.salon?.nombre ?? "—";
    const anioActual = new Date().getFullYear();

    return (
        <div className="salon">
            <header className="salon__header">
                <h1 className="salon__title">
                    Salón: <em>{salonNombre}</em>
                </h1>
                <span className="salon__period">
                    <CalendarDays size={16} />
                    {periodoActual?.nombre ? `${periodoActual.nombre} · ` : ""}
                    {anioActual}
                </span>
            </header>

            <div className="salon__materia">
                <label className="salon__materia-label" htmlFor="materia-select">
                    Materia actual
                </label>
                <select
                    id="materia-select"
                    className="salon__select"
                    value={materiaActual?.id ?? ""}
                    onChange={cambiarMateria}
                >
                    {materias.map((materia) => (
                        <option key={materia.id} value={materia.id}>
                            {materia.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <section className="salon__grid">
                <div className="salon__col">
                    <AsistenciaCard
                        key={materiaActual?.id}
                        materiaId={materiaActual?.id}
                    />
                </div>
                <div className="salon__col">
                    <ClaseActualCard materia={materiaActual} />
                    <CrearActividadForm
                        materiaId={materiaActual?.id}
                        periodoId={periodoActual?.id}
                    />
                </div>
            </section>
        </div>
    );
};

export default Salon;
