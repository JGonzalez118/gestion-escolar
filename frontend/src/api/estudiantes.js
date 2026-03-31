// api/estudiantes.js

import request from "./client";

export const getEstudiantes = () => {
    return request("/estudiantes/");
};

export const getEstudiantesPorGrado = (gradoId) => {
    return request(`/estudiantes/?grado=${gradoId}`);
};

export const crearEstudiante = (data) => {
    return request("/estudiantes/", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const actualizarEstudiante = (id, data) => {
    return request(`/estudiantes/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const eliminarEstudiante = (id) => {
    return request(`/estudiantes/${id}/`, {
        method: "DELETE",
    });
};
