from django.db import models
from django.conf import settings


class PsychologicalTest(models.Model):
    PROFILE_CHOICES = [
        ('nature_explorer', 'Explorateur Nature'),
        ('urban_luxury', 'Urbain Luxe'),
        ('budget_family', 'Famille Budget'),
        ('adventure_seeker', 'Chercheur d\'Aventures'),
        ('cultural_nomad', 'Nomade Culturel'),
        ('beach_relaxer', 'Détente Plage'),
        ('mountain_retreat', 'Retraite Montagne'),
        ('city_business', 'Business Urbain'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='psychological_test')
    answers = models.JSONField(default=dict)
    profile_type = models.CharField(max_length=30, choices=PROFILE_CHOICES, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'psychological_tests'

    def __str__(self):
        return f'Test de {self.user.name} - Profil: {self.profile_type}'


class Recommendation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='recommendations')
    score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recommendations'
        ordering = ['-score']
        unique_together = ('user', 'property')

    def __str__(self):
        return f'Recommandation {self.user.name} -> {self.property.title} (score: {self.score})'
