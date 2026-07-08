from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Avg
from .models import *
from .serializers import *
from .calendario import *

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

    @action(detail=False, methods=['get'])
    def mi_salon(self, request):

        user = request.user

        if not user.groups.filter(name="Docente").exists():
            return Response([])

        docente = Docente.objects.get(
            user=user
        )

        salon = Salon.objects.filter(
            consejero=docente
        ).first()

        if not salon:
            return Response([])

        estudiantes = Estudiante.objects.filter(
            salon=salon,
            activo=True
        )

        serializer = EstudianteSerializer(
            estudiantes,
            many=True
        )

        return Response(serializer.data)


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
            consejero=docente
        )

        serializer = self.get_serializer(salon)

        return Response(serializer.data)


class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.all()
    serializer_class = MateriaSerializer

    def get_queryset(self):

        user = self.request.user

        # ADMIN
        if user.is_superuser:
            return Materia.objects.all()

        # DOCENTE
        if user.groups.filter(name="Docente").exists():

            docente = Docente.objects.get(
                user=user
            )

            salon = Salon.objects.filter(
                consejero=docente
            ).first()

            if not salon:
                return Materia.objects.none()

            return Materia.objects.filter(
                grado=salon.grado
            )

        # ESTUDIANTE
        if user.groups.filter(name="Estudiante").exists():

            estudiante = Estudiante.objects.get(
                user=user
            )

            return Materia.objects.filter(
                grado=estudiante.salon.grado
            )

        return Materia.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EsDocente()]

        return [IsAuthenticated()]


class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer

    def get_queryset(self):

        user = self.request.user

        # ADMIN
        if user.is_superuser:
            return Actividad.objects.all()

        # DOCENTE
        if user.groups.filter(name="Docente").exists():

            docente = Docente.objects.get(
                user=user
            )

            salon = Salon.objects.filter(
                consejero=docente
            ).first()

            if not salon:
                return Actividad.objects.none()

            return Actividad.objects.filter(
                materia__grado=salon.grado
            )

        # ESTUDIANTE
        if user.groups.filter(name="Estudiante").exists():

            estudiante = Estudiante.objects.get(
                user=user
            )

            return Actividad.objects.filter(
                materia__grado=estudiante.salon.grado
            )

        return Actividad.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EsDocente()]

        return [IsAuthenticated()]


