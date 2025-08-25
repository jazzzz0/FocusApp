import React from "react";
import LogoutButton from "../components/LogoutButton";

const Dashboard = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Bienvenido al Dashboard 🚀</h1>
      <p>Solo los usuarios autenticados pueden ver esto.</p>
      <LogoutButton />
    </div>
  );
};

export default Dashboard;
