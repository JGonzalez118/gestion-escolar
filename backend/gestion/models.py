from django.db import models
from django.contrib.auth.models import User

# ** Modelo para el grado
class Grado(models.Model):
    nombre = models.CharField(max_length=50)

# ** Modelo para los docentes
class Docente(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True) #? Relacionando el docente a la tabla usuarios de django
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    cedula = models.CharField(max_length=50)
    telefono = models.BigIntegerField()
    activo = models.BooleanField(default=True) #! estado para el soft delete

# ** Modelo para los salones
class Salon(models.Model):
    nombre = models.CharField(max_length=100)

    #! referencias al grado del salon y su consejero
    grado = models.ForeignKey(Grado, on_delete=models.CASCADE)
    consejero = models.ForeignKey(Docente, on_delete=models.CASCADE)

# ** Modelo para los estudiantes
class Estudiante(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    cedula = models.CharField(max_length=50)
    genero = models.CharField(max_length=5)
    fecha_nacimiento = models.DateField()
    salon = models.ForeignKey(Salon, on_delete=models.CASCADE) #! referencia al salon que pertence
    activo = models.BooleanField(default=True) #! estado para soft delete

# ** Modelo para las materias
class Materia(models.Model):
    nombre = models.CharField(max_length=100)
    docente = models.ForeignKey(Docente, on_delete=models.CASCADE) #! referencia al docente que da la materia

# ** Modelo para los trimestres
class Periodo(models.Model):
    nombre = models.CharField(max_length=100)

# ** Modelo para las actividades a calificar
class Actividad(models.Model):
    nombre = models.CharField(max_length=100)
    fecha = models.DateField()

    #! referencia a la materia de la actividad y el trimestre en que se realiza
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE)
    periodo = models.ForeignKey(Periodo, on_delete=models.CASCADE)

# ** Modelo para las calificaciones
class Nota(models.Model):
    #! referencia al estudiante y la actividad realizada
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE)
    nota = models.FloatField()

# ** Modelo para la toma de asistencia
class Asistencia(models.Model):
    ESTADOS = [
        ('P', 'Presente'),
        ('A', 'Ausente'),
        ('T', 'Tarde'),
        ('E', 'Excusa')
    ]

    #! referencia al estudiante
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    #! referencia a la materia que va a asistir
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE)

    fecha = models.DateField()
    estado = models.CharField(max_length=1, choices=ESTADOS)