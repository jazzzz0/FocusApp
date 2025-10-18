"""
Autenticación personalizada que verifica la blacklist de tokens.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken


class BlacklistCheckingJWTAuthentication(JWTAuthentication):
    """
    Autenticación JWT personalizada que verifica si el token está en la blacklist.
    """
    
    def get_validated_token(self, raw_token):
        """
        Valida el token y verifica que no esté en la blacklist.
        """
        # Primero validar el token normalmente
        validated_token = super().get_validated_token(raw_token)
        
        # Verificar si el token está en la blacklist usando el método correcto
        jti = validated_token.get('jti')
        if jti:
            try:
                # Buscar el token en OutstandingToken
                outstanding_token = OutstandingToken.objects.get(jti=jti)
                # Verificar si está en la blacklist
                if BlacklistedToken.objects.filter(token=outstanding_token).exists():
                    raise InvalidToken('Token has been revoked')
            except OutstandingToken.DoesNotExist:
                # Si no existe en OutstandingToken, también es inválido
                raise InvalidToken('Token not found')
        
        return validated_token
