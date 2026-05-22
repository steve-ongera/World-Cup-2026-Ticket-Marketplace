#  World Cup 2026 Ticket Marketplace

A full-stack ticket resale marketplace for FIFA World Cup 2026, inspired by Ticombo. Built with **Django REST Framework** (backend) and **React + Bootstrap** (frontend).

---

##  Project Structure

```
worldcup2026/
├── backend/
│   ├── config/                        # Django project config
│   │   ├── __init__.py
│   │   ├── settings.py                # All settings (dev + prod toggles)
│   │   ├── urls.py                    # Root URL config
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── core/                          # Single core Django application
│   │   ├── migrations/
│   │   │   └── __init__.py
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                  # All models
│   │   ├── serializers.py             # All DRF serializers
│   │   ├── views.py                   # All API views + viewsets
│   │   ├── urls.py                    # App-level URL patterns
│   │   ├── permissions.py             # Custom permissions
│   │   ├── filters.py                 # django-filter filtersets
│   │   ├── pagination.py              # Custom pagination classes
│   │   └── signals.py                 # Post-save signals (price alerts, etc.)
│   │
│   ├── media/                         # Uploaded files (avatars, flags, venues)
│   ├── static/
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   ├── index.html                 # Root HTML — SEO meta, Bootstrap Icons CDN
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── main.jsx                   # React DOM entry point
│   │   ├── App.jsx                    # Router, layout, global context
│   │   │
│   │   ├── utils/
│   │   │   ├── api.js                 # Axios instance + all API calls
│   │   │   ├── auth.js                # Token storage helpers
│   │   │   └── formatters.js          # Price, date, flag emoji helpers
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Current user, login/logout
│   │   │   └── CartContext.jsx        # Selected listing state
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx         # Top nav with search + auth buttons
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Sidebar.jsx        # Filter sidebar for match list
│   │   │   │
│   │   │   ├── match/
│   │   │   │   ├── MatchCard.jsx      # Card shown in grid (date, teams, price)
│   │   │   │   ├── MatchFilters.jsx   # Stage / group / date / team filters
│   │   │   │   └── MatchBadge.jsx     # Stage label chip
│   │   │   │
│   │   │   ├── ticket/
│   │   │   │   ├── ListingCard.jsx    # Single seller listing row
│   │   │   │   ├── ListingForm.jsx    # Create / edit a listing
│   │   │   │   └── CategoryBadge.jsx  # Behind Goal / VIP / etc.
│   │   │   │
│   │   │   ├── order/
│   │   │   │   ├── OrderSummary.jsx   # Checkout total breakdown
│   │   │   │   └── OrderStatusBadge.jsx
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   └── SellerBadge.jsx    # Verified seller chip
│   │   │   │
│   │   │   └── common/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── ErrorAlert.jsx
│   │   │       ├── PriceTag.jsx
│   │   │       └── CountryFlag.jsx
│   │   │
│   │   └── pages/
│   │       ├── HomePage.jsx           # Hero + featured matches + price table
│   │       ├── MatchListPage.jsx      # Filterable grid of all 104 matches
│   │       ├── MatchDetailPage.jsx    # Match info + all active listings
│   │       ├── CheckoutPage.jsx       # Confirm quantity → place order
│   │       ├── OrderConfirmPage.jsx   # Post-purchase confirmation
│   │       ├── SellTicketsPage.jsx    # Create listing form
│   │       ├── DashboardPage.jsx      # Buyer orders + seller listings
│   │       ├── ProfilePage.jsx        # Edit profile + reviews received
│   │       ├── WishlistPage.jsx       # Saved matches
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       └── NotFoundPage.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

##  Backend — Django REST Framework

### Models (`core/models.py`)

| Model | Purpose |
|---|---|
| `User` | Extended AbstractUser — UUID PK, phone, country, verified seller flag |
| `Confederation` | FIFA confederations (UEFA, CONMEBOL, AFC, CAF, CONCACAF, OFC) |
| `Country` | All 48 qualified nations — flag emoji, ISO code, host flag |
| `Venue` | 16 stadiums across USA, Canada & Mexico |
| `Group` | Groups A–L (12 groups for the expanded 48-team format) |
| `GroupMembership` | M2M link between Country and Group |
| `Match` | All 104 matches — stage, teams, venue, date, sold-out flag |
| `TicketListing` | Seller listings — category, quantity, price, section/row/seat |
| `Order` | Buyer purchases — unit price, service fee, FIFA ticketing email |
| `Review` | Post-completion buyer review of seller (1–5 stars) |
| `Wishlist` | User saved matches |
| `PriceAlert` | Notify user when a match drops below max price |

### Serializers (`core/serializers.py`)

| Serializer | Notes |
|---|---|
| `UserRegisterSerializer` | Password confirm + hashing |
| `UserPublicSerializer` | Read-only public profile — avg rating, review count |
| `UserProfileSerializer` | Authenticated user — editable fields |
| `ConfederationSerializer` | |
| `CountrySerializer` | Nested confederation |
| `VenueSerializer` | Full stadium info |
| `GroupSerializer` | Returns country list via method field |
| `MatchListSerializer` | Lightweight — min price + available ticket count |
| `MatchDetailSerializer` | Extends list — includes active listings |
| `TicketListingSerializer` | Full listing + nested seller |
| `TicketListingCreateSerializer` | Write-only for sellers |
| `OrderSerializer` | Auto-computes unit price, fee, total from listing |
| `OrderStatusUpdateSerializer` | Staff/seller status transitions |
| `ReviewSerializer` | Validates completed order ownership |
| `WishlistSerializer` | |
| `PriceAlertSerializer` | |
| `MarketplaceSummarySerializer` | Stats endpoint — counts, min prices, hot matches |

### Views (`core/views.py`)

| ViewSet / View | Endpoint | Auth |
|---|---|---|
| `RegisterView` | `POST /api/auth/register/` | Public |
| `LoginView` | `POST /api/auth/login/` | Public |
| `LogoutView` | `POST /api/auth/logout/` | Auth |
| `ProfileView` | `GET/PUT /api/auth/profile/` | Auth |
| `ConfederationViewSet` | `GET /api/confederations/` | Public |
| `CountryViewSet` | `GET /api/countries/` | Public |
| `VenueViewSet` | `GET /api/venues/` | Public |
| `GroupViewSet` | `GET /api/groups/` | Public |
| `MatchViewSet` | `GET /api/matches/` `GET /api/matches/{id}/` | Public |
| `TicketListingViewSet` | `GET/POST /api/listings/` `PUT/DELETE /api/listings/{id}/` | Mixed |
| `OrderViewSet` | `GET/POST /api/orders/` | Auth |
| `ReviewViewSet` | `POST /api/reviews/` | Auth |
| `WishlistViewSet` | `GET/POST/DELETE /api/wishlist/` | Auth |
| `PriceAlertViewSet` | `GET/POST/DELETE /api/alerts/` | Auth |
| `MarketplaceSummaryView` | `GET /api/summary/` | Public |

### URL Structure

```
config/urls.py
└── /api/  →  core/urls.py
    ├── auth/register/
    ├── auth/login/
    ├── auth/logout/
    ├── auth/profile/
    ├── confederations/
    ├── countries/
    ├── venues/
    ├── groups/
    ├── matches/
    ├── listings/
    ├── orders/
    ├── reviews/
    ├── wishlist/
    ├── alerts/
    └── summary/
