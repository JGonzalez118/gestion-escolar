// api/auth.js

import request from "./client";
const API_URL = "http://127.0.0.1:8000/api/token/";

export const login = async (username, password) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username, password}),
    });

    if (!response.ok) {
        throw new Error("Credenciales Incorrectas.");
    }

    const data = await response.json();

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    return data;
};

export const getPerfil = () => {
    return request("/perfil/");
};

export const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
};