import { useEffect, useState } from "react";
import { getEstudiantes } from "../api/estudiantes";
import { getActividades } from "../api/actividades";
import { getGrados } from "../api/grados";

export default function Dashboard() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [grados, setGrados] = useState([]);

    useEffect(() => {
        getEstudiantes().then(setEstudiantes).catch(console.error);
        getActividades().then(setActividades).catch(console.error);
        getGrados().then(setGrados).catch(console.error);
    }, []);

    return (
        <div>
            
            <div style={styles.header}>
                <h2>Bienvenido [NOMBRE]</h2>
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

                    {actividades.slice(0, 6).map((act, i) => (
                        <div key={i} style={styles.item}>
                            <span>{act.nombre || "Actividad"}</span>
                            <span>Puntaje: {act.puntaje || 100}</span>
                        </div>
                    ))}
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
};