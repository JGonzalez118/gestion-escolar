from django.db.models import Count
from gestion.models import Materia, Grado  # ajusta "tuapp" al nombre real

print("Total de materias:", Materia.objects.count())
print("Total de grados:", Grado.objects.count())

duplicados = (
    Materia.objects.values('nombre', 'grado')
    .annotate(total=Count('id'))
    .filter(total__gt=1)
)

print("Combinaciones nombre+grado duplicadas:")
print(list(duplicados))
