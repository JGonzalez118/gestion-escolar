// Helper de alertas basado en SweetAlert2.
// Centraliza el estilo para mantener coherencia con la paleta papel/tinta
// del proyecto y respeta el tema claro/oscuro activo.

import Swal from "sweetalert2";

// Lee el tema actual desde el atributo que controla ThemeContext.
function temaActual() {
    return document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
}

function fire(opciones) {
    return Swal.fire({
        theme: temaActual(),
        confirmButtonColor: "#1a3454",
        cancelButtonColor: "#9c8753",
        ...opciones,
    });
}

export const alertaExito = (titulo, texto = "") =>
    fire({ icon: "success", title: titulo, text: texto });

export const alertaError = (titulo, texto = "") =>
    fire({ icon: "error", title: titulo, text: texto });

export const alertaInfo = (titulo, texto = "") =>
    fire({ icon: "info", title: titulo, text: texto });

// Aviso discreto en una esquina; para acciones que se guardan al instante.
export const toastExito = (titulo) =>
    fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: titulo,
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
    });

// Devuelve el resultado de SweetAlert2; usar `result.isConfirmed`.
export const alertaConfirmar = ({
    titulo,
    texto = "",
    confirmar = "Continuar",
    cancelar = "Cancelar",
}) =>
    fire({
        icon: "warning",
        title: titulo,
        text: texto,
        showCancelButton: true,
        confirmButtonText: confirmar,
        cancelButtonText: cancelar,
    });
