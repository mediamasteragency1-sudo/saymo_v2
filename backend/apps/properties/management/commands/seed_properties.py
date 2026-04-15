"""
Seed command — crée des hôtes, des logements réalistes avec images Unsplash.
Usage : python manage.py seed_properties
"""
import urllib.request
import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from apps.users.models import User
from apps.properties.models import Property, PropertyImage, Amenity, Availability
from datetime import date, timedelta
import random


# ── Données de seed ──────────────────────────────────────────────────────────

HOSTS = [
    {"name": "Sophie Marceau",   "email": "sophie@saymo.com",  "password": "Host1234!"},
    {"name": "Lucas Bernard",    "email": "lucas@saymo.com",   "password": "Host1234!"},
    {"name": "Camille Durand",   "email": "camille@saymo.com", "password": "Host1234!"},
    {"name": "Antoine Leroy",    "email": "antoine@saymo.com", "password": "Host1234!"},
]

# Images Unsplash par type (photo_id, description)
IMAGES = {
    "villa": [
        ("1613977257363-707ba9348227", "villa-pool"),
        ("1560448204-e02f11c3d0e2", "villa-exterior"),
        ("1571896349842-33c89424de2d", "villa-interior"),
    ],
    "apartment": [
        ("1522708323590-d24dbb6b0267", "apartment-living"),
        ("1555041469-a586c61ea9bc", "apartment-bedroom"),
        ("1556909114-f6e7ad7d3136", "apartment-kitchen"),
    ],
    "chalet": [
        ("1510798831971-661eb04b3739", "chalet-exterior"),
        ("1542718610-a1d656befab2", "chalet-interior"),
        ("1520250497591-112f2f40a3f4", "chalet-view"),
    ],
    "house": [
        ("1570129477492-45c003edd2be", "house-exterior"),
        ("1484154218962-a197022b5858", "house-kitchen"),
        ("1502005229762-cf1b2da7c5d6", "house-bedroom"),
    ],
    "cabin": [
        ("1449158743715-0a90ebb6969e", "cabin-forest"),
        ("1464822759023-fed622ff2c3b", "cabin-interior"),
        ("1506905925346-21bda4d32df4", "cabin-view"),
    ],
    "beach_house": [
        ("1499793983690-e29da59ef1c2", "beach-house"),
        ("1507525428034-b723cf961d3e", "beach-view"),
        ("1505881402582-c5bc11054f91", "beach-pool"),
    ],
    "loft": [
        ("1536437075651-01d6f4dfb44c", "loft-living"),
        ("1524758631624-e2822b8ab125", "loft-bedroom"),
        ("1556909114-f6e7ad7d3136", "loft-kitchen"),
    ],
    "studio": [
        ("1522771739844-6a9136d4b38b", "studio-room"),
        ("1502005229762-cf1b2da7c5d6", "studio-bed"),
        ("1484154218962-a197022b5858", "studio-open"),
    ],
}

