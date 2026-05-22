from rest_framework import serializers
from django.db.models import Min, Count
from .models import (
    User, Confederation, Country, Venue, Group, GroupMembership,
    Match, TicketListing, Order, Review, Wishlist, PriceAlert
)


# ─────────────────────────────────────────
#  Auth / User
# ─────────────────────────────────────────

class UserPublicSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "avatar", "is_verified_seller",
            "average_rating", "total_reviews", "created_at",
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews_received.all()
        if not reviews.exists():
            return None
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)

    def get_total_reviews(self, obj):
        return obj.reviews_received.count()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "username", "password", "password_confirm", "phone", "country"]

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "username", "phone", "country",
            "avatar", "is_verified_seller", "created_at",
        ]
        read_only_fields = ["id", "email", "is_verified_seller", "created_at"]


# ─────────────────────────────────────────
#  Reference Data
# ─────────────────────────────────────────

class ConfederationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confederation
        fields = ["id", "name", "code"]


class CountrySerializer(serializers.ModelSerializer):
    confederation = ConfederationSerializer(read_only=True)

    class Meta:
        model = Country
        fields = [
            "id", "name", "code", "flag_emoji", "flag_image",
            "confederation", "is_host", "is_qualified",
        ]


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = [
            "id", "name", "city", "country", "capacity",
            "latitude", "longitude", "image", "slug",
        ]


class GroupSerializer(serializers.ModelSerializer):
    countries = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ["id", "name", "countries"]

    def get_countries(self, obj):
        memberships = obj.memberships.select_related("country__confederation").all()
        return CountrySerializer([m.country for m in memberships], many=True).data


# ─────────────────────────────────────────
#  Match
# ─────────────────────────────────────────

class MatchListSerializer(serializers.ModelSerializer):
    home_team = CountrySerializer(read_only=True)
    away_team = CountrySerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    group = serializers.StringRelatedField()
    min_price = serializers.SerializerMethodField()
    available_tickets = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = Match
        fields = [
            "id", "match_number", "stage", "group",
            "home_team", "away_team",
            "home_team_placeholder", "away_team_placeholder",
            "display_name", "venue", "match_date",
            "is_sold_out", "min_price", "available_tickets",
        ]

    def get_min_price(self, obj):
        result = obj.listings.filter(status="active").aggregate(min_price=Min("price_per_ticket"))
        return result["min_price"]

    def get_available_tickets(self, obj):
        result = obj.listings.filter(status="active").aggregate(total=Count("id"))
        return result["total"] or 0


class MatchDetailSerializer(MatchListSerializer):
    listings = serializers.SerializerMethodField()

    class Meta(MatchListSerializer.Meta):
        fields = MatchListSerializer.Meta.fields + ["listings"]

    def get_listings(self, obj):
        qs = obj.listings.filter(status="active").select_related("seller")
        return TicketListingSerializer(qs, many=True).data


# ─────────────────────────────────────────
#  Ticket Listings
# ─────────────────────────────────────────

class TicketListingSerializer(serializers.ModelSerializer):
    seller = UserPublicSerializer(read_only=True)
    match = MatchListSerializer(read_only=True)
    match_id = serializers.PrimaryKeyRelatedField(
        queryset=Match.objects.all(), source="match", write_only=True
    )

    class Meta:
        model = TicketListing
        fields = [
            "id", "seller", "match", "match_id", "category",
            "quantity", "price_per_ticket", "currency",
            "section", "row", "seat_numbers", "face_value",
            "is_early_delivery", "status", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "seller", "status", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["seller"] = request.user
        return super().create(validated_data)


class TicketListingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketListing
        fields = [
            "match", "category", "quantity", "price_per_ticket",
            "currency", "section", "row", "seat_numbers",
            "face_value", "is_early_delivery", "notes",
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["seller"] = request.user
        return super().create(validated_data)


# ─────────────────────────────────────────
#  Orders
# ─────────────────────────────────────────

class OrderSerializer(serializers.ModelSerializer):
    buyer = UserPublicSerializer(read_only=True)
    listing = TicketListingSerializer(read_only=True)
    listing_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "buyer", "listing", "listing_id",
            "quantity", "unit_price", "service_fee", "total_price",
            "currency", "status", "fifa_ticketing_email",
            "notes", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "buyer", "unit_price", "service_fee",
            "total_price", "status", "created_at", "updated_at",
        ]

    def validate(self, data):
        try:
            listing = TicketListing.objects.get(id=data["listing_id"], status="active")
        except TicketListing.DoesNotExist:
            raise serializers.ValidationError({"listing_id": "Listing not found or unavailable."})

        if data["quantity"] > listing.quantity:
            raise serializers.ValidationError(
                {"quantity": f"Only {listing.quantity} tickets available."}
            )

        data["listing"] = listing
        data["unit_price"] = listing.price_per_ticket
        service_fee = listing.price_per_ticket * data["quantity"] * 0  # 0% fee
        data["service_fee"] = service_fee
        data["total_price"] = listing.price_per_ticket * data["quantity"] + service_fee
        data["currency"] = listing.currency
        return data

    def create(self, validated_data):
        validated_data.pop("listing_id", None)
        request = self.context.get("request")
        validated_data["buyer"] = request.user
        return super().create(validated_data)


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status", "notes"]


# ─────────────────────────────────────────
#  Reviews
# ─────────────────────────────────────────

class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserPublicSerializer(read_only=True)
    reviewed_user = UserPublicSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id", "order", "reviewer", "reviewed_user",
            "rating", "comment", "created_at",
        ]
        read_only_fields = ["id", "reviewer", "reviewed_user", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        order = validated_data["order"]

        if order.buyer != request.user:
            raise serializers.ValidationError("You can only review your own orders.")

        if order.status != "completed":
            raise serializers.ValidationError("You can only review completed orders.")

        validated_data["reviewer"] = request.user
        validated_data["reviewed_user"] = order.listing.seller
        return super().create(validated_data)


# ─────────────────────────────────────────
#  Wishlist
# ─────────────────────────────────────────

class WishlistSerializer(serializers.ModelSerializer):
    match = MatchListSerializer(read_only=True)
    match_id = serializers.PrimaryKeyRelatedField(
        queryset=Match.objects.all(), source="match", write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ["id", "match", "match_id", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["user"] = request.user
        return super().create(validated_data)


# ─────────────────────────────────────────
#  Price Alerts
# ─────────────────────────────────────────

class PriceAlertSerializer(serializers.ModelSerializer):
    match = MatchListSerializer(read_only=True)
    match_id = serializers.PrimaryKeyRelatedField(
        queryset=Match.objects.all(), source="match", write_only=True
    )

    class Meta:
        model = PriceAlert
        fields = [
            "id", "match", "match_id", "max_price",
            "quantity_needed", "category", "is_active", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["user"] = request.user
        return super().create(validated_data)


# ─────────────────────────────────────────
#  Stats / Summary
# ─────────────────────────────────────────

class MarketplaceSummarySerializer(serializers.Serializer):
    total_listings = serializers.IntegerField()
    total_matches = serializers.IntegerField()
    min_group_price = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    min_final_price = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    top_matches = MatchListSerializer(many=True)