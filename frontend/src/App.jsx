import { Routes, Route, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Estudiantes from "./pages/Estudiantes";
import Asistencia from "./pages/Asistencia";
import Grados from "./pages/Grados";
import Sidebar from "./components/Sidebar";
import Login from "./pages/login";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* Solo renderiza el Sidebar si NO estamos en /login */}
      {!isLoginPage && <Sidebar />}

      <div
        style={{
          flex: 1,
          padding: "20px 30px",
          overflowY: "auto",
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/estudiantes" element={<Estudiantes />} />
          <Route path="/asistencia" element={<Asistencia />} />

          //! EJEMPLO A USAR - PRIVATE ROUTE DETERMINA LOS PERMISOS Y LO LLEVA A LA PAGINA
          // ! EN ESTE EJEMPLO EL ESTUDIANTE NO DEBE VER TODOS LOS OTROS GRADOS 
          <Route
            path="/grados"
            element={
              <PrivateRoute role="docente">
                <Grados />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;