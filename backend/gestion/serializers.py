from rest_framework import serializers
from .models import *


class GradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grado
        fields = '__all__'


class DocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Docente
        fields = '__all__'


class SalonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salon
        fields = '__all__'


class EstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiante
        fields = '__all__'


class MateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materia
        fields = '__all__'


class PeriodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Periodo
        fields = ["id", "nombre"]


class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = [
            "id", "nombre", "fecha", "tipo",
            "puntaje_maximo", "descripcion",
            "materia", "periodo",
        ]


class NotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nota
        fields = ["id", "estudiante", "actividad", "puntos_obtenidos", "nota"]
        
        read_only_fields = ["nota"]


class AsistenciaSerializer(serializers.ModelSerializer):

    estudiante_nombre = serializers.CharField(
        source='estudiante.nombre',
        read_only=True
    )

    class Meta:
        model = Asistencia
        fields = '__all__'
