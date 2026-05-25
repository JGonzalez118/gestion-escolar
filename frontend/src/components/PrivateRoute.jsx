// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children, role }) => {
//     const token = localStorage.getItem("access");
//     const userRole = localStorage.getItem("rol");

//     if (!token) {
//         return <Navigate to="/login" replace />;
//     }

//     if (role && userRole !== role) {
//         return <Navigate to="/" />;
//     }

//     return children;
// };

// export default PrivateRoute;

import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role = null }) => {

    const token =
        localStorage.getItem("access");

    const rol =
        localStorage.getItem("rol");

    // Sin sesión
    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // Ruta con rol requerido
    if (role && rol !== role) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
};

export default PrivateRoute;