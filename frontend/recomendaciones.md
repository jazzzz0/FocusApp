# Variables de entorno
A la hora de insertar la URL de la API en el código, usar ${import.meta.env.VITE_API_BASE_URL} para no poner la URL cada vez, ya que el día en que se cambie la URL se tendrá que ir a cada parte del código que la invoque.
En cambio, llamando a ${import.meta.env.VITE_API_BASE_URL} estaremos importando directamente la variable de entorno sea cual sea su valor.
