import { useState } from "react";
import { crearActividad } from "../api/actividades";
import { alertaExito, alertaError } from "../utils/alertas";

const TIPOS_ACTIVIDAD = [
    { value: "tarea", label: "Tarea" },
    { value: "ejercicio", label: "Ejercicio" },
    { value: "taller", label: "Taller" },
    { value: "examen", label: "Examen" },
];

const FORM_INICIAL = {
    nombre: "",
    puntaje_maximo: "",
    tipo: "tarea",
    descripcion: "",
};

const CrearActividadForm = ({ materiaId, periodoId }) => {
    const [form, setForm] = useState(FORM_INICIAL);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const limpiar = () => setForm(FORM_INICIAL);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!materiaId || !periodoId) {
            alertaError("No se pudo determinar la materia o el período actual.");
            return;
        }

        const payload = {
            ...form,
            puntaje_maximo: Number(form.puntaje_maximo),
            fecha: new Date().toISOString().split("T")[0], // YYYY-MM-DD
            materia: materiaId,
            periodo: periodoId,
        };

        try {
            await crearActividad(payload);
            await alertaExito("Actividad creada correctamente");
            limpiar();
        } catch (error) {
            console.error(error);
            alertaError("No se pudo crear la actividad.");
        }
    };

    return (
        <form className="salon-card actividad-form" onSubmit={handleSubmit}>
            <h2 className="salon-card__title">Añadir una actividad</h2>

            <input
                type="text"
                className="actividad-form__input"
                placeholder="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
            />

            <div className="actividad-form__row">
                <input
                    min="1"
                    step="1"
                    type="number"
                    className="actividad-form__input"
                    placeholder="Puntaje máximo"
                    name="puntaje_maximo"
                    value={form.puntaje_maximo}
                    onChange={handleChange}
                />

                <select
                    name="tipo"
                    className="actividad-form__select"
                    value={form.tipo}
                    onChange={handleChange}
                >
                    {TIPOS_ACTIVIDAD.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
            </div>

            <textarea
                className="actividad-form__textarea"
                placeholder="Descripción"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
            />

            <div className="actividad-form__buttons">
                <button type="button" className="btn-secondary" onClick={limpiar}>
                    Limpiar campos
                </button>
                <button type="submit" className="btn-primary">
                    Agregar actividad
                </button>
            </div>
        </form>
    );
};

export default CrearActividadForm;
