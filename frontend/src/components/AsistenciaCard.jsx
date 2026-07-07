import { useEffect, useState } from "react";
import { getEstudiantesMiSalon } from "../api/estudiantes";
import { registrarAsistencia } from "../api/asistencia";

const AsistenciaCard = ({ materiaId }) => {

    const [estudiantes, setEstudiantes] = useState([]);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargarEstudiantes();
    }, []);

    const cargarEstudiantes = async () => {
        try {
            const data = await getEstudiantesMiSalon();

            // Sin estado por defecto: el profesor debe marcar cada uno manualmente.
            const estudiantesSinEstado =
                data.map(estudiante => ({
                    ...estudiante,
                    estado: ""
                }));

            setEstudiantes(estudiantesSinEstado);
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

    const obtenerFechaLocal = () => {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        return `${anio}-${mes}-${dia}`;
    };

    const guardarAsistencia = async () => {

        if (!materiaId) {
            alert("No se pudo determinar la materia actual.");
            return;
        }

        const sinMarcar = estudiantes.filter(est => !est.estado);

        if (sinMarcar.length > 0) {
            const continuar = window.confirm(
                `${sinMarcar.length} estudiante(s) no tienen un estado asignado y no se guardarán. ¿Deseas continuar de todas formas?`
            );
            if (!continuar) return;
        }

        const estudiantesAGuardar = estudiantes.filter(est => est.estado);

        if (estudiantesAGuardar.length === 0) {
            alert("No hay ningún estudiante con estado asignado.");
            return;
        }

        setGuardando(true);

        try {
            for (const estudiante of estudiantesAGuardar) {
                await registrarAsistencia({
                    estudiante: estudiante.id,
                    materia: materiaId,
                    fecha: obtenerFechaLocal(),
                    estado: estudiante.estado
                });
            }

            alert("Asistencia registrada");

        } catch (error) {
            console.error(error);
            alert("Ocurrió un error al guardar la asistencia");
        } finally {
            setGuardando(false);
        }
    };

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
                return "transparent"; // sin marcar todavía
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
                                        backgroundColor: obtenerColorEstado(estudiante.estado),
                                        border: estudiante.estado
                                            ? "none"
                                            : "2px solid #9E9E9E",
                                        transition: "0.3s",
                                    }}
                                />

                                <h3>
                                    {estudiante.nombre} {estudiante.apellido}
                                </h3>
                            </div>

                            <select
                                value={estudiante.estado}
                                onChange={(e) =>
                                    cambiarEstado(estudiante.id, e.target.value)
                                }
                            >
                                <option value="" disabled>
                                    Seleccionar estado
                                </option>
                                <option value="P">Presente</option>
                                <option value="A">Ausente</option>
                                <option value="T">Tarde</option>
                                <option value="E">Excusa</option>
                            </select>
                        </div>
                    ))
                }

                <button
                    onClick={guardarAsistencia}
                    disabled={guardando || estudiantes.length === 0}
                >
                    {guardando ? "Guardando..." : "Guardar asistencia"}
                </button>
            </div>
        </div>
    );
};

export default AsistenciaCard;