```

### Key Settings (`config/settings.py`)

```python
INSTALLED_APPS = [
    ...
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "core",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardResultsPagination",
    "PAGE_SIZE": 20,
}
```

---

##  Frontend — React + Vite + Bootstrap

### `public/index.html`
- Bootstrap 5 CSS + JS via CDN
- Bootstrap Icons via CDN
- Open Graph + Twitter Card meta tags for SEO
- Canonical URL tag
- `<div id="root">` mount point

### `src/main.jsx`
React 18 `createRoot` entry — wraps `<App />` in `<AuthProvider>` and `<CartProvider>`.

### `src/App.jsx`
React Router v6 `<Routes>` — all page routes, protected route wrapper for auth-required pages, persistent `<Navbar>` and `<Footer>`.

### `src/utils/api.js`
Axios instance configured with:
- `baseURL` from `VITE_API_BASE_URL` env variable
- Request interceptor — attaches JWT `Authorization: Bearer <token>` header
- Response interceptor — handles 401 (token refresh or redirect to login)
- Named exports for every API call grouped by resource:
  - `authApi` — register, login, logout, profile
  - `matchesApi` — list (with filters), detail
  - `listingsApi` — list, create, update, delete
  - `ordersApi` — list, create, update status
  - `wishlistApi` — list, add, remove
  - `alertsApi` — list, create, delete
  - `summaryApi` — marketplace stats

---

##  Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # fill in SECRET_KEY, DB settings

python manage.py migrate
python manage.py loaddata fixtures/venues.json
python manage.py loaddata fixtures/countries.json
python manage.py loaddata fixtures/matches.json
python manage.py createsuperuser
python manage.py runserver
```

API available at: `http://localhost:8000/api/`
Admin panel: `http://localhost:8000/admin/`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env              # set VITE_API_BASE_URL=http://localhost:8000

npm run dev
```

App available at: `http://localhost:5173/`

### Docker (Full Stack)

```bash
docker-compose up --build
```

---

##  Backend Dependencies (`requirements.txt`)

```
Django>=4.2
djangorestframework>=3.15
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
django-filter>=23.5
Pillow>=10.0
psycopg2-binary>=2.9       # PostgreSQL
python-dotenv>=1.0
gunicorn>=21.0
```

##  Frontend Dependencies (`package.json`)

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "axios": "^1.6"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4"
  }
}
```

---

##  UI Features (Ticombo Clone)

- **Homepage** — Hero banner with 2026 branding, ticket availability by stage, price range table (Group from €168 → Final from €7,735)
- **Match List** — Filterable grid cards showing team flags, venue, date, ticket count, starting price + BUY button
- **Match Detail** — Full listing table with seller rating, category, section, row, early delivery badge
- **Checkout** — Quantity selector → order summary → FIFA ticketing email input → confirm
- **Sell Tickets** — Form to list tickets with match selector, category, price, section/seat details
- **Dashboard** — Tabbed view: My Orders / My Listings / Wishlist / Price Alerts
- **Stage navigation** — Quick-jump to Final, Semi Finals, Quarter Finals, Round of 32, Group Stage, individual groups A–L

---

##  Authentication

JWT-based via `djangorestframework-simplejwt`:
- Access token: 60-minute lifetime
- Refresh token: 7-day lifetime
- Stored in `localStorage` on the frontend
- Auto-refresh on 401 response via Axios interceptor

---

## Tournament Data

- **48 teams**, **12 groups** (A–L), **104 matches**
- **16 host cities** across USA (11 stadiums), Mexico (3), Canada (2)
- Match stages: Group → Round of 32 → Round of 16 → Quarter Finals → Semi Finals → Bronze Final → Final
- Final: **19 July 2026**, MetLife Stadium (New York/New Jersey)

---

## Roadmap

- [ ] Stripe payment integration
- [ ] Real-time price updates via WebSockets
- [ ] Email notifications for price alerts
- [ ] Admin fixture data management CLI
- [ ] i18n support (EN / ES / FR)
- [ ] Mobile app (React Native)