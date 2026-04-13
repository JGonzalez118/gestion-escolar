from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import *
from .serializers import *

# permisos
from .permissions import EsDocente, EsEstudiante
from rest_framework.permissions import IsAuthenticated

# perfiles a usuarios y estudiantes
@api_view(['GET'])
def perfil(request):
    user = request.user

    if user.groups.filter(name="Docente").exists():
        return Response({"rol": "docente"})
    
    if user.groups.filter(name="Estudiante").exists():
        return Response({"rol": "estudiante"})
    
    return Response({"rol": "desconocido"})


class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.filter(activo=True)
    serializer_class = EstudianteSerializer


class DocenteViewSet(viewsets.ModelViewSet):
    queryset = Docente.objects.filter(activo=True)
    serializer_class = DocenteSerializer


class SalonViewSet(viewsets.ModelViewSet):
    queryset = Salon.objects.all()
    serializer_class = SalonSerializer


class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.all()
    serializer_class = MateriaSerializer


class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer


class NotaViewSet(viewsets.ModelViewSet):
    queryset = Nota.objects.all()
    serializer_class = NotaSerializer

    def get_queryset(self):
        user = self.request.user

        if user.groups.filter(name="Docente").exists():
            return Nota.objects.all()
        
        if user.groups.filter(name="Estudiante").exists():
            return Nota.objects.filter(estudiante__user=user)
        

        return Nota.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [EsDocente()]
        
        return [IsAuthenticated()]

    # # ? Calcular el promedio
    # @action(detail=False, methods=['get'])
    # def promedio(self, request):
    #     promedio = Nota.objects.aaggregate(avg=models.Avg('nota'))
    #     return Response(promedio)


class AsistenciaViewSet(viewsets.ModelViewSet):
    queryset = Asistencia.objects.all()
    serializer_class = AsistenciaSerializer


class GradoViewSet(viewsets.ModelViewSet):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer


class PeriodoViewSet(viewsets.ModelViewSet):
    queryset = Periodo.objects.all()
    serializer_class = PeriodoSerializer
