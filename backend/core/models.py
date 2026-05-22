from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class User(AbstractUser):
    """Extended user model for ticket marketplace."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    phone = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    is_verified_seller = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email


class Confederation(models.Model):
    """FIFA confederations (UEFA, CONMEBOL, AFC, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)  # UEFA, AFC, CAF...

    class Meta:
        db_table = "confederations"
        ordering = ["name"]

    def __str__(self):
        return self.code


class Country(models.Model):
    """Participating countries in the World Cup."""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=3, unique=True)  # ISO 3166-1 alpha-3
    flag_emoji = models.CharField(max_length=10, blank=True)
    flag_image = models.ImageField(upload_to="flags/", null=True, blank=True)
    confederation = models.ForeignKey(
        Confederation, on_delete=models.SET_NULL, null=True, related_name="countries"
    )
    is_host = models.BooleanField(default=False)
    is_qualified = models.BooleanField(default=True)

    class Meta:
        db_table = "countries"
        verbose_name_plural = "Countries"
        ordering = ["name"]

    def __str__(self):
        return f"{self.flag_emoji} {self.name}"


class Venue(models.Model):
    """World Cup stadiums and venues."""
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField(default=0)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    image = models.ImageField(upload_to="venues/", null=True, blank=True)
    slug = models.SlugField(unique=True)

    class Meta:
        db_table = "venues"
        ordering = ["country", "city"]

    def __str__(self):
        return f"{self.name}, {self.city}"


class Group(models.Model):
    """World Cup group stage groups (A-L for 2026)."""
    name = models.CharField(max_length=1, unique=True)  # A, B, C ... L

    class Meta:
        db_table = "groups"
        ordering = ["name"]

    def __str__(self):
        return f"Group {self.name}"


class GroupMembership(models.Model):
    """Links countries to their World Cup group."""
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="memberships")
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name="group_memberships")

    class Meta:
        db_table = "group_memberships"
        unique_together = ("group", "country")

    def __str__(self):
        return f"{self.country} - Group {self.group.name}"


class Match(models.Model):
    """Individual World Cup matches."""

    class Stage(models.TextChoices):
        GROUP = "group", _("Group Stage")
        ROUND_OF_32 = "round_of_32", _("Round of 32")
        ROUND_OF_16 = "round_of_16", _("Round of 16")
        QUARTER_FINAL = "quarter_final", _("Quarter Final")
        SEMI_FINAL = "semi_final", _("Semi Final")
        BRONZE_FINAL = "bronze_final", _("Bronze Final")
        FINAL = "final", _("Final")

    match_number = models.CharField(max_length=10, unique=True)  # M1, M2 ... M104
    stage = models.CharField(max_length=20, choices=Stage.choices)
    group = models.ForeignKey(
        Group, on_delete=models.SET_NULL, null=True, blank=True, related_name="matches"
    )
    home_team = models.ForeignKey(
        Country, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="home_matches"
    )
    away_team = models.ForeignKey(
        Country, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="away_matches"
    )
    # For knockout rounds before teams are determined
    home_team_placeholder = models.CharField(max_length=100, blank=True)
    away_team_placeholder = models.CharField(max_length=100, blank=True)
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, related_name="matches")
    match_date = models.DateTimeField()
    is_sold_out = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "matches"
        ordering = ["match_date"]

    @property
    def display_home(self):
        return str(self.home_team) if self.home_team else self.home_team_placeholder

    @property
    def display_away(self):
        return str(self.away_team) if self.away_team else self.away_team_placeholder

    @property
    def display_name(self):
        return f"{self.display_home} vs {self.display_away}"

    def __str__(self):
        return f"{self.match_number}: {self.display_name}"


class TicketCategory(models.TextChoices):
    BEHIND_GOAL = "behind_goal", _("Behind Goal")
    SIDE_LINE = "side_line", _("Side Line")
    CENTER_LINE = "center_line", _("Center Line Block")
    VIP = "vip", _("VIP / Hospitality")
    ACCESSIBILITY = "accessibility", _("Accessibility")
    MATCH_PACK = "match_pack", _("Match Pack")


class TicketListing(models.Model):
    """A seller's ticket listing for a match."""

    class Status(models.TextChoices):
        ACTIVE = "active", _("Active")
        SOLD = "sold", _("Sold")
        EXPIRED = "expired", _("Expired")
        CANCELLED = "cancelled", _("Cancelled")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="listings")
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="listings")
    category = models.CharField(max_length=20, choices=TicketCategory.choices)
    quantity = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(8)]
    )
    price_per_ticket = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="EUR")
    section = models.CharField(max_length=50, blank=True)
    row = models.CharField(max_length=10, blank=True)
    seat_numbers = models.CharField(max_length=100, blank=True)
    face_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_early_delivery = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ticket_listings"
        ordering = ["price_per_ticket"]

    def __str__(self):
        return f"{self.match} - {self.category} x{self.quantity} @ €{self.price_per_ticket}"


class Order(models.Model):
    """A buyer's ticket purchase order."""

    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        PAYMENT_PROCESSING = "payment_processing", _("Payment Processing")
        CONFIRMED = "confirmed", _("Confirmed")
        TICKETS_SENT = "tickets_sent", _("Tickets Sent")
        COMPLETED = "completed", _("Completed")
        CANCELLED = "cancelled", _("Cancelled")
        REFUNDED = "refunded", _("Refunded")
        DISPUTED = "disputed", _("Disputed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    listing = models.ForeignKey(TicketListing, on_delete=models.PROTECT, related_name="orders")
    quantity = models.PositiveSmallIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="EUR")
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.PENDING)
    fifa_ticketing_email = models.EmailField(blank=True)
    payment_intent_id = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order {self.id} - {self.buyer.email}"


class Review(models.Model):
    """Buyer review of a completed transaction."""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="review")
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_given")
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_received")
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reviews"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review {self.rating}★ for {self.reviewed_user.email}"


class Wishlist(models.Model):
    """User's saved/wishlisted matches."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist")
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="wishlisted_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wishlists"
        unique_together = ("user", "match")

    def __str__(self):
        return f"{self.user.email} ♥ {self.match}"


class PriceAlert(models.Model):
    """User sets a price alert for a specific match."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="price_alerts")
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="price_alerts")
    max_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_needed = models.PositiveSmallIntegerField(default=1)
    category = models.CharField(
        max_length=20, choices=TicketCategory.choices, blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "price_alerts"

    def __str__(self):
        return f"Alert: {self.user.email} - {self.match} under €{self.max_price}"