import { useEffect, useState } from "react";
import { getEstudiantesMiSalon } from "../api/estudiantes";
import { registrarAsistencia } from "../api/asistencia";
import { alertaExito, alertaError, alertaConfirmar } from "../utils/alertas";

// Estados posibles de asistencia; la letra coincide con el valor del backend.
const ESTADOS = [
    { valor: "P", titulo: "Presente", clase: "chip--p" },
    { valor: "A", titulo: "Ausente", clase: "chip--a" },
    { valor: "T", titulo: "Tarde", clase: "chip--t" },
    { valor: "E", titulo: "Excusa", clase: "chip--e" },
];

// Fecha local en formato YYYY-MM-DD (sin desfase por zona horaria).
function fechaHoy() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

const AsistenciaCard = ({ materiaId }) => {

    const [estudiantes, setEstudiantes] = useState([]);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const cargarEstudiantes = async () => {
            try {
                const data = await getEstudiantesMiSalon();

                // Sin estado por defecto: el profesor debe marcar cada uno manualmente.
                setEstudiantes(data.map((est) => ({ ...est, estado: "" })));
            } catch (error) {
                console.error(error);
            }
        };

        cargarEstudiantes();
    }, []);

    const cambiarEstado = (id, estado) => {
        setEstudiantes((prev) =>
            prev.map((est) =>
                est.id === id ? { ...est, estado } : est
            )
        );
    };

    const guardarAsistencia = async () => {
        if (!materiaId) {
            alertaError("No se pudo determinar la materia actual.");
            return;
        }

        const aGuardar = estudiantes.filter((est) => est.estado);

        if (aGuardar.length === 0) {
            alertaError("Sin estados asignados", "Marca al menos un estudiante antes de guardar.");
            return;
        }

        const sinMarcar = estudiantes.length - aGuardar.length;

        if (sinMarcar > 0) {
            const { isConfirmed } = await alertaConfirmar({
                titulo: "Estudiantes sin marcar",
                texto: `${sinMarcar} estudiante(s) no tienen estado y no se guardarán. ¿Continuar de todas formas?`,
                confirmar: "Sí, continuar",
            });
            if (!isConfirmed) return;
        }

        setGuardando(true);

        try {
            for (const estudiante of aGuardar) {
                await registrarAsistencia({
                    estudiante: estudiante.id,
                    materia: materiaId,
                    fecha: fechaHoy(),
                    estado: estudiante.estado,
                });
            }
            alertaExito("Asistencia registrada", `Se guardó el estado de ${aGuardar.length} estudiante(s).`);
        } catch (error) {
            console.error(error);
            alertaError("Ocurrió un error al guardar la asistencia.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="salon-card asistencia">
            <h2 className="salon-card__title">Asistencia</h2>

            {estudiantes.length === 0 ? (
                <p className="asistencia__empty">No hay estudiantes en el salón.</p>
            ) : (
                <div className="asistencia__list">
                    {estudiantes.map((estudiante) => (
                        <div className="asistencia__row" key={estudiante.id}>
                            <span className="asistencia__name">
                                {estudiante.nombre} {estudiante.apellido}
                            </span>
                            <div className="asistencia__chips" role="group">
                                {ESTADOS.map((est) => (
                                    <button
                                        key={est.valor}
                                        type="button"
                                        className={
                                            "chip " + est.clase +
                                            (estudiante.estado === est.valor ? " chip--active" : "")
                                        }
                                        title={est.titulo}
                                        aria-label={est.titulo}
                                        aria-pressed={estudiante.estado === est.valor}
                                        onClick={() => cambiarEstado(estudiante.id, est.valor)}
                                    >
                                        {est.valor}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                className="asistencia__save"
                onClick={guardarAsistencia}
                disabled={guardando || estudiantes.length === 0}
            >
                {guardando ? "Guardando…" : "Guardar asistencia"}
            </button>
        </div>
    );
};

export default AsistenciaCard;
