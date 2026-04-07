from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Stock, Portfolio, Transaction, Listing, Event

class UserSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(source='profile.balance', max_digits=12, decimal_places=2, read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'balance', 'is_staff']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = '__all__'

class PortfolioSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source='stock.symbol', read_only=True)
    name = serializers.CharField(source='stock.name', read_only=True)
    current_price = serializers.DecimalField(source='stock.price', max_digits=12, decimal_places=2, read_only=True)
    class Meta:
        model = Portfolio
        fields = ['id', 'stock', 'symbol', 'name', 'quantity', 'avg_price', 'current_price']

class TransactionSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source='stock.symbol', read_only=True)
    class Meta:
        model = Transaction
        fields = ['id', 'stock', 'symbol', 'type', 'quantity', 'price', 'timestamp']

class ListingSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='user.username', read_only=True)
    symbol = serializers.CharField(source='stock.symbol', read_only=True)
    class Meta:
        model = Listing
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    class Meta:
        model = Event
        fields = '__all__'
