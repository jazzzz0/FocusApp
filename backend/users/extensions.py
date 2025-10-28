from drf_spectacular.extensions import OpenApiAuthenticationExtension


class BlacklistCheckingJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "users.authentication.BlacklistCheckingJWTAuthentication"
    name = "jwtAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT authentication with token blacklist checking.",
        }
