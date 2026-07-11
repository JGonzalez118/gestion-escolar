const ClaseActualCard = ({ materia }) => {
    return (
        <div className="salon-card clase-actual">
            <span className="clase-actual__label">Clase actual</span>
            <span className="clase-actual__value">
                {materia?.nombre || "Sin materia seleccionada"}
            </span>
        </div>
    );
};

export default ClaseActualCard;
