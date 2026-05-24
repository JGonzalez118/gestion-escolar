from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import *
from .serializers import *

# permisos
from .permissions import EsDocente, EsEstudiante
from rest_framework.permissions import IsAuthenticated

# perfiles a usuarios y estudiantes
# @api_view(['GET'])
# def perfil(request):
#     user = request.user

#     if user.groups.filter(name="Docente").exists():
#         return Response({"rol": "docente"})

#     if user.groups.filter(name="Estudiante").exists():
#         return Response({"rol": "estudiante"})

#     return Response({"rol": "desconocido"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil(request):
    user = request.user
    # DOCENTE
    if user.groups.filter(name="Docente").exists():
        try:
            docente = Docente.objects.get(user=user)
        except Docente.DoesNotExist:
            return Response({
                "error": "No existe un perfil docente asociado."
            }, status=404)
        salon = Salon.objects.filter(
            consejero=docente
        ).first()
        return Response({

            "id": user.id,
            "username": user.username,
            "rol": "docente",

            "nombre_completo":
                f"{docente.nombre} {docente.apellido}",

            "docente": {
                "id": docente.id,
                "nombre": docente.nombre,
                "apellido": docente.apellido,
                "cedula": docente.cedula,
                "telefono": docente.telefono
            },

            "salon": {
                "id": salon.id if salon else None,
                "nombre": salon.nombre if salon else None,
                "grado": salon.grado.nombre if salon else None
            }
        })

    # ESTUDIANTE
    if user.groups.filter(name="Estudiante").exists():
        try:
            estudiante = Estudiante.objects.get(
                user=user
            )
        except Estudiante.DoesNotExist:
            return Response({
                "error": "No existe un perfil estudiante asociado."
            }, status=404)
        return Response({

            "id": user.id,
            "username": user.username,
            "rol": "estudiante",

            "nombre_completo":
                f"{estudiante.nombre} {estudiante.apellido}",

            "estudiante": {
                "id": estudiante.id,
                "nombre": estudiante.nombre,
                "apellido": estudiante.apellido,
                "cedula": estudiante.cedula,
                "genero": estudiante.genero
            },

            "salon": {
                "id": estudiante.salon.id,
                "nombre": estudiante.salon.nombre,
                "grado": estudiante.salon.grado.nombre
            }
        })

    return Response({
        "rol": "desconocido"
    })


class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.filter(activo=True)
    serializer_class = EstudianteSerializer

    def get_queryset(self):

        user = self.request.user

        # ADMIN
        if user.is_superuser:
            return Estudiante.objects.all()

        # DOCENTE
        if user.groups.filter(name="Docente").exists():

            docente = Docente.objects.get(
                user=user
            )

            salon = Salon.objects.filter(
                consejero=docente
            ).first()

            if not salon:
                return Estudiante.objects.none()

            return Estudiante.objects.filter(
                salon=salon,
                activo=True
            )

        # ESTUDIANTE
        if user.groups.filter(name="Estudiante").exists():

            return Estudiante.objects.filter(
                user=user,
                activo=True
            )

        return Estudiante.objects.none()


class DocenteViewSet(viewsets.ModelViewSet):
    queryset = Docente.objects.filter(activo=True)
    serializer_class = DocenteSerializer


class SalonViewSet(viewsets.ModelViewSet):
    queryset = Salon.objects.all()
    serializer_class = SalonSerializer

    @action(detail=False, methods=['get'])
    def mi_salon(self, request):

        docente = Docente.objects.get(
            user=request.user
        )

        salon = Salon.objects.get(
            consejero=request.docente
        )

        serializer = self.get_serializer(salon)

        return Response(serializer.data)


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
