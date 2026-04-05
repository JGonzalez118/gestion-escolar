import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Estudiantes from "./pages/Estudiantes";
import Asistencia from "./pages/Asistencia";
import Grados from "./pages/Grados";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", height: "100vh" }}>

        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENIDO */}
        <div
          style={{
            flex: 1,
            padding: "20px 30px",
            overflowY: "auto",
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/estudiantes" element={<Estudiantes />} />
            <Route path="/asistencia" element={<Asistencia />} />
            <Route path="/grados" element={<Grados />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;