import { useEffect, useState } from "react";
import CrearActividadForm from "../components/CrearActividadForm";

import { getAsistencias } from "../api/asistencia";
import { getMaterias } from "../api/materias";

import AsistenciaCard from "../components/AsistenciaCard";
import ClaseActualCard from "../components/ClaseActualCard";

import "../styles/salon.css";

const Salon = () => {

    const [asistencias, setAsistencias] = useState([]);
    const [materiaActual, setMateriaActual] = useState(null);

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
    };

    return (
        <div className="salon-layout">

            <main className="salon-main">

                {/* CAMBIAR ESTE HEADER A UNO DINÁMICO DONDE SE REFLEJE */}
                {/* EL SALON ACTUAL Y EL AÑO ACTUAL TAMBIÉN */}
                <header className="salon-header">
                    <div className="header-title">
                        <div className="header-bar"></div>
                        <h1>Salón 6to - A</h1>
                    </div>

                    <div className="header-year">
                        Año escolar - 2026
                    </div>
                </header>

                <section className="salon-grid">

                    <div className="left-column">
                        <AsistenciaCard asistencias={asistencias} />
                    </div>

                    <div className="right-column">

                        <ClaseActualCard materia={materiaActual} />

                        <CrearActividadForm />

                    </div>

                </section>

            </main>

        </div>
    );
};

export default Salon;