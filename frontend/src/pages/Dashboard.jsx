import { useEffect, useState } from "react";
import { getEstudiantes } from "../api/estudiantes";
import { getActividades } from "../api/actividades";
import { getGrados } from "../api/grados";
import { getPerfil } from "../api/auth";

export default function Dashboard() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [grados, setGrados] = useState([]);

    useEffect(() => {
        getEstudiantes().then(setEstudiantes).catch(console.error);
        getActividades().then(setActividades).catch(console.error);
        getGrados().then(setGrados).catch(console.error);
    }, []);

    // USUARIO ACTUAL CONECTADO
    const [perfil, setPerfil] = useState(null);
    useEffect(() => {
        getPerfil()
            .then(setPerfil)
            .catch(console.error);
    }, []);

    const obtenerFechaLocal = () => {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        return `${anio}-${mes}-${dia}`;
    };

    const hoy = obtenerFechaLocal();
    const actividadesDeHoy = actividades.filter((act) => act.fecha === hoy);

    return (
        <div>
            <div style={styles.header}>
                <h2>Bienvenido {perfil?.nombre_completo || "..."}</h2>
                <span>Año escolar - 2026</span>
            </div>
            {/** AQUI VAN LAS CARDS **/}
            <div style={styles.cards}>
                <Card title="Salones" value={grados.length} />
                <Card title="Estudiantes" value={estudiantes.length} />
                <Card title="Actividades" value={actividades.length} />
            </div>
            {/* IFNROMACION */}
            <div style={styles.grid}>
                {/* ACTIVIDADES */}
                <div style={styles.box}>
                    <h3>Actividades del día</h3>
                    <hr />
                    {actividadesDeHoy.length === 0 ? (
                        <p style={styles.sinDatos}>No hay actividades para hoy.</p>
                    ) : (
                        actividadesDeHoy.slice(0, 6).map((act, i) => (
                            <div key={act.id ?? i} style={styles.item}>
                                <span>{act.nombre || "Actividad"}</span>
                                <span>Puntaje: {act.puntaje || 5}</span>
                            </div>
                        ))
                    )}
                </div>
                {/* GRAFICO DE DISTRIBUCION DE ESTUDIANTES */}
                <div style={styles.box}>
                    <h3>Distribución</h3>
                    <hr />
                    <div style={{ textAlign: "center", marginTop: "40px" }}>
                        aqui hay q poner la grafica
                    </div>
                </div>
            </div>
        </div>
    );
}

/* 🔹 Card reutilizable */
function Card({ title, value }) {
    return (
        <div style={styles.card}>
            <h4>{title}</h4>
            <span style={{ fontSize: "22px", fontWeight: "bold" }}>
                {value}
            </span>
        </div>
    );
}

//! CSS QUE HAY QUE MOVER
const styles = {
    header: {
        background: "var(--card-bg)",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cards: {
        display: "flex",
        gap: "20px",
        marginBottom: "20px",
    },
    card: {
        flex: 1,
        background: "var(--card-bg)",
        padding: "20px",
        borderRadius: "12px",
        textAlign: "center",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px",
    },
    box: {
        background: "var(--card-bg)",
        padding: "20px",
        borderRadius: "12px",
    },
    item: {
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #eee",
    },
    sinDatos: {
        color: "var(--secondary)",
        textAlign: "center",
        padding: "20px 0",
    },
};