PROPERTIES_DATA = [
    {
        "title": "Villa Azur avec piscine privée",
        "description": "Somptueuse villa de luxe avec piscine à débordement et vue panoramique sur la Méditerranée. 3 chambres spacieuses avec terrasses privatives, cuisine équipée haut de gamme, salon lumineux. À 5 minutes à pied des plages de sable fin. Idéal pour familles et groupes d'amis cherchant le grand confort.",
        "price_per_night": 350,
        "city": "Nice",
        "address": "12 Avenue des Palmiers, 06000 Nice",
        "latitude": 43.7102,
        "longitude": 7.2620,
        "property_type": "villa",
        "max_guests": 8,
        "num_bedrooms": 3,
        "num_bathrooms": 2,
        "amenities": ["Piscine", "Wi-Fi", "Climatisation", "Parking", "Terrasse", "Barbecue"],
        "host_idx": 0,
    },
    {
        "title": "Appartement Design au cœur de Paris",
        "description": "Magnifique loft haussmannien entièrement rénové dans le 3e arrondissement. Hauts plafonds, parquet en chevrons, cuisine américaine dernier cri. À deux pas du Marais, musées, restaurants branchés et transports. Parfait pour un séjour culturel et gastronomique dans la capitale.",
        "price_per_night": 185,
        "city": "Paris",
        "address": "28 Rue des Archives, 75003 Paris",
        "latitude": 48.8604,
        "longitude": 2.3539,
        "property_type": "apartment",
        "max_guests": 4,
        "num_bedrooms": 2,
        "num_bathrooms": 1,
        "amenities": ["Wi-Fi", "Cuisine équipée", "TV", "Ascenseur", "Lave-linge"],
        "host_idx": 1,
    },
    {
        "title": "Chalet Montagne vue sur les Alpes",
        "description": "Chalet authentique en bois de mélèze avec cheminée en pierre et vue imprenable sur le Mont-Blanc. Ski aux pieds, spa privatif, sauna finlandais. Cuisine équipée, grande terrasse sud, salon cosy. Le refuge idéal pour les amoureux des sports d'hiver et du grand air alpin.",
        "price_per_night": 290,
        "city": "Chamonix",
        "address": "Route des Praz, 74400 Chamonix",
        "latitude": 45.9237,
        "longitude": 6.8694,
        "property_type": "chalet",
        "max_guests": 10,
        "num_bedrooms": 4,
        "num_bathrooms": 3,
        "amenities": ["Cheminée", "Jacuzzi", "Sauna", "Parking", "Wi-Fi", "Lave-linge"],
        "host_idx": 2,
    },
    {
        "title": "Maison de Charme Provence",
        "description": "Mas provençal du XVIIIe siècle entièrement restauré au milieu des lavandes et des oliviers. Piscine chauffée, grand jardin ombragé, terrasse avec barbecue. 4 chambres décorées avec goût mêlant l'authentique et le moderne. À 15 min d'Aix-en-Provence, marchés, vignobles et villages perchés.",
        "price_per_night": 220,
        "city": "Aix-en-Provence",
        "address": "Chemin des Lavandes, 13100 Aix-en-Provence",
        "latitude": 43.5297,
        "longitude": 5.4474,
        "property_type": "house",
        "max_guests": 8,
        "num_bedrooms": 4,
        "num_bathrooms": 2,
        "amenities": ["Piscine", "Jardin", "Barbecue", "Parking", "Wi-Fi", "Climatisation"],
        "host_idx": 3,
    },
    {
        "title": "Cabane dans les Arbres Dordogne",
        "description": "Insolite et romantique, cette cabane perchée à 7 mètres de hauteur offre une immersion totale dans la forêt périgourdine. Terrasse suspendue, bain nordique étoilé, petit-déjeuner producteur inclus. Accès par passerelle, lit douillet, poêle à bois. Une expérience magique en pleine nature.",
        "price_per_night": 165,
        "city": "Sarlat-la-Canéda",
        "address": "Forêt de Bessède, 24200 Sarlat-la-Canéda",
        "latitude": 44.8897,
        "longitude": 1.2158,
        "property_type": "cabin",
        "max_guests": 2,
        "num_bedrooms": 1,
        "num_bathrooms": 1,
        "amenities": ["Cheminée", "Wi-Fi", "Barbecue"],
        "host_idx": 0,
    },
    {
        "title": "Villa Pieds dans l'Eau Bretagne",
        "description": "Villa contemporaine directement sur la plage de sable blanc avec accès privé à la mer. Panorama océan depuis toutes les pièces, terrasse face aux vagues, cuisine ouverte lumineuse. Idéal pour les familles et les amoureux de surf, voile et randonnées côtières en Bretagne sauvage.",
        "price_per_night": 275,
        "city": "Quiberon",
        "address": "Pointe de Goulvars, 56170 Quiberon",
        "latitude": 47.4834,
        "longitude": -3.1191,
        "property_type": "beach_house",
        "max_guests": 6,
        "num_bedrooms": 3,
        "num_bathrooms": 2,
        "amenities": ["Wi-Fi", "Parking", "Terrasse", "Lave-linge", "TV"],
        "host_idx": 1,
    },
    {
        "title": "Loft Industriel Bordeaux Centre",
        "description": "Ancien entrepôt de 120m² transformé en loft contemporain dans le quartier Chartrons. Double hauteur sous plafond, verrière, mezzanine, cuisine professionnelle. À 5 min à pied de la place du Parlement, des quais et des caves à vins mythiques. Parfait pour les amateurs de gastronomie et de design.",
        "price_per_night": 155,
        "city": "Bordeaux",
        "address": "Quai des Chartrons, 33300 Bordeaux",
        "latitude": 44.8553,
        "longitude": -0.5700,
        "property_type": "loft",
        "max_guests": 4,
        "num_bedrooms": 1,
        "num_bathrooms": 1,
        "amenities": ["Wi-Fi", "Cuisine équipée", "Climatisation", "TV", "Lave-linge", "Bureau"],
        "host_idx": 2,
    },
    {
        "title": "Studio Vue Mer Côte d'Azur",
        "description": "Studio moderne et lumineux en plein cœur de Cannes avec vue dégagée sur la mer. Balcon privatif, lit king-size, kitchenette équipée. À 100m de La Croisette, restaurants, boutiques et plages privées. Idéal pour un city-trip romantique ou un déplacement professionnel festival.",
        "price_per_night": 120,
        "city": "Cannes",
        "address": "15 Boulevard de la Croisette, 06400 Cannes",
        "latitude": 43.5528,
        "longitude": 7.0174,
        "property_type": "studio",
        "max_guests": 2,
        "num_bedrooms": 0,
        "num_bathrooms": 1,
        "amenities": ["Wi-Fi", "Climatisation", "TV", "Coffre-fort"],
        "host_idx": 3,
    },
    {
        "title": "Maison de Famille Pays Basque",
        "description": "Grande maison basque traditionnelle avec vue sur les Pyrénées et à 10 min de Biarritz. 5 chambres, 2 salles de bain, cuisine familiale, grand jardin clos. Cadre exceptionnel entre montagne et océan, idéal pour des vacances en famille ou entre amis. Village typique, marché, pelote basque.",
        "price_per_night": 195,
        "city": "Espelette",
        "address": "Route des Piments, 64250 Espelette",
        "latitude": 43.3511,
        "longitude": -1.4417,
        "property_type": "house",
        "max_guests": 10,
        "num_bedrooms": 5,
        "num_bathrooms": 2,
        "amenities": ["Jardin", "Parking", "Wi-Fi", "Barbecue", "Lave-linge", "TV"],
        "host_idx": 0,
    },
    {
        "title": "Appartement Haussmannien Lyon Presqu'île",
        "description": "Superbe appartement rénové de 80m² au 4e étage avec ascenseur, en plein cœur de la Presqu'île lyonnaise. Parquet, moulures, hauteur sous plafond 3m20. Vue sur les toits, cuisine ouverte, deux chambres calmes. À pied de la Place Bellecour, bouchons lyonnais, Confluence et musées.",
        "price_per_night": 140,
        "city": "Lyon",
        "address": "Rue de la République, 69002 Lyon",
        "latitude": 45.7640,
        "longitude": 4.8357,
        "property_type": "apartment",
        "max_guests": 4,
        "num_bedrooms": 2,
        "num_bathrooms": 1,
        "amenities": ["Wi-Fi", "Cuisine équipée", "Ascenseur", "Lave-linge", "TV"],
        "host_idx": 1,
    },
    {
        "title": "Villa Tropézienne avec Piscine Chauffée",
        "description": "Villa de prestige à Saint-Tropez, nichée dans la végétation méditerranéenne. Piscine chauffée 12x5m, pool-house, 4 suites avec salle de bain privative. Cuisine extérieure, pergola, pétanque. À 5 min en vélo du port et des plages de Pampelonne. Conciergerie disponible 7j/7.",
        "price_per_night": 680,
        "city": "Saint-Tropez",
        "address": "Chemin des Calanques, 83990 Saint-Tropez",
        "latitude": 43.2667,
        "longitude": 6.6404,
        "property_type": "villa",
        "max_guests": 8,
        "num_bedrooms": 4,
        "num_bathrooms": 4,
        "amenities": ["Piscine", "Climatisation", "Wi-Fi", "Parking", "Terrasse", "Barbecue", "Jacuzzi"],
        "host_idx": 2,
    },
    {
        "title": "Chalet Cosy Pyrénées Ski Resort",
        "description": "Chalet traditionnel pyrénéen rénové à 1800m d'altitude, accès direct pistes de ski. 3 chambres, séjour avec poêle à bois, balcon panoramique. Village de Cauterets à 5 min, thermes, cascades et via-ferrata. Location de ski sur place. Ambiance authentique et montagne authentique garantie.",
        "price_per_night": 245,
        "city": "Cauterets",
        "address": "Route du Cirque de Gavarnie, 65110 Cauterets",
        "latitude": 42.8896,
        "longitude": -0.1052,
        "property_type": "chalet",
        "max_guests": 6,
        "num_bedrooms": 3,
        "num_bathrooms": 2,
        "amenities": ["Cheminée", "Parking", "Wi-Fi", "Lave-linge", "TV"],
        "host_idx": 3,
    },
]


