const ClaseActualCard = ({ materia }) => {

    return (
        <div className="clase-actual-card">

            <h2>Clase actual</h2>

            <span>
                {materia?.nombre || "Español"}
            </span>

        </div>
    );
};

export default ClaseActualCard;