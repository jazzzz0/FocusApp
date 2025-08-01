import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FocusApp from "./components/FocusApp";
import Registro from "./components/RegisterForm";

function App() {
  return (
    <Router>
      <nav style={{ margin: 16 }}>
        <Link to="/RegisterForm" style={{ marginRight: 16 }}>Registro</Link>
        <Link to="/focusapp">FocusApp</Link>
      </nav>
      <Routes>
        <Route path="/RegisterForm" element={<Registro />} />
        <Route path="/focusapp" element={<FocusApp />} />
      </Routes>
    </Router>
  );
}
export default App;
