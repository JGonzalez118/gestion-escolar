import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Estudiantes from "./pages/Estudiantes";
import Asistencia from "./pages/Asistencia";
import Grados from "./pages/Grados";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <div>
        <h1>Sistema Escolar</h1>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/estudiantes" element={<Estudiantes />} />
          <Route path="/asistencia" element={<Asistencia />} />
          <Route path="/grados" element={<Grados />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;