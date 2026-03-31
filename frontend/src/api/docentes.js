// api/docentes.js

import request from "./client";

export const getDocentes = () => {
    return request("/docentes/");
};

export const crearDocente = (data) => {
    return request("/docentes/", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const actualizarDocente = (id, data) => {
    return request(`/docentes/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const actualizarParcialDocente = (id, data) => {
    return request(`/docentes/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const eliminarDocente = (id) => {
    return request(`/docentes/${id}/`, {
        method: "DELETE",
    });
};