from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'estudiantes', EstudianteViewSet)
router.register(r'docentes', DocenteViewSet)
router.register(r'materias', MateriaViewSet)
router.register(r'actividades', ActividadViewSet)
router.register(r'notas', NotaViewSet)
router.register(r'asistencia', AsistenciaViewSet)
router.register(r'grados', GradoViewSet)
router.register(r'periodos', PeriodoViewSet)
router.register(r'salones', SalonViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('perfil/', perfil),
]