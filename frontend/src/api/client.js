// api/client.js

const BASE_URL = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("access");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    try {

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        if (response.status === 401) {
            localStorage.removeItem("access");
            window.location.href = "/login";
        }

        return await response.json();
    } catch (error) {
        console.error("API ERROR:", error);
        throw error;
    }
}

export default request;
