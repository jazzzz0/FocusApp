# Proyecto: FocusApp

Este repositorio contiene la aplicación de backend desarrollada con **Django** y la aplicación de frontend desarrollada con **React**. Ambos componentes trabajan juntos para formar una aplicación web completa.
## 1. Objetivo
El objetivo de esta plataforma web colaborativa es proporcionar un espacio donde fotógrafos y aficionados puedan compartir sus trabajos, recibir retroalimentación constructiva, participar en concursos para desafiar su creatividad y mejorar sus habilidades fotográficas.  

A través de la interacción con la comunidad, los usuarios pueden aprender de otros, recibir consejos útiles y crecer en su técnica, así recibir apoyo y aprendizaje constante. Además, al fomentar la colaboración y el intercambio de conocimientos, contribuyen al desarrollo y la mejora continua de la fotografía como arte y habilidad.

Este proyecto combina:

-   Un **backend** robusto y escalable construido con **Django** y **Django REST Framework** para la gestión de datos, la lógica de negocio y la exposición de una API RESTful.
-   Un **frontend** interactivo y dinámico desarrollado con **React** para la interfaz de usuario, consumiendo la API proporcionada por el backend.

## 2. Requisitos

Antes de configurar el proyecto, asegúrate de tener instalados los siguientes programas en tu sistema:

-   **Python 3.12+**
-   **pip** (gestor de paquetes de Python)
-   **Node.js 20+**
-   **npm 10+** (gestor de paquetes de Node.js)
-   **Git**

## 3. Configuración del Entorno de Desarrollo

Para comenzar a trabajar en el proyecto, sigue estos pasos:

### 3.1. Clonar el Repositorio

Primero, clona el repositorio a tu máquina local:
```
git clone https://github.com/jazzzz0/FocusApp.git
cd FocusApp
```

### 3.2. Configuración del Backend (Django)

1.  **Navega al directorio del backend:**
    ```
    cd backend
    ```
    
2.  **Crea y activa un entorno virtual:** Esto aísla las dependencias de Python de tu sistema global, evitando conflictos.
    ```
    python -m venv env
    
    # En Windows:
    .\env\Scripts\activate
    
    # En macOS/Linux:
    source env/bin/activate
    ```
    
3.  **Instala las dependencias de Python:**
    ```
    pip install -r requirements.txt
    ```
    
4.  **Configura las variables de entorno:** Crea un archivo llamado `.env` en el directorio `backend/`. Este archivo contendrá configuraciones sensibles o específicas del entorno (como claves secretas y credenciales de base de datos).
    
    **¡Importante!** No modifiques el archivo `.env.example`. Utilízalo como plantilla para tu propio `.env`. Copia su contenido y pegalo en tu nuevo archivo `.env` del directorio `backend/`. 
    
5.  **Aplica las migraciones de la base de datos:** Esto creará las tablas necesarias en tu base de datos local.
    ```
    python manage.py makemigrations
    python manage.py migrate  
    ```
    
6.  **Crea un superusuario (opcional):** Necesitarás un superusuario para acceder al panel de administración de Django (`/admin`).
    ```
    python manage.py createsuperuser
    ```
    Sigue las instrucciones en la terminal para establecer el nombre de usuario, email y contraseña.
    
### 3.3 Configuración del Frontend (React)

1.  **Navega al directorio del frontend:** Asegúrate de estar en el directorio raíz del proyecto (`FocusApp/`) antes de ejecutar este comando.
    
    ```
    cd frontend
    ```
    
2.  **Instala las dependencias de Node.js:**
    ```
    npm install
    ```
    
3.  **Configura las variables de entorno:** Crea un archivo llamado `.env` en el directorio `frontend/`. Este archivo contendrá configuraciones para el frontend, como la URL de la API.
    
    **¡Importante!** Al igual que con el backend, no modifiques el archivo `.env.example`. Copia y pega su contenido en el archivo `.env` que hayas creado en el directorio `frontend/`.

## 4. Ejecución del Proyecto

Para que la aplicación funcione completamente, necesitarás ejecutar tanto el backend como el frontend de manera simultánea.

### 4.1. Iniciar el Backend (Django)

1.  **Abre una nueva terminal.**
2.  **Navega al directorio `backend`:**
    
    Bash
    
    ```
    cd FocusApp/backend
    
    ```
    
3.  **Activa el entorno virtual:**
    
    ```
    # En Windows:
    .\env\Scripts\activate
    
    # En macOS/Linux:
    source env/bin/activate
    ```
    
4.  **Inicia el servidor de desarrollo de Django:**
    ```
    python manage.py runserver
    ```
    
    El backend estará disponible en `http://localhost:8000`. La API se servirá desde `http://localhost:8000/api/`.

### 4.2. Iniciar el Frontend (React)

1.  **Abre otra nueva terminal.**
2.  **Navega al directorio `frontend`:**
    ```
    cd FocusApp/frontend
    ```
    
3.  **Inicia el servidor de desarrollo de React (usando Vite):**
    ```
    npm run dev
    ```
    
    El frontend se abrirá automáticamente en tu navegador en `http://localhost:5173`.

**¡Asegúrate de que ambos servidores estén funcionando al mismo tiempo para que la aplicación web funcione correctamente!**

## 5. Estructura del Proyecto

-   **`backend/`**: Contiene todo el código del servidor Django.
    -   `api/`: Configuración principal del proyecto Django (`settings.py`, `urls.py`).
    -   `core/`: Una aplicación Django individual con modelos, serializadores, vistas, etc. Funcionalidades transversales para el funcionamiento de todo el proyecto, no contendrá la lógica de negocio principal (eso va en apps como users, posts, ratings).
    -   `requirements.txt`: Listado de todas las dependencias de Python.
    -   `.env`: Variables de entorno para el backend (ignoradas por Git).
    -   `env/`: Entorno virtual de Python (ignoradas por Git).
-   **`frontend/`**: Contiene todo el código de la aplicación React.
    -   `public/`: Archivos estáticos públicos (como `index.html`).
    -   `src/`: Código fuente principal de React (componentes, páginas, lógica de API).
    -   `package.json`: Configuración y dependencias de Node.js/npm.
    -   `.env`: Variables de entorno para el frontend (ignoradas por Git).
    -   `node_modules/`: Dependencias de Node.js (ignoradas por Git).
    -   `build/`: Archivos de la aplicación React compilada para producción (ignorados por Git).
-   **`.gitignore`**: Define los archivos y directorios que Git debe ignorar (ej. entornos virtuales, archivos `.env`, directorios de build).
-   **`README.md`**: Este archivo.

## 6. Scripts Útiles

### 6.1. Backend (desde el directorio `backend/`)

-   `python manage.py makemigrations`: Crea nuevas migraciones de base de datos a partir de los cambios en los modelos.
-   `python manage.py migrate`: Aplica las migraciones pendientes a la base de datos.
-   `python manage.py createsuperuser`: Crea un nuevo usuario administrador.
-   `python manage.py runserver`: Inicia el servidor de desarrollo de Django.
-   `pip install -r requirements.txt`: Instala todas las dependencias listadas.

### 6.2. Frontend (desde el directorio `frontend/`)

-   `npm run dev`: Inicia el servidor de desarrollo de React.
-   `npm run build`: Compila la aplicación React para producción, creando una carpeta `build/`.
-   `npm install`: Instala todas las dependencias listadas en `package.json`.