from django.urls import path
from . import views

urlpatterns = [
    path('', views.favorites_list, name='favorites-list'),
    path('<int:pk>/', views.favorite_delete, name='favorite-delete'),
]
