from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Min, Count, Q, Avg
from django.contrib.auth import authenticate
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    User, Confederation, Country, Venue, Group,
    Match, TicketListing, Order, Review, Wishlist, PriceAlert
)
from .serializers import (
    UserPublicSerializer, UserRegisterSerializer, UserProfileSerializer,
    ConfederationSerializer, CountrySerializer, VenueSerializer, GroupSerializer,
    MatchListSerializer, MatchDetailSerializer,
    TicketListingSerializer, TicketListingCreateSerializer,
    OrderSerializer, OrderStatusUpdateSerializer,
    ReviewSerializer, WishlistSerializer, PriceAlertSerializer,
    MarketplaceSummarySerializer,
)
from .permissions import IsSeller, IsOwnerOrReadOnly
from .pagination import StandardResultsPagination


# ─────────────────────────────────────────
#  Auth
# ─────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — Create a new user account."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    """POST /api/auth/login/ — Obtain JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, username=email, password=password)

        if not user:
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            }
        )


class LogoutView(generics.GenericAPIView):
    """POST /api/auth/logout/ — Blacklist refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully."})
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/ — View or update own profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class PublicProfileView(generics.RetrieveAPIView):
    """GET /api/users/<id>/ — View public seller profile."""
    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"


# ─────────────────────────────────────────
#  Reference Data (read-only)
# ─────────────────────────────────────────

class ConfederationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Confederation.objects.all()
    serializer_class = ConfederationSerializer
    permission_classes = [AllowAny]


class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.select_related("confederation").all()
    serializer_class = CountrySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["is_host", "is_qualified", "confederation__code"]
    search_fields = ["name", "code"]

    @action(detail=False, methods=["get"], url_path="hosts")
    def hosts(self, request):
        qs = self.get_queryset().filter(is_host=True)
        return Response(CountrySerializer(qs, many=True).data)


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["country", "city"]
    search_fields = ["name", "city"]


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Group.objects.prefetch_related(
        "memberships__country__confederation"
    ).all()
    serializer_class = GroupSerializer
    permission_classes = [AllowAny]


# ─────────────────────────────────────────
#  Matches
# ─────────────────────────────────────────

class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    list:   GET /api/matches/
    detail: GET /api/matches/<id>/
    """
    queryset = Match.objects.select_related(
        "home_team__confederation", "away_team__confederation",
        "venue", "group"
    ).annotate(
        listing_count=Count("listings", filter=Q(listings__status="active")),
        min_listing_price=Min("listings__price_per_ticket", filter=Q(listings__status="active")),
    )
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["stage", "venue__city", "venue__country", "group__name"]
    search_fields = [
        "home_team__name", "away_team__name",
        "home_team_placeholder", "away_team_placeholder",
        "match_number", "venue__name", "venue__city",
    ]
    ordering_fields = ["match_date", "min_listing_price"]
    ordering = ["match_date"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MatchDetailSerializer
        return MatchListSerializer

    @action(detail=False, methods=["get"], url_path="by-stage/(?P<stage>[^/.]+)")
    def by_stage(self, request, stage=None):
        qs = self.get_queryset().filter(stage=stage)
        serializer = MatchListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="by-group/(?P<group>[A-L])")
    def by_group(self, request, group=None):
        qs = self.get_queryset().filter(group__name=group)
        serializer = MatchListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        from django.utils import timezone
        qs = self.get_queryset().filter(match_date__gte=timezone.now()).order_by("match_date")[:10]
        return Response(MatchListSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        from django.db.models import Min
        total_listings = TicketListing.objects.filter(status="active").count()
        total_matches = Match.objects.count()
        min_group = TicketListing.objects.filter(
            status="active", match__stage="group"
        ).aggregate(m=Min("price_per_ticket"))["m"]
        min_final = TicketListing.objects.filter(
            status="active", match__stage="final"
        ).aggregate(m=Min("price_per_ticket"))["m"]
        top_matches = Match.objects.annotate(
            lc=Count("listings", filter=Q(listings__status="active"))
        ).order_by("-lc")[:6]

        return Response(
            {
                "total_listings": total_listings,
                "total_matches": total_matches,
                "min_group_price": min_group,
                "min_final_price": min_final,
                "top_matches": MatchListSerializer(
                    top_matches, many=True, context={"request": request}
                ).data,
            }
        )


# ─────────────────────────────────────────
#  Ticket Listings
# ─────────────────────────────────────────

class TicketListingViewSet(viewsets.ModelViewSet):
    """
    list:    GET  /api/listings/
    create:  POST /api/listings/
    detail:  GET  /api/listings/<id>/
    update:  PUT  /api/listings/<id>/
    destroy: DEL  /api/listings/<id>/
    """
    queryset = TicketListing.objects.select_related(
        "seller", "match__home_team", "match__away_team", "match__venue"
    ).filter(status="active")
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = [
        "category", "currency", "match__stage",
        "match__venue__city", "match__venue__country",
    ]
    ordering_fields = ["price_per_ticket", "created_at", "quantity"]
    ordering = ["price_per_ticket"]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TicketListingCreateSerializer
        return TicketListingSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [IsAuthenticated()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [AllowAny()]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        qs = TicketListing.objects.filter(seller=request.user).select_related(
            "match__home_team", "match__away_team", "match__venue"
        )
        serializer = TicketListingSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


# ─────────────────────────────────────────
#  Orders
# ─────────────────────────────────────────

class OrderViewSet(viewsets.ModelViewSet):
    """
    list:   GET /api/orders/
    create: POST /api/orders/
    detail: GET /api/orders/<id>/
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user).select_related(
            "listing__match__home_team",
            "listing__match__away_team",
            "listing__match__venue",
            "listing__seller",
        )

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return OrderStatusUpdateSerializer
        return OrderSerializer

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status not in ["pending", "payment_processing"]:
            return Response(
                {"detail": "Cannot cancel an order in this state."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = "cancelled"
        order.save()
        return Response({"detail": "Order cancelled."})


# ─────────────────────────────────────────
#  Reviews
# ─────────────────────────────────────────

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related("reviewer", "reviewed_user").all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["reviewed_user", "rating"]

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwnerOrReadOnly()]
        return [AllowAny()]


# ─────────────────────────────────────────
#  Wishlist
# ─────────────────────────────────────────

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related(
            "match__home_team", "match__away_team", "match__venue"
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["delete"], url_path="match/(?P<match_id>[^/.]+)")
    def remove_by_match(self, request, match_id=None):
        Wishlist.objects.filter(user=request.user, match_id=match_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
#  Price Alerts
# ─────────────────────────────────────────

class PriceAlertViewSet(viewsets.ModelViewSet):
    serializer_class = PriceAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PriceAlert.objects.filter(user=self.request.user).select_related(
            "match__home_team", "match__away_team", "match__venue"
        )