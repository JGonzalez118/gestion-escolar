// api/client.js

const BASE_URL = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const config = {
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API ERROR:", error);
        throw error;
    }
}

export default request;
