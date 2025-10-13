import React, { useState, useEffect } from "react";
import "../styles/perfil.css";

const EditarPerfil = ({ user, onSave }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (user?.data) {
      setFirstName(user.data.first_name || "");
      setLastName(user.data.last_name || "");
      setBio(user.data.bio || "");
    }
  }, [user]);

  const handleSave = () => {
    const updatedData = {
      first_name: firstName,
      last_name: lastName,
      bio: bio,
    };
    if (onSave) onSave(updatedData);
  };

  return (
    <div className="profile-container">
      <h2>Editar perfil</h2>

      <input
        type="text"
        placeholder="Nombre"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Apellido"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <textarea
        placeholder="Biografía"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <button onClick={handleSave}>💾 Guardar cambios</button>
    </div>
  );
};

export default EditarPerfil;
