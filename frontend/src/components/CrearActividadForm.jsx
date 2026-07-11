import { useState } from "react";
import { crearActividad } from "../api/actividades";

const TIPOS_ACTIVIDAD = [
    { value: "tarea", label: "Tarea" },
    { value: "ejercicio", label: "Ejercicio" },
    { value: "taller", label: "Taller" },
    { value: "examen", label: "Examen" },
];

const CrearActividadForm = ({ materiaId, periodoId }) => {
    const [form, setForm] = useState({
        nombre: "",
        puntaje_maximo: "",
        tipo: "tarea",
        descripcion: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const limpiar = () => {
        setForm({
            nombre: "",
            puntaje_maximo: "",
            tipo: "tarea",
            descripcion: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!materiaId || !periodoId) {
            alert("No se pudo determinar la materia o el período actual.");
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
            alert("Actividad creada correctamente");
            limpiar();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form className="actividad-form" onSubmit={handleSubmit}>
            <h2>Añadir una actividad</h2>
            <div className="divider"></div>

            <input
                type="text"
                placeholder="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
            />

            <div className="row-inputs">
                <input
                    min="1"
                    step="1"
                    type="number"
                    placeholder="Puntaje máximo"
                    name="puntaje_maximo"
                    value={form.puntaje_maximo}
                    onChange={handleChange}
                />

                <select name="tipo" value={form.tipo} onChange={handleChange}>
                    {TIPOS_ACTIVIDAD.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
            </div>

            <textarea
                placeholder="Descripción"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
            />

            <div className="buttons-row">
                <button type="button" className="secondary-btn" onClick={limpiar}>
                    Limpiar campos
                </button>
                <button type="submit" className="primary-btn">
                    Agregar actividad
                </button>
            </div>
        </form>
    );
};

export default CrearActividadForm;