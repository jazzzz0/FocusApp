/*export default function PerfilUsuario() {
  return <h1>Página del Perfil de Usuario</h1>;
}*/

import React from "react";

const UserProfile = ({ user }) => {
  return (
    <div className="max-w-lg mx-auto p-6 bg-blue-50 rounded-2xl shadow-md">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <img
          src={user.avatar || "/avatar-default.png"}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-300"
        />
        <div>
          <h2 className="text-xl font-bold text-blue-900">@{user.username}</h2>
          {user.fullName && (
            <p className="text-blue-600 text-sm">{user.fullName}</p>
          )}
          <button className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Editar perfil
          </button>
        </div>
      </div>

      {/* Biografía */}
      {user.bio && (
        <div className="mt-4 text-gray-700 text-sm">
          <p>{user.bio}</p>
        </div>
      )}

      {/* Contacto */}
      {user.email && (
        <div className="mt-4 text-gray-600 text-sm">
          <p>{user.email}</p>
        </div>
      )}

      {/* Enlaces */}
      {user.links && user.links.length > 0 && (
        <div className="mt-4 flex gap-3">
          {user.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
