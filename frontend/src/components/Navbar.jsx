import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav>
            <Link to="/">Inicio</Link> |
            <Link to="/estudiantes">Estudiantes</Link> |
            <Link to="/asistencia">Asistencia</Link> |
            <Link to="/actividades">Actividades</Link>
        </nav>
    );
}