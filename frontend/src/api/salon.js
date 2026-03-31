// api/salon.js

import request from "./client";

export const getSalones = () => {
    return request("/salones/");
};

export const crearSalon = (data) => {
    return request("/salones/", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const actualizarSalon = (id, data) => {
    return request(`/salones/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const actualizarParcialSalon = (id, data) => {
    return request(`/salones/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const eliminarSalon = (id) => {
    return request(`/salones/${id}/`, {
        method: "DELETE",
    });
};