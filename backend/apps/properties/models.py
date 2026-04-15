from django.db import models
from django.conf import settings


class Amenity(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'amenities'
        verbose_name_plural = 'amenities'

    def __str__(self):
        return self.name


class Property(models.Model):
    TYPE_CHOICES = [
        ('apartment', 'Appartement'),
        ('house', 'Maison'),
        ('villa', 'Villa'),
        ('studio', 'Studio'),
        ('loft', 'Loft'),
        ('chalet', 'Chalet'),
        ('cabin', 'Cabane'),
        ('beach_house', 'Maison de plage'),
        ('countryside', 'Maison de campagne'),
        ('other', 'Autre'),
    ]

    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=255)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    city = models.CharField(max_length=100)
    address = models.CharField(max_length=500)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    property_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='apartment')
    max_guests = models.PositiveIntegerField(default=2)
    num_bedrooms = models.PositiveIntegerField(default=1)
    num_bathrooms = models.PositiveIntegerField(default=1)
    amenities = models.ManyToManyField(Amenity, through='PropertyAmenity', blank=True)
    MODERATION_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    ]
    is_active = models.BooleanField(default=True)
    moderation_status = models.CharField(
        max_length=10, choices=MODERATION_CHOICES, default='approved'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'properties'
        verbose_name_plural = 'properties'

    def __str__(self):
        return self.title

    @property
    def avg_rating(self):
        from apps.reviews.models import Review
        reviews = Review.objects.filter(property=self)
        if not reviews.exists():
            return None
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)

    @property
    def primary_image(self):
        img = self.images.filter(is_primary=True).first()
        if not img:
            img = self.images.first()
        return img


class PropertyAmenity(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE)

    class Meta:
        db_table = 'property_amenities'
        unique_together = ('property', 'amenity')


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'property_images'

    def __str__(self):
        return f'Image de {self.property.title}'


class Availability(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='availabilities')
    date = models.DateField()
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'availability'
        unique_together = ('property', 'date')
