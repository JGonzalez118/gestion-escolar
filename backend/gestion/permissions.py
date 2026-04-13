from rest_framework.permissions import BasePermission

class EsDocente(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="Docente").exists()
    

class EsEstudiante(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="Estudiante").exists()
    
