"""
Psychological profile algorithm for SAYMO.

Profiles:
- nature_explorer: loves nature, outdoor, mountains, forests
- urban_luxury: city life, luxury, high budget, design
- budget_family: family travel, budget-conscious, spacious
- adventure_seeker: extreme activities, solo, always moving
- cultural_nomad: culture, history, art, city centers
- beach_relaxer: beach, sea, summer, relaxation
- mountain_retreat: mountains, winter, chalet, cozy
- city_business: work travel, wifi, city, solo
"""


PROFILE_WEIGHTS = {
    # Q1: environment
    1: {
        'a': {'nature_explorer': 3, 'mountain_retreat': 2, 'adventure_seeker': 2},
        'b': {'urban_luxury': 3, 'cultural_nomad': 2, 'city_business': 2},
        'c': {'beach_relaxer': 3},
        'd': {'budget_family': 2, 'nature_explorer': 1},
    },
    # Q2: budget
    2: {
        'a': {'budget_family': 3, 'adventure_seeker': 1},
        'b': {'budget_family': 2, 'nature_explorer': 1, 'beach_relaxer': 1},
        'c': {'cultural_nomad': 2, 'beach_relaxer': 2, 'mountain_retreat': 1},
        'd': {'urban_luxury': 3, 'city_business': 2},
    },
    # Q3: travel style
    3: {
        'a': {'nature_explorer': 3, 'adventure_seeker': 3, 'mountain_retreat': 2},
        'b': {'cultural_nomad': 3, 'urban_luxury': 1},
        'c': {'beach_relaxer': 3, 'urban_luxury': 2},
        'd': {'urban_luxury': 2, 'cultural_nomad': 1},
    },
    # Q4: travel companions
    4: {
        'a': {'adventure_seeker': 2, 'city_business': 2, 'cultural_nomad': 1},
        'b': {'beach_relaxer': 2, 'urban_luxury': 2, 'mountain_retreat': 1},
        'c': {'budget_family': 3},
        'd': {'beach_relaxer': 1, 'nature_explorer': 1, 'mountain_retreat': 1},
    },
    # Q5: property type
    5: {
        'a': {'nature_explorer': 3, 'mountain_retreat': 3},
        'b': {'urban_luxury': 3, 'city_business': 2, 'cultural_nomad': 2},
        'c': {'beach_relaxer': 3, 'urban_luxury': 2},
        'd': {'budget_family': 3},
    },
    # Q6: priority
    6: {
        'a': {'city_business': 3, 'urban_luxury': 1},
        'b': {'budget_family': 2, 'mountain_retreat': 1},
        'c': {'beach_relaxer': 3},
        'd': {'nature_explorer': 3, 'mountain_retreat': 2},
    },
    # Q7: travel pace
    7: {
        'a': {'adventure_seeker': 3, 'nature_explorer': 2},
        'b': {'cultural_nomad': 2, 'beach_relaxer': 1},
        'c': {'beach_relaxer': 3, 'mountain_retreat': 2},
        'd': {'city_business': 3},
    },
    # Q8: season
    8: {
        'a': {'nature_explorer': 2, 'cultural_nomad': 1},
        'b': {'beach_relaxer': 3},
        'c': {'cultural_nomad': 3, 'nature_explorer': 1},
        'd': {'mountain_retreat': 3},
    },
    # Q9: deal-breaker
    9: {
        'a': {'urban_luxury': 2, 'city_business': 2},
        'b': {'nature_explorer': 2, 'mountain_retreat': 2},
        'c': {'city_business': 2, 'urban_luxury': 1},
        'd': {'budget_family': 2, 'beach_relaxer': 1},
    },
    # Q10: dream activity
    10: {
        'a': {'adventure_seeker': 3, 'mountain_retreat': 2, 'nature_explorer': 2},
        'b': {'cultural_nomad': 3, 'urban_luxury': 2},
        'c': {'beach_relaxer': 3, 'adventure_seeker': 1},
        'd': {'budget_family': 3},
    },
}

