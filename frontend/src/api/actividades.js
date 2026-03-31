// api/actividades.js

import request from "./client";

export const getActividades = () => {
    return request("/actividades/");
};

export const crearActividad = (data) => {
    return request("/actividades/", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const actualizarActividades = (id, data) => {
    return request(`/actividades/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const actualizarParcialActividades = (id, data) => {
    return request(`/actividades/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const eliminarActividades = (id) => {
    return request(`/actividades/${id}/`, {
        method: "DELETE",
    });
};