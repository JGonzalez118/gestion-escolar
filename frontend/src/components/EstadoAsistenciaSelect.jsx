import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Estados de asistencia; la letra coincide con el valor del backend.
// El color lo aporta la clase (definida en estudiantes.css).
const ESTADOS_ASISTENCIA = [
    { valor: "P", label: "Presente", clase: "badge-estado--p" },
    { valor: "A", label: "Ausente", clase: "badge-estado--a" },
    { valor: "T", label: "Tarde", clase: "badge-estado--t" },
    { valor: "E", label: "Excusa", clase: "badge-estado--e" },
];

const SIN_REGISTRAR = { label: "Sin registrar", clase: "badge-estado--none" };

/**
 * Muestra el estado de asistencia como badge de color y permite cambiarlo.
 * El cambio se notifica con onChange (el guardado lo maneja el padre).
 */
const EstadoAsistenciaSelect = ({ value, onChange, disabled = false }) => {
    const [abierto, setAbierto] = useState(false);
    const wrapperRef = useRef(null);

    const actual = ESTADOS_ASISTENCIA.find((e) => e.valor === value) ?? SIN_REGISTRAR;

    // Cerrar al hacer clic fuera o al presionar Escape.
    useEffect(() => {
        if (!abierto) return;

        const alClicFuera = (e) => {
            if (!wrapperRef.current?.contains(e.target)) setAbierto(false);
        };
        const alPresionarTecla = (e) => {
            if (e.key === "Escape") setAbierto(false);
        };

        document.addEventListener("mousedown", alClicFuera);
        document.addEventListener("keydown", alPresionarTecla);

        return () => {
            document.removeEventListener("mousedown", alClicFuera);
            document.removeEventListener("keydown", alPresionarTecla);
        };
    }, [abierto]);

    const seleccionar = (estado) => {
        setAbierto(false);
        if (estado !== value) onChange(estado);
    };

    return (
        <div className="estado-select" ref={wrapperRef}>
            <button
                type="button"
                className={`badge-estado estado-select__trigger ${actual.clase}`}
                onClick={() => setAbierto((v) => !v)}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={abierto}
            >
                {actual.label}
                <ChevronDown size={14} />
            </button>

            {abierto && (
                <ul className="estado-select__menu" role="listbox">
                    {ESTADOS_ASISTENCIA.map((estado) => (
                        <li key={estado.valor}>
                            <button
                                type="button"
                                className="estado-select__option"
                                role="option"
                                aria-selected={estado.valor === value}
                                onClick={() => seleccionar(estado.valor)}
                            >
                                <span className={`estado-select__dot ${estado.clase}`} />
                                {estado.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default EstadoAsistenciaSelect;
