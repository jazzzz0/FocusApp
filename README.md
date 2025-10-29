# Proyecto: FocusApp

Este repositorio contiene la aplicación de backend desarrollada con **Django** y la aplicación de frontend desarrollada con **React**. Ambos componentes trabajan juntos para formar una aplicación web completa.

## 1. Objetivo

El objetivo de esta plataforma web colaborativa es proporcionar un espacio donde fotógrafos y aficionados puedan compartir sus trabajos, recibir retroalimentación constructiva y mejorar sus habilidades fotográficas.

A través de la interacción con la comunidad, los usuarios pueden aprender de otros, recibir consejos útiles y crecer en su técnica, así recibir apoyo y aprendizaje constante. Además, al fomentar la colaboración y el intercambio de conocimientos, contribuyen al desarrollo y la mejora continua de la fotografía como arte y habilidad.

Este proyecto combina:

- Un **backend** robusto y escalable construido con **Django** y **Django REST Framework** para la gestión de datos, la lógica de negocio y la exposición de una API RESTful.
- Un **frontend** interactivo y dinámico desarrollado con **React** para la interfaz de usuario, consumiendo la API proporcionada por el backend.

### Stack Tecnológico
#### Backend
- **Python 3.12+**
- **Django** - Framework web
- **Django REST Framework** - API REST
- **Google Gemini API** - Generación de descripciones con IA

#### Frontend
- **React 19**
- **Vite** - Herramienta de construcción
- **Material UI (MUI)** - Componentes de interfaz
- **React Router** - Enrutamiento

#### Almacenamiento de datos
- **SQLite** - Base de datos para desarrollo.
- **PostgreSQL** - Base de datos para producción.
- **Google Cloud Storage** - Almacenamiento de archivos estáticos.

#### Autenticación
- **JWT** - JSON Web Tokens para la autenticación de usuarios.
- **Multisession** - Gestión de sesiones múltiples para la autenticación de usuarios.

#### Documentación de la API
- **Drf Spectacular** - Generación de documentación de la API. Se puede acceder a la documentación de la API en los siguientes enlaces:
  - [Documentación de la API en formato Swagger](http://localhost:8000/api/schema/swagger-ui/).
  - [Documentación de la API en formato Redoc](http://localhost:8000/api/schema/redoc/).
  - [Documentación de la API en formato JSON](http://localhost:8000/api/schema/).

## 2. Requisitos

Antes de configurar el proyecto, asegúrate de tener instalados los siguientes programas en tu sistema:

- **Python 3.12+**
- **pip** (gestor de paquetes de Python)
- **Node.js 20+**
- **pnpm 10+** (gestor de paquetes de Node.js)
- **Git**

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

    - **_SECRET_KEY_**: Clave secreta para la aplicación Django. Puedes generar una clave secreta aleatoria en cualquier generador de claves online.
    - **_GEMINI_API_KEY_**: Clave de API de Google Gemini para el uso de la API de generación de texto. Puedes obtener una clave de API de Google Gemini en el [Google AI Studio](https://aistudio.google.com/api-keys). Para esto debes tener una cuenta de Google.
      1. Dirigete a [Google AI Studio](https://aistudio.google.com/api-keys).
      2. Haz clic en _Crear clave de API_.
      3. Asignale un nombre a la clave.
      4. Crea un nuevo proyecto y asignale un nombre.
      5. Presiona el botón _Crear clave_.
      6. Copia la clave de API que aparece en la lista de claves y pegala en tu archivo .env como **_GEMINI_API_KEY_**.

5.  **Aplica las migraciones de la base de datos:** Esto creará las tablas necesarias en tu base de datos local.
    ```
    python manage.py makemigrations
    python manage.py migrate
    ```

### 3.3 Configuración del Frontend (React)

1.  **Navega al directorio del frontend:** Asegúrate de estar en el directorio raíz del proyecto (`FocusApp/`) antes de ejecutar este comando.

    ```
    cd frontend
    ```

2.  **Instala las dependencias de Node.js:**
    ```
    pnpm install
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
    pnpm run dev
    ```

    El frontend se abrirá automáticamente en tu navegador en `http://localhost:5173`.

**¡Asegúrate de que ambos servidores estén funcionando al mismo tiempo para que la aplicación web funcione correctamente!**

## 5. Herramientas de Calidad de Código

Este proyecto utiliza herramientas de linting y formatting para mantener un código limpio y consistente entre todos los desarrolladores.

### 5.1. Frontend (React + Vite)

- **ESLint**: Linter para detectar errores de código y buenas prácticas en JavaScript/React.
- **Prettier**: Formateador automático de código para mantener consistencia en el estilo.

**Comandos disponibles:**

```bash
pnpm run lint           # Verifica el código con ESLint
pnpm run lint:fix       # Corrige errores automáticamente (cuando es posible)
pnpm run format         # Formatea todo el código con Prettier
pnpm run format:check   # Verifica el formato sin modificar archivos
```

### 5.2. Backend (Django + Python)

- **Flake8**: Linter para detectar errores, advertencias y problemas de estilo en Python.
- **Black**: Formateador automático de código Python siguiendo el estilo PEP 8.

**Comandos disponibles (con entorno virtual activado):**

```bash
flake8 .               # Verifica el código con Flake8
black .                # Formatea todo el código con Black
black --check .        # Verifica el formato sin modificar archivos
```

## 6. Scripts Útiles

### 6.1. Backend (desde el directorio `backend/`)

- `python manage.py makemigrations`: Crea nuevas migraciones de base de datos a partir de los cambios en los modelos.
- `python manage.py migrate`: Aplica las migraciones pendientes a la base de datos.
- `python manage.py createsuperuser`: Crea un nuevo usuario administrador.
- `python manage.py runserver`: Inicia el servidor de desarrollo de Django.
- `pip install -r requirements.txt`: Instala todas las dependencias listadas.

### 6.2. Frontend (desde el directorio `frontend/`)

- `pnpm run dev`: Inicia el servidor de desarrollo de React.
- `pnpm run build`: Compila la aplicación React para producción, creando una carpeta `build/`.
- `pnpm install`: Instala todas las dependencias listadas en `package.json`.
