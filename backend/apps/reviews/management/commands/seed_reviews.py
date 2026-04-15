import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.properties.models import Property
from apps.bookings.models import Booking
from apps.reviews.models import Review
from apps.notifications.models import Notification

User = get_user_model()

GUESTS = [
    {'name': 'Marie Dupont',    'email': 'marie@example.com'},
    {'name': 'Lucas Bernard',   'email': 'lucas@example.com'},
    {'name': 'Sophie Martin',   'email': 'sophie@example.com'},
    {'name': 'Thomas Leroy',    'email': 'thomas@example.com'},
    {'name': 'Camille Moreau',  'email': 'camille@example.com'},
    {'name': 'Antoine Petit',   'email': 'antoine@example.com'},
]

REVIEWS_DATA = [
    (5, "Sejour absolument magique. L'appartement est encore plus beau qu'en photo, la vue imprenable et l'hote tres attentif. On reviendra sans hesiter !",
        "Merci infiniment pour ce retour chaleureux ! C'etait un plaisir de vous accueillir."),
    (5, "Logement impeccable, propre, bien equipe. Le quartier est calme et tres bien situe. Je recommande vivement.",
        ""),
    (4, "Tres bon sejour dans l'ensemble. Quelques petits details a revoir dans la salle de bain mais rien de grave. L'hote repond rapidement.",
        "Merci pour votre retour constructif, nous avons pris note pour ameliorer la salle de bain."),
    (5, "Un veritable coup de coeur ! La decoration est soignee, le lit confortable et le petit-dejeuner inclus etait delicieux.",
        "Quelle joie de lire ca ! Nous esperons vous revoir bientot."),
    (3, "Sejour correct sans plus. L'emplacement est top mais le logement manque un peu d'entretien. Prix un peu eleve pour ce que c'est.",
        "Merci pour votre honnetet. Nous allons travailler sur l'entretien pour les prochains sejours."),
    (4, "Belle adresse, hote sympathique et disponible. Le logement correspond parfaitement aux photos. Seul bemol : le wifi un peu lent.",
        ""),
    (5, "Sejour parfait du debut a la fin. L'endroit est idyllique, loin du tumulte de la ville. On s'y sent vraiment comme chez soi.",
        "C'est exactement l'effet recherche ! Merci beaucoup pour ce beau message."),
    (4, "Tres bonne experience. L'hote nous a laisse des conseils precieux sur les restaurants du coin. Logement propre et bien agence.",
        "Avec plaisir ! C'est toujours un bonheur de partager nos bonnes adresses."),
    (2, "Deception par rapport aux photos. Le logement etait plus petit et moins bien entretenu qu'annonce. Service correct cependant.",
        "Nous sommes naoles de cette experience. Nous avons mis a jour les photos pour plus de transparence."),
    (5, "Fantastique ! Vue epoustouflante, interieur design et hote au petit soin. L'une des meilleures locations que j'ai faites.",
        ""),
    (4, "Sejour agreable dans un cadre superbe. La piscine etait un vrai plus. Je reviendrais avec plaisir.",
        "Super ! La piscine est effectivement notre petit tresor. A bientot !"),
    (5, "Parfait pour une escapade en famille. Les enfants ont adore, les parents aussi ! Tout etait impeccable.",
        "Merci ! C'est toujours un bonheur d'accueillir des familles heureuses."),
    (3, "Bien situe et propre, mais la literie est a renouveler. Le logement en lui-meme est sympa mais on a eu du mal a dormir.",
        "Merci du retour, nous avons commande un nouveau matelas suite a votre sejour."),
    (5, "Une adresse d'exception. L'hote est raffine, le logement luxueux et les prestations au top. Je recommande les yeux fermes.",
        ""),
    (4, "Tres bon rapport qualite-prix. Logement bien tenu, hote disponible. Quelques travaux de renovation en cours mais ca ne derange pas.",
        "Merci ! Les travaux sont termines depuis votre passage, tout est neuf maintenant."),
]


class Command(BaseCommand):
    help = 'Seed demo reviews with completed bookings'

    def handle(self, *args, **options):
        self.stdout.write('[*] Seeding demo reviews...')

        properties = list(Property.objects.all())
        if not properties:
            self.stdout.write('[!] No properties found. Run seed_properties first.')
            return

        # Create guest users
        guests = []
        for g in GUESTS:
            user, created = User.objects.get_or_create(
                email=g['email'],
                defaults={
                    'name': g['name'],
                    'role': 'user',
                    'is_active': True,
                }
            )
            if created:
                user.set_password('demo1234')
                user.save()
                self.stdout.write(f'[+] Guest: {user.name}')
            guests.append(user)

        # Delete existing demo reviews to allow re-seeding
        Review.objects.filter(user__email__in=[g['email'] for g in GUESTS]).delete()
        Booking.objects.filter(
            user__email__in=[g['email'] for g in GUESTS],
            status='completed'
        ).delete()

        review_pool = list(REVIEWS_DATA)
        random.shuffle(review_pool)
        review_idx = 0

        created_reviews = 0
        today = date.today()

        for prop in properties:
            # 1-2 reviews per property
            num_reviews = random.randint(1, 2)
            selected_guests = random.sample(guests, min(num_reviews, len(guests)))

            for guest in selected_guests:
                nights = random.randint(3, 10)
                end = today - timedelta(days=random.randint(15, 120))
                start = end - timedelta(days=nights)
                total = prop.price_per_night * nights

                booking = Booking.objects.create(
                    user=guest,
                    property=prop,
                    start_date=start,
                    end_date=end,
                    status='completed',
                    total_price=total,
                    guests=random.randint(1, min(prop.max_guests, 4)),
                )

                rating, comment, host_reply = review_pool[review_idx % len(review_pool)]
                review_idx += 1

                Review.objects.create(
                    user=guest,
                    property=prop,
                    booking=booking,
                    rating=rating,
                    comment=comment,
                    host_reply=host_reply,
                )
                created_reviews += 1

                # Notification for property host
                Notification.objects.create(
                    user=prop.host,
                    message=f'Nouvel avis {rating}/5 de {guest.name} pour "{prop.title}"',
                    type='review',
                )

        self.stdout.write(f'[OK] {created_reviews} reviews created across {len(properties)} properties.')

        # Demo notifications for each guest
        for guest in guests:
            bookings = Booking.objects.filter(user=guest, status='completed').order_by('-created_at')[:2]
            for b in bookings:
                Notification.objects.get_or_create(
                    user=guest,
                    message=f'Merci pour votre sejour a "{b.property.title}". Laissez un avis !',
                    type='review',
                    defaults={'is_read': False}
                )

        self.stdout.write('[OK] Done.')
