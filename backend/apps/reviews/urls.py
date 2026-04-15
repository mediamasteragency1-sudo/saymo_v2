from django.urls import path
from . import views

urlpatterns = [
    path('', views.reviews_list, name='reviews-list'),
    path('<int:pk>/reply/', views.review_reply, name='review-reply'),
]
