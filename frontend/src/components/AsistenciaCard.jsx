const AsistenciaCard = ({ asistencias }) => {

    return (
        <div className="card asistencia-card">

            <div className="card-top"></div>

            <div className="card-content">

                <h2>Asistencia</h2>

                <div className="divider"></div>

                {
                    asistencias.map((item) => (
                        <div className="student-item" key={item.id}>

                            <div>
                                <h3>
                                    {item.estudiante_nombre || "Nombre"}
                                </h3>

                                <button className="link-button">
                                    Calificar una actividad
                                </button>
                            </div>

                            <div className="estado">
                                {item.estado} - {
                                    item.estado === "P" ? "Presente"
                                        : item.estado === "A" ? "Ausente"
                                            : item.estado === "T" ? "Tardanza"
                                                : "Excusa"
                                }
                            </div>

                        </div>
                    ))
                }

            </div>

        </div>
    );
};

export default AsistenciaCard;