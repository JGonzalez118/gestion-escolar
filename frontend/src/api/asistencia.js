// api/asistencia.js

import request from "./client";

export const getAsistencia = () => {
    return request("/asistencia/");
};

export const registrarAsistencia = (data) => {
    return request("/asistencia/", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const actualizarAsistencia = (id, data) => {
    return request(`/asistencia/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const actualizarParcialAsistencia = (id, data) => {
    return request(`/asistencia/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const eliminarAsistencia = (id) => {
    return request(`/asistencia/${id}/`, {
        method: "DELETE",
    });
};