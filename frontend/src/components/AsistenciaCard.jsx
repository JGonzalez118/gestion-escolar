import { useEffect, useState } from "react";
import { getEstudiantesMiSalon } from "../api/estudiantes";
import { registrarAsistencia } from "../api/asistencia"

const AsistenciaCard = ({ asistencias }) => {

    const [estudiantes, setEstudiantes] = useState([]);

    useEffect(() => {
        cargarEstudiantes();
    }, []);

    const cargarEstudiantes = async () => {
        try {
            const data = await getEstudiantesMiSalon();

            const estudiantesConEstado =
                data.map(estudiante => ({
                    ...estudiante,
                    estado: "P"
                }));

            setEstudiantes(
                estudiantesConEstado
            );
        } catch (error) {
            console.error(error);
        }
    };

    const cambiarEstado = (id, estado) => {
        setEstudiantes(prev =>
            prev.map(est =>
                est.id === id
                    ? { ...est, estado }
                    : est
            )
        );
    };

    const guardarAsistencia = async () => {

        try {

            for (const estudiante of estudiantes) {

                await registrarAsistencia({

                    estudiante: estudiante.id,
                    materia: 1,
                    fecha: new Date()
                        .toISOString()
                        .split("T")[0],

                    estado: estudiante.estado
                });

            }

            alert("Asistencia registrada");

        } catch (error) {

            console.error(error);

        }

    }

    const obtenerColorEstado = (estado) => {

        switch (estado) {

            case "P":
                return "#4CAF50"; // verde

            case "A":
                return "#FE5F55"; // rojo

            case "T":
                return "#FFC107"; // amarillo

            case "E":
                return "#9E9E9E"; // gris

            default:
                return "#9E9E9E";
        }
    };

    return (
        <div className="card asistencia-card">
            <div className="card-top"></div>
            <div className="card-content">
                <h2>Asistencia</h2>

                <div className="divider"></div>
                {
                    estudiantes.map((estudiante) => (
                        <div
                            className="student-item"
                            key={estudiante.id}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >

                                <div
                                    style={{
                                        width: "14px",
                                        height: "14px",
                                        borderRadius: "50%",
                                        backgroundColor:
                                            obtenerColorEstado(
                                                estudiante.estado
                                            ),
                                        transition: "0.3s",
                                    }}
                                />

                                <h3>
                                    {estudiante.nombre}
                                    {" "}
                                    {estudiante.apellido}
                                </h3>
                            </div>

                            <select
                                value={estudiante.estado}
                                onChange={(e) =>
                                    cambiarEstado(
                                        estudiante.id,
                                        e.target.value
                                    )
                                }
                            >
                                <option value="P">
                                    Presente
                                </option>

                                <option value="A">
                                    Ausente
                                </option>

                                <option value="T">
                                    Tarde
                                </option>

                                <option value="E">
                                    Excusa
                                </option>
                            </select>

                            <button onClick={guardarAsistencia}>
                                Guardar asistencia
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default AsistenciaCard;