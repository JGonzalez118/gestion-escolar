// api/materias.js

import request from "./client";

export const getMaterias = () => {
    return request("/materias/");
};

export const crearMaterias = (data) => {
    return request("/materias/", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const actualizarMaterias = (id, data) => {
    return request(`/materias/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const actualizarParcialMaterias = (id, data) => {
    return request(`/materias/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const eliminarMaterias = (id) => {
    return request(`/materias/${id}/`, {
        method: "DELETE",
    });
};