class Command(BaseCommand):
    help = 'Seed la base de données avec des logements réalistes + images'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('[*] Creation des hotes...'))
        hosts = []
        for h in HOSTS:
            user, created = User.objects.get_or_create(
                email=h['email'],
                defaults={'name': h['name'], 'role': 'host'}
            )
            if created:
                user.set_password(h['password'])
                user.save()
                self.stdout.write(f'  [+] Hote cree : {h["name"]}')
            else:
                self.stdout.write(f'  [-] Hote existant : {h["name"]}')
            hosts.append(user)

        self.stdout.write(self.style.NOTICE('\n[*] Creation des logements...'))
        amenity_map = {a.name: a for a in Amenity.objects.all()}
        media_root = settings.MEDIA_ROOT
        os.makedirs(os.path.join(media_root, 'properties'), exist_ok=True)

        for i, data in enumerate(PROPERTIES_DATA):
            if Property.objects.filter(title=data['title']).exists():
                self.stdout.write(f'  [-] Existe deja : {data["title"][:40]}')
                continue

            host = hosts[data['host_idx']]
            prop = Property.objects.create(
                host=host,
                title=data['title'],
                description=data['description'],
                price_per_night=data['price_per_night'],
                city=data['city'],
                address=data['address'],
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                property_type=data['property_type'],
                max_guests=data['max_guests'],
                num_bedrooms=data['num_bedrooms'],
                num_bathrooms=data['num_bathrooms'],
                is_active=True,
            )

            # Amenities
            for a_name in data.get('amenities', []):
                if a_name in amenity_map:
                    prop.amenities.add(amenity_map[a_name])

            # Images
            img_list = IMAGES.get(data['property_type'], IMAGES['apartment'])
            for j, (photo_id, slug) in enumerate(img_list):
                try:
                    url = f"https://images.unsplash.com/photo-{photo_id}?w=800&q=75&fit=crop"
                    filename = f"{slug}-{prop.id}-{j}.jpg"
                    filepath = os.path.join(media_root, 'properties', filename)

                    if not os.path.exists(filepath):
                        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req, timeout=10) as response:
                            img_data = response.read()
                        with open(filepath, 'wb') as f:
                            f.write(img_data)

                    prop_img = PropertyImage(
                        property=prop,
                        is_primary=(j == 0)
                    )
                    prop_img.image.name = f'properties/{filename}'
                    prop_img.save()
                    self.stdout.write(f'    [img] Image {j+1} OK')
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'    [!] Image {j+1} echouee : {e}'))

            # Disponibilités — 90 jours disponibles
            today = date.today()
            for day_offset in range(1, 91):
                d = today + timedelta(days=day_offset)
                Availability.objects.get_or_create(property=prop, date=d, defaults={'is_available': True})

            self.stdout.write(self.style.SUCCESS(f'  [OK] {prop.title[:50]} ({prop.city})'))

        total = Property.objects.count()
        self.stdout.write(self.style.SUCCESS(f'\n[OK] Termine -- {total} logements en base de donnees.'))
