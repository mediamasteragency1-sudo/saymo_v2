# SAYMO — Plateforme de réservation de logements

Une plateforme de réservation inspirée d'Airbnb avec une innovation clé : un **système de recommandation basé sur un test psychologique**.

## Stack Technique

| Couche | Technologie |
|--------|------------|
| Backend | Django 4.2 + Django REST Framework |
| Auth | JWT (simplejwt) + refresh token |
| BDD | MySQL |
| Frontend | React 18 + Vite + React Router |
| Design | Minimalisme éditorial (Cormorant + Instrument Sans) |

---

## Installation

### Prérequis
- Python 3.10+
- Node.js 18+
- MySQL 8+

### Backend

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos credentials MySQL

# Créer la base de données MySQL
mysql -u root -p -e "CREATE DATABASE saymo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur admin
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

---

## Fonctionnalités

### Phase 1 — MVP ✅
- Authentification JWT (register, login, logout, refresh)
- CRUD logements avec images, équipements, disponibilités
- Système de réservation avec validation des dates
- Profils utilisateur / hôte / admin

### Phase 2 — Social ✅
- Avis vérifiés (après séjour terminé uniquement)
- Favoris
- Notifications automatiques (réservation, confirmation, annulation)

### Phase 3 — Innovation ✅
- **Test psychologique** (10 questions)
- Calcul de profil voyageur (8 types : nature_explorer, urban_luxury, etc.)
- Algorithme de scoring multi-critères (type logement + prix + mots-clés + capacité)
- Top-10 recommandations personnalisées stockées en base

### Phase 4 — Dashboards ✅
- Tableau de bord hôte (stats + gestion réservations)
- Dashboard admin avec analytics Recharts
- Gestion utilisateurs avec changement de rôle

---

## Architecture API

```
POST   /api/auth/register/
POST   /api/auth/login/
GET    /api/properties/?city=&type=&min_price=&max_price=&guests=
POST   /api/bookings/
PUT    /api/bookings/:id/status/
GET    /api/psychology/questions/
POST   /api/psychology/submit/     → profil + recommandations
GET    /api/psychology/recommendations/
```

---

## Variables d'environnement

```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=saymo_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## Profils psychologiques

| Profil | Description |
|--------|-------------|
| `nature_explorer` | Forêts, cabanes, montagne, calme |
| `urban_luxury` | Appartements design, centre-ville, haut de gamme |
| `budget_family` | Maisons spacieuses, jardin, bon rapport qualité/prix |
| `adventure_seeker` | Activités outdoor, mobilité, budget raisonnable |
| `cultural_nomad` | Musées, histoire, centre-ville, café culture |
| `beach_relaxer` | Plage, mer, été, piscine |
| `mountain_retreat` | Chalet, ski, neige, feu de cheminée |
| `city_business` | Wifi, bureau, calme, centre-ville |
