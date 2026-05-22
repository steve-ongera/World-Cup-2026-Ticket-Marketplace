from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r"confederations", views.ConfederationViewSet, basename="confederation")
router.register(r"countries", views.CountryViewSet, basename="country")
router.register(r"venues", views.VenueViewSet, basename="venue")
router.register(r"groups", views.GroupViewSet, basename="group")
router.register(r"matches", views.MatchViewSet, basename="match")
router.register(r"listings", views.TicketListingViewSet, basename="listing")
router.register(r"orders", views.OrderViewSet, basename="order")
router.register(r"reviews", views.ReviewViewSet, basename="review")
router.register(r"wishlist", views.WishlistViewSet, basename="wishlist")
router.register(r"price-alerts", views.PriceAlertViewSet, basename="price-alert")

auth_urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("profile/", views.ProfileView.as_view(), name="auth-profile"),
]

urlpatterns = [
    path("auth/", include(auth_urlpatterns)),
    path("users/<uuid:id>/", views.PublicProfileView.as_view(), name="user-public-profile"),
    path("", include(router.urls)),
]