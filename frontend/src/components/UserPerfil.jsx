
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Perfil.css";

const UserProfile = ({ user }) => {
  const navigate = useNavigate();
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  if (!user || !user.data) {
    return (
      <div className="text-center text-gray-500 mt-10 p-4 animate-pulse">
        Cargando perfil... ⏳
      </div>
    );
  }

  const { username, first_name, last_name, profile_pic, bio } = user.data;

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <img src={profile_pic || defaultAvatar} alt={`Foto de perfil de ${username}`} />
        <h2>@{username}</h2>
        <p>{first_name} {last_name}</p>

        <button onClick={() => navigate("/editar-perfil")}>
          ✍️ Editar perfil
        </button>

        {bio && <div className="bio">"{bio}"</div>}
      </div>
    </div>
  );
};

export default UserProfile;
