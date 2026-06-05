import { Routes, Route, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Estudiantes from "./pages/Estudiantes";
import Asistencia from "./pages/Asistencia";
import Grados from "./pages/Grados";
import Salon from "./pages/Salon";
import Login from "./pages/login";

import Sidebar from "./components/Sidebar";
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
          padding: isLoginPage ? 0 : "20px 30px",
          overflowY: "auto",
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/estudiantes" 
          element={
          <PrivateRoute>
            <Estudiantes />
          </PrivateRoute>
          } />
          
          <Route path="/asistencia" 
          element={
          <PrivateRoute>
            <Asistencia />
          </PrivateRoute>
          } />

          <Route path="/salon"
          element={
          <PrivateRoute>
            <Salon />
          </PrivateRoute>
          } />
          
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