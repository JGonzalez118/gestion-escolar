// api/grados.js

import request from "./client";

export const getGrados = () => {
    return request("/grados/");
};

export const crearGrados = (data) => {
    return request("/grados/", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const actualizarGrados = (id, data) => {
    return request(`/grados/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const actualizarParcialGrados = (id, data) => {
    return request(`/grados/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const eliminarGrados = (id) => {
    return request(`/grados/${id}/`, {
        method: "DELETE",
    });
};