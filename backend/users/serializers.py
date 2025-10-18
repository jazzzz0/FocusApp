from rest_framework import serializers
from .models import AppUser
from datetime import date
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from email_validator import validate_email, EmailNotValidError
from api.settings import AUTH_PASSWORD_VALIDATORS

class UserSerializer(serializers.ModelSerializer):
    # Campo "password" para escritura, pero no para lectura
    # write_only=True -> el campo solo se usa para la entrada (crear/actualizar)
    # no se incluye en la respuesta JSON al leer un usuario
    # required=True -> el campo es obligatorio al crear/actualizar
    password = serializers.CharField(write_only=True, required=True)
    

    class Meta:
        model = AppUser
        # Definir los campos que se exponen a la API
        # Se incluye "password"
        fields = [
            'id', 'email', 'username', 'password', 'first_name', 'last_name',
            'date_of_birth', 'profile_pic'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'date_of_birth': {'required': True},
        }

    def validate_email(self, value):
        try:
            emailinfo = validate_email(value, check_deliverability=True)
            value = emailinfo.normalized

        except EmailNotValidError as e:
            raise serializers.ValidationError("El email no es válido.")

        return value


    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError("La contraseña debe tener al menos 10 caracteres y no puede ser completamente numérica.")
        return value

    def validate_date_of_birth(self, value):
        today = date.today()
        age = (
            today.year
            - value.year
            - ((today.month, today.day) < (value.month, value.day))
        )
        if age < 18:
            raise serializers.ValidationError("El usuario debe ser mayor de edad.")
        return value
        

        # Creación de un nuevo usuario
    def create(self, validated_data):
         # "pop" elimina el campo "password" de los datos validados
         # y lo guarda en la variable "password"
        password = validated_data.pop('password')

        # "**validated_data" pasa los datos restantes al constructor de "AppUser"
        user = AppUser(**validated_data)

        # "set_password" encripta la contraseña
        user.set_password(password)

        # "save" guarda el usuario en la base de datos
        user.save()

        # "return user" devuelve el usuario creado
        return user
    # Actualización de un usuario existente
    def update(self, instance, validated_data):
        # Manejar la actualización segura de la contraseña
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        # Lista de campos que NO se deben actualizar desde la API
        protected_fields = ['is_superuser', 'is_staff', 'is_active', 'groups', 'user_permissions', 'last_login', 'date_joined']

        # Actualizar dinámicamente los demás campos permitidos
        for attr, value in validated_data.items():
            if attr not in protected_fields:
                setattr(instance, attr, value)

        instance.save()
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = ['id', 'username', 'profile_pic', 'first_name', 'last_name']