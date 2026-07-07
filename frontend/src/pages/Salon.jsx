import { useEffect, useState } from "react";
import CrearActividadForm from "../components/CrearActividadForm";
import { getAsistencias } from "../api/asistencia";
import { getMaterias } from "../api/materias";
import { getPeriodoActual } from "../api/periodos";
import AsistenciaCard from "../components/AsistenciaCard";
import ClaseActualCard from "../components/ClaseActualCard";
import { getPerfil } from "../api/auth";
import "../styles/salon.css";

const Salon = () => {
    const [asistencias, setAsistencias] = useState([]);
    const [materiaActual, setMateriaActual] = useState(null);
    const [periodoActual, setPeriodoActual] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const asistenciaData = await getAsistencias();
            const materiasData = await getMaterias();
            setAsistencias(asistenciaData);
            setMateriaActual(materiasData[0]);
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

    // USUARIO ACTUAL CONECTADO <- SACAMOS EL SALÓN
    const [perfil, setPerfil] = useState(null);
    useEffect(() => {
        getPerfil()
            .then(setPerfil)
            .catch(console.error);
    }, []);

    const anioActual = new Date().getFullYear();

    return (
        <div className="salon-layout">
            <main className="salon-main">
                <header className="salon-header">
                    <div className="header-title">
                        <div className="header-bar"></div>
                        <h1>
                            Salon:
                            {perfil?.salon?.nombre}
                        </h1>
                    </div>
                    <div className="header-year">
                        {periodoActual?.nombre && ` ${periodoActual.nombre} - `}
                        {anioActual}
                    </div>
                </header>
                <section className="salon-grid">
                    <div className="left-column">
                        {/* <AsistenciaCard asistencias={asistencias} /> */}
                        <AsistenciaCard materiaId={materiaActual?.id} />
                    </div>
                    <div className="right-column">
                        <ClaseActualCard materia={materiaActual} />
                        <CrearActividadForm
                            materiaId={materiaActual?.id}
                            periodoId={periodoActual?.id}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Salon;