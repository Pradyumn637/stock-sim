from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Profile to extend User with balance
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default='100000.00')
    
    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Stock(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    change_percent = models.DecimalField(max_digits=5, decimal_places=2, default='0.00')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} - {self.price}"

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    avg_price = models.DecimalField(max_digits=12, decimal_places=2, default='0.00')

    class Meta:
        unique_together = ('user', 'stock')

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

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(default="")
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    impact_percentage = models.FloatField(default=0)
    scheduled_time = models.DateTimeField()
    is_executed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class News(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'stock')

class Alert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    target_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    condition = models.CharField(max_length=10, choices=(('ABOVE', 'Above'), ('BELOW', 'Below')), default='ABOVE')
    is_triggered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class P2PListing(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price_per_share = models.DecimalField(max_digits=12, decimal_places=2)
    is_sold = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class MarketControl(models.Model):
    is_paused = models.BooleanField(default=False)
    is_crashed = models.BooleanField(default=False)
    is_skyrocketing = models.BooleanField(default=False)

    def __str__(self):
        return f"Market Control: Paused={self.is_paused}"
