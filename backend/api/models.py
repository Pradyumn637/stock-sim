from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal

# Profile - Extending User with Balance
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default='50000.00')
    
    def __str__(self):
        return f"{self.user.username} (${self.balance})"

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

# Stock (name, price, change)
class Stock(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    change_percent = models.DecimalField(max_digits=5, decimal_places=2, default='0.00')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} - ${self.price}"

# Portfolio (user, stock, quantity)
class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    avg_price = models.DecimalField(max_digits=12, decimal_places=2, default='0.00')

    class Meta:
        unique_together = ('user', 'stock')

# Transaction (user, stock, type, quantity, price)
class Transaction(models.Model):
    TYPES = (
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
        ('P2P_BUY', 'P2P Buy'),
        ('P2P_SELL', 'P2P Sell'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TYPES)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

from django.utils import timezone

# Listing (P2P: user, stock, quantity, price)
class Listing(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    is_sold = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

# Event (stock, impact %, duration/scheduled_time)
class Event(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    impact_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    duration_minutes = models.IntegerField(default=60)
    scheduled_time = models.DateTimeField()
    is_executed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