class NotaViewSet(viewsets.ModelViewSet):
    queryset = Nota.objects.all()
    serializer_class = NotaSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Nota.objects.all()

        if user.groups.filter(name="Docente").exists():
            docente = Docente.objects.get(user=user)
            salon = Salon.objects.filter(consejero=docente).first()

            if not salon:
                return Nota.objects.none()

            return Nota.objects.filter(estudiante__salon=salon)

        if user.groups.filter(name="Estudiante").exists():
            return Nota.objects.filter(estudiante__user=user)

        return Nota.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EsDocente()]

        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        estudiante_id = request.data.get("estudiante")
        actividad_id = request.data.get("actividad")
        puntos = request.data.get("puntos_obtenidos")

        try:
            actividad = Actividad.objects.get(id=actividad_id)
        except Actividad.DoesNotExist:
            return Response({"detail": "Actividad no encontrada."}, status=404)

        try:
            puntos = float(puntos)
        except (TypeError, ValueError):
            return Response({"detail": "puntos_obtenidos debe ser un número."}, status=400)

        if actividad.puntaje_maximo <= 0:
            return Response({"detail": "La actividad no tiene un puntaje máximo válido."}, status=400)

        nota_calculada = (puntos / actividad.puntaje_maximo) * 5
        nota_calculada = round(max(0, min(5, nota_calculada)), 1)

        nota, creada = Nota.objects.update_or_create(
            estudiante_id=estudiante_id,
            actividad_id=actividad_id,
            defaults={
                "puntos_obtenidos": puntos,
                "nota": nota_calculada,
            },
        )

        serializer = self.get_serializer(nota)
        status_code = 201 if creada else 200
        return Response(serializer.data, status=status_code)

    @action(detail=False, methods=['get'])
    def boletin(self, request):
        periodo_id = request.query_params.get('periodo')

        if not periodo_id:
            return Response({"detail": "Debe especificar un periodo."}, status=400)

        user = request.user

        # Determina estudiantes y materias visibles según el rol, mismo patrón que en otras vistas
        if user.is_superuser:
            estudiantes_qs = Estudiante.objects.filter(activo=True)
            materias_qs = Materia.objects.all()

        elif user.groups.filter(name="Docente").exists():
            docente = Docente.objects.get(user=user)
            salon = Salon.objects.filter(consejero=docente).first()

            if not salon:
                return Response([])

            estudiantes_qs = Estudiante.objects.filter(
                salon=salon, activo=True)
            materias_qs = Materia.objects.filter(grado=salon.grado)

        elif user.groups.filter(name="Estudiante").exists():
            estudiante = Estudiante.objects.get(user=user)
            estudiantes_qs = Estudiante.objects.filter(id=estudiante.id)
            materias_qs = Materia.objects.filter(grado=estudiante.salon.grado)

        else:
            return Response([])

        materias_list = list(materias_qs.order_by(
            'nombre').values('id', 'nombre'))

        notas_agrupadas = (
            Nota.objects.filter(
                actividad__periodo_id=periodo_id,
                estudiante__in=estudiantes_qs,
            )
            .values('estudiante_id', 'actividad__materia_id')
            .annotate(promedio=Avg('nota'))
        )

        mapa_promedios = {
            (row['estudiante_id'], row['actividad__materia_id']): round(row['promedio'], 2)
            for row in notas_agrupadas
        }

        resultado = []

        for est in estudiantes_qs.order_by('apellido', 'nombre'):
            materias_data = []
            promedios_validos = []

            for materia in materias_list:
                promedio = mapa_promedios.get((est.id, materia['id']))
                materias_data.append({
                    "materia_id": materia['id'],
                    "materia_nombre": materia['nombre'],
                    "promedio": promedio,
                })
                if promedio is not None:
                    promedios_validos.append(promedio)

            promedio_final = (
                round(sum(promedios_validos) / len(promedios_validos), 2)
                if promedios_validos else None
            )

            resultado.append({
                "estudiante_id": est.id,
                "nombre": est.nombre,
                "apellido": est.apellido,
                "materias": materias_data,
                "promedio_final": promedio_final,
            })

        return Response(resultado)


class AsistenciaViewSet(viewsets.ModelViewSet):
    queryset = Asistencia.objects.all()
    serializer_class = AsistenciaSerializer

    def create(self, request, *args, **kwargs):
        estudiante_id = request.data.get("estudiante")
        materia_id = request.data.get("materia")
        fecha = request.data.get("fecha")
        estado = request.data.get("estado")

        asistencia, creada = Asistencia.objects.update_or_create(
            estudiante_id=estudiante_id,
            materia_id=materia_id,
            fecha=fecha,
            defaults={"estado": estado},
        )

        serializer = self.get_serializer(asistencia)
        status_code = 201 if creada else 200
        return Response(serializer.data, status=status_code)


class GradoViewSet(viewsets.ModelViewSet):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer


class PeriodoViewSet(viewsets.ModelViewSet):
    queryset = Periodo.objects.all()
    serializer_class = PeriodoSerializer

    @action(detail=False, methods=["get"])
    def actual(self, request):
        nombre = obtener_nombre_periodo_actual()

        if nombre is None:
            return Response(
                {"detail": "No hay un trimestre activo para la fecha actual (receso o fuera del año lectivo)."},
                status=404
            )

        periodo = Periodo.objects.filter(nombre=nombre).first()

        if periodo is None:
            return Response(
                {"detail": f"El trimestre '{nombre}' aún no ha sido creado en la base de datos."},
                status=404
            )

        serializer = self.get_serializer(periodo)
        return Response(serializer.data)
