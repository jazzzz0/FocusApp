# 🔐 Implementación de Sesión Única

Esta implementación agrega funcionalidad de **sesión única** a tu aplicación FocusApp, evitando que un usuario pueda estar autenticado en múltiples dispositivos simultáneamente.

## 🚀 ¿Qué hace?

Cuando un usuario inicia sesión en un nuevo dispositivo:
1. **Se invalidan automáticamente** todos los tokens anteriores del usuario
2. **Se genera un nuevo token** solo para la sesión actual
3. **Las sesiones anteriores** quedan inmediatamente inválidas

## 📁 Archivos Modificados

### `backend/users/views.py`
- ✅ Agregada clase `SingleSessionTokenObtainPairView`
- ✅ Implementa lógica de invalidación de tokens anteriores
- ✅ Mantiene la misma interfaz que la vista original

### `backend/api/urls.py`
- ✅ Actualizada la URL `/api/token/` para usar la nueva vista
- ✅ Mantiene compatibilidad con el frontend existente

## 🛠️ Archivos Nuevos

### `backend/scripts/test_single_session.py`
Script de prueba para verificar que la funcionalidad funciona correctamente.

**Uso:**
```bash
cd backend
python scripts/test_single_session.py
```

### `backend/users/middleware.py`
Middleware opcional para logging de intentos de uso de tokens invalidados.

### `backend/users/management/commands/cleanup_tokens.py`
Comando de Django para limpiar tokens antiguos de la blacklist.

**Uso:**
```bash
# Ver qué se eliminaría (modo dry-run)
python manage.py cleanup_tokens --dry-run

# Limpiar tokens más antiguos que 30 días
python manage.py cleanup_tokens --days 30

# Limpiar tokens más antiguos que 7 días
python manage.py cleanup_tokens --days 7
```

## 🧪 Cómo Probar

### 1. Prueba Manual
1. Inicia sesión con un usuario en el navegador
2. Abre otra pestaña/ventana y vuelve a iniciar sesión con el mismo usuario
3. Regresa a la primera pestaña y recarga la página
4. Deberías ver que la primera sesión ya no funciona

### 2. Prueba Automatizada
```bash
cd backend
python scripts/test_single_session.py
```

## ⚙️ Configuración Opcional

### Middleware de Logging
Si quieres monitorear intentos de uso de tokens invalidados, agrega el middleware en `settings.py`:

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'users.middleware.SingleSessionLoggingMiddleware',  # ← Agregar esta línea
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### Limpieza Automática
Para limpiar tokens antiguos automáticamente, puedes agregar un cron job:

```bash
# Ejecutar cada domingo a las 2 AM
0 2 * * 0 cd /ruta/a/tu/proyecto/backend && python manage.py cleanup_tokens --days 30
```

## 🔍 Monitoreo

### Verificar Estado de la Blacklist
```python
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

# Contar tokens pendientes
outstanding_count = OutstandingToken.objects.count()

# Contar tokens en blacklist
blacklisted_count = BlacklistedToken.objects.count()

print(f"Tokens pendientes: {outstanding_count}")
print(f"Tokens en blacklist: {blacklisted_count}")
```

### Logs
Los logs de la aplicación mostrarán:
- ✅ Intentos de login exitosos
- ⚠️ Intentos de uso de tokens invalidados (si usas el middleware)
- 🔧 Errores en la invalidación de tokens

## 🚨 Consideraciones Importantes

### Rendimiento
- La invalidación de tokens es eficiente y rápida
- Solo afecta al momento del login, no a cada request
- Los tokens invalidados se almacenan en la blacklist para verificación

### Seguridad
- ✅ Los tokens anteriores quedan completamente inválidos
- ✅ No es posible usar tokens de sesiones anteriores
- ✅ La funcionalidad es transparente para el usuario

### Compatibilidad
- ✅ **No requiere cambios en el frontend**
- ✅ Mantiene la misma API de login
- ✅ Compatible con el sistema de refresh tokens existente

## 🐛 Solución de Problemas

### Error: "No module named 'rest_framework_simplejwt.token_blacklist'"
Asegúrate de que tienes instalado el paquete correcto:
```bash
pip install djangorestframework-simplejwt[token_blacklist]
```

### Error: "OutstandingToken matching query does not exist"
Esto es normal si no hay tokens pendientes. El sistema maneja este caso automáticamente.

### Los tokens anteriores siguen funcionando
1. Verifica que estás usando la nueva vista `SingleSessionTokenObtainPairView`
2. Revisa los logs para errores en la invalidación
3. Ejecuta el script de prueba para verificar

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los logs de la aplicación
2. Ejecuta el script de prueba
3. Verifica que todos los archivos estén correctamente modificados
4. Asegúrate de que el servidor se haya reiniciado después de los cambios
