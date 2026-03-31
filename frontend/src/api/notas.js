// api/notas.js

import request from "./client";

export const getNotas = () => {
    return request("/notas/");
};

export const crearNota = (data) => {
    return request("/notas/", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const actualizarNota = (id, data) => {
    return request(`/notas/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const actualizarParcialNota = (id, data) => {
    return request(`/notas/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const eliminarNota = (id) => {
    return request(`/notas/${id}/`, {
        method: "DELETE",
    });
};