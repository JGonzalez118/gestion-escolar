import { useState } from "react";
import { crearActividad } from "../api/actividades";

const CrearActividadForm = ({ materiaId, periodoId }) => {
    const [form, setForm] = useState({
        nombre: "",
        puntaje: "",
        tipo: "",
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
            puntaje: "",
            tipo: "",
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
                    max="5"
                    step="0.1"
                    type="number"
                    placeholder="Puntaje"
                    name="puntaje"
                    value={form.puntaje}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    placeholder="Tipo"
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                />
            </div>

            <textarea
                placeholder="Descripción"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
            />

            <div className="buttons-row">
                <button
                    type="button"
                    className="secondary-btn"
                    onClick={limpiar}
                >
                    Limpiar campos
                </button>
                <button
                    type="submit"
                    className="primary-btn"
                >
                    Agregar actividad
                </button>
            </div>
        </form>
    );
};

export default CrearActividadForm;