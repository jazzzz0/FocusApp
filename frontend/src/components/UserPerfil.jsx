import React from "react";

const UserProfile = ({ user }) => {
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  if (!user || !user.data) {
    return (
      <div className="text-center text-gray-500 mt-10 p-4 animate-pulse">
        Cargando perfil... ⏳
      </div>
    );
  }

  const { username, first_name, last_name, profile_pic } = user.data;

  return (
   
    <div className="max-w-xs mx-auto my-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100 text-center">
      
      
      <img
        src={profile_pic || defaultAvatar}
        alt={`Foto de perfil de ${username}`}
        
        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400 shadow-md mx-auto mb-4"
      />

      
      <div className="flex flex-col items-center">
        {/* Nombre de usuario */}
        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">
          @{username}
        </h2>
        {/* Nombre completo */}
        <p className="text-md font-medium text-indigo-600 mb-4">
          {first_name} {last_name}
        </p>
        
        {/* Botón de acción */}
        <button className="px-4 py-1.5 bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-200">
          ✍️ Editar perfil
        </button>
      </div>
      
      {/* 3. Biografía opcional */}
      {user.bio && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            Biografía
          </h3>
          <p className="text-gray-600 text-sm italic">
            "{user.bio}"
          </p>
        </div>
      )}

    </div>
  );
};

export default UserProfile;