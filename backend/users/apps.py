from django.apps import AppConfig
from django.utils.module_loading import autodiscover_modules, import_module

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        extensions = import_module('users.extensions')
        autodiscover_modules(extensions.__name__)
        super().ready()