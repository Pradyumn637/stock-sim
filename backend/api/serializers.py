from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Stock, Portfolio, Transaction, Event, News, Watchlist, Alert, P2PListing

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
    current_price = serializers.DecimalField(source='stock.price', max_digits=12, decimal_places=2, read_only=True)
    class Meta:
        model = Portfolio
        fields = ['id', 'stock', 'symbol', 'quantity', 'avg_price', 'current_price']

class TransactionSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source='stock.symbol', read_only=True)
    class Meta:
        model = Transaction
        fields = ['id', 'stock', 'symbol', 'type', 'quantity', 'price', 'timestamp']

class EventSerializer(serializers.ModelSerializer):
    stock_name = serializers.SerializerMethodField()
    stock_symbol = serializers.SerializerMethodField()
    impact_percent = serializers.FloatField(source='impact_percentage', read_only=True)

    class Meta:
        model = Event
        fields = "__all__"

    def get_stock_name(self, obj):
        try:
            return obj.stock.name if obj.stock else "Unknown"
        except:
            return "Unknown"
    
    def get_stock_symbol(self, obj):
        try:
            return obj.stock.symbol if obj.stock else "???"
        except:
            return "???"

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'

class WatchlistSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_price = serializers.DecimalField(source='stock.price', max_digits=12, decimal_places=2, read_only=True)
    class Meta:
        model = Watchlist
        fields = ['id', 'stock', 'stock_symbol', 'stock_price', 'created_at']

class AlertSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    class Meta:
        model = Alert
        fields = '__all__'

class P2PListingSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    class Meta:
        model = P2PListing
        fields = '__all__'
