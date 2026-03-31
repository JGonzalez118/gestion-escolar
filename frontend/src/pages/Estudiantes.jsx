import { useEffect, useState } from "react";
import { getEstudiantes } from "../api/estudiantes";

export default function Estudiantes() {
    const [estudiantes, setEstudiantes] = useState([]);

    useEffect(() => {
        getEstudiantes()
            .then(data => {
                console.log("Datos:", data);
                setEstudiantes(data);
            })
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Lista de Estudiantes</h1>

            {estudiantes.length === 0 ? (
                <p>No hay datos</p>
            ) : (
                <ul>
                    {estudiantes.map(est => (
                        <li key={est.id}>
                            {est.nombre} {est.apellido}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}