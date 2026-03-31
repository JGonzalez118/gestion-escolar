// api/periodos.js

import request from "./client";

export const getPeriodos = () => {
    return request("/periodos/");
};

export const crearPeriodos = (data) => {
    return request("/periodos/", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const actualizarPeriodos = (id, data) => {
    return request(`/periodos/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const actualizarParcialPeriodos = (id, data) => {
    return request(`/periodos/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const eliminarPeriodos = (id) => {
    return request(`/periodos/${id}/`, {
        method: "DELETE",
    });
};