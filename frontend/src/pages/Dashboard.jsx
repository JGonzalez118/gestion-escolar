import { useEffect, useState } from "react";

import { getEstudiantes } from "../api/estudiantes";
import { getActividades } from "../api/actividades";
import { getGrados } from "../api/grados";

export default function Dashboard() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [grados, setGrados] = useState([]);

    useEffect(() => {
        // Cargar datos básicos
        getEstudiantes().then(setEstudiantes).catch(console.error);
        getActividades().then(setActividades).catch(console.error);
        getGrados().then(setGrados).catch(console.error);
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>

            <h2>Resumen</h2>

            <ul>
                <li>Total estudiantes: {estudiantes.length}</li>
                <li>Total actividades: {actividades.length}</li>
                <li>Total grados: {grados.length}</li>
            </ul>

            <hr />

            <h2>Últimos estudiantes</h2>

            {estudiantes.length === 0 ? (
                <p>No hay estudiantes</p>
            ) : (
                <ul>
                    {estudiantes.slice(0, 5).map(est => (
                        <li key={est.id}>
                            {est.nombre} {est.apellido}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}