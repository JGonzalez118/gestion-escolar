import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
    const token = localStorage.getItem("access");
    const userRole = localStorage.getItem("rol");

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role && userRole !== role) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;