# Profile to property criteria mapping
PROFILE_CRITERIA = {
    'nature_explorer': {
        'property_types': ['cabin', 'countryside', 'chalet'],
        'keywords': ['nature', 'forêt', 'montagne', 'calme', 'verdure'],
        'max_price': 150,
        'amenities_preferred': ['jardin', 'barbecue', 'parking'],
    },
    'urban_luxury': {
        'property_types': ['apartment', 'loft'],
        'keywords': ['luxe', 'design', 'moderne', 'centre-ville', 'vue'],
        'min_price': 150,
        'amenities_preferred': ['piscine', 'spa', 'climatisation', 'ascenseur'],
    },
    'budget_family': {
        'property_types': ['house', 'villa', 'countryside'],
        'keywords': ['famille', 'spacieux', 'enfants', 'jardin'],
        'max_price': 120,
        'min_guests': 4,
        'amenities_preferred': ['jardin', 'cuisine', 'parking', 'wifi'],
    },
    'adventure_seeker': {
        'property_types': ['cabin', 'chalet', 'countryside'],
        'keywords': ['aventure', 'montagne', 'forêt', 'randonnée'],
        'max_price': 100,
        'amenities_preferred': ['parking', 'wifi'],
    },
    'cultural_nomad': {
        'property_types': ['apartment', 'studio', 'loft'],
        'keywords': ['culture', 'musée', 'historique', 'centre', 'vieux'],
        'max_price': 200,
        'amenities_preferred': ['wifi', 'cuisine'],
    },
    'beach_relaxer': {
        'property_types': ['beach_house', 'villa', 'apartment'],
        'keywords': ['plage', 'mer', 'océan', 'côte', 'bord de mer'],
        'max_price': 250,
        'amenities_preferred': ['piscine', 'terrasse', 'climatisation'],
    },
    'mountain_retreat': {
        'property_types': ['chalet', 'cabin', 'countryside'],
        'keywords': ['montagne', 'ski', 'alpes', 'chalet', 'neige'],
        'max_price': 200,
        'amenities_preferred': ['cheminée', 'jacuzzi', 'sauna'],
    },
    'city_business': {
        'property_types': ['apartment', 'studio', 'loft'],
        'keywords': ['affaires', 'bureau', 'calme', 'moderne'],
        'max_price': 300,
        'amenities_preferred': ['wifi', 'bureau', 'climatisation'],
    },
}


def calculate_profile(answers: dict) -> str:
    """
    Calculate user profile type based on answers.
    answers: {'1': 'a', '2': 'c', ...}
    Returns profile_type string.
    """
    scores = {profile: 0 for profile in PROFILE_CRITERIA.keys()}

    for question_id, answer in answers.items():
        q_id = int(question_id)
        if q_id in PROFILE_WEIGHTS and answer in PROFILE_WEIGHTS[q_id]:
            for profile, weight in PROFILE_WEIGHTS[q_id][answer].items():
                scores[profile] += weight

    return max(scores, key=scores.get)


def calculate_matching_score(property, profile_type: str) -> float:
    """
    Calculate matching score (0-100) between a property and a profile.
    """
    if profile_type not in PROFILE_CRITERIA:
        return 50.0

    criteria = PROFILE_CRITERIA[profile_type]
    score = 0.0

    # Property type match (40 points)
    preferred_types = criteria.get('property_types', [])
    if property.property_type in preferred_types:
        type_rank = preferred_types.index(property.property_type)
        score += 40 - (type_rank * 5)  # First type gets 40, second 35, etc.

    # Price range match (20 points)
    price = float(property.price_per_night)
    min_price = criteria.get('min_price', 0)
    max_price = criteria.get('max_price', 10000)

    if min_price <= price <= max_price:
        score += 20
    elif price < min_price:
        score += 10  # Cheaper than expected — still some match
    else:
        # Too expensive — reduced score
        overshoot_ratio = (price - max_price) / max_price
        score += max(0, 15 - (overshoot_ratio * 30))

    # Keyword match in description/title (25 points)
    keywords = criteria.get('keywords', [])
    text = f"{property.title} {property.description} {property.city}".lower()
    keyword_hits = sum(1 for kw in keywords if kw.lower() in text)
    score += min(25, keyword_hits * 7)

    # Guest capacity (10 points)
    min_guests = criteria.get('min_guests', 1)
    if property.max_guests >= min_guests:
        score += 10

    # Rating bonus (5 points)
    avg_rating = property.avg_rating
    if avg_rating:
        score += (avg_rating / 5) * 5

    return round(min(100.0, score), 2)


def generate_recommendations(user, top_n: int = 10):
    """
    Generate top_n property recommendations for a user based on their profile.
    Returns list of (property, score) tuples sorted by score descending.
    """
    from apps.properties.models import Property
    from .models import Recommendation

    try:
        test = user.psychological_test
        profile_type = test.profile_type
    except Exception:
        return []

    properties = Property.objects.filter(is_active=True).prefetch_related('images', 'amenities')

    scored = []
    for prop in properties:
        score = calculate_matching_score(prop, profile_type)
        if score > 0:
            scored.append((prop, score))

    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[:top_n]

    # Clear old recommendations
    Recommendation.objects.filter(user=user).delete()

    # Save new ones
    recommendations = []
    for prop, score in top:
        rec = Recommendation.objects.create(user=user, property=prop, score=score)
        recommendations.append(rec)

    return recommendations
