from rest_framework import generics, status, views, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal
from .models import Profile, Stock, Portfolio, Transaction, Listing, Event
from .serializers import (
    RegisterSerializer, UserSerializer, StockSerializer, 
    PortfolioSerializer, TransactionSerializer, ListingSerializer, EventSerializer
)

# --- AUTH ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data
        })
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# --- STOCK ---
class StockListView(generics.ListAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated]

# Admin can update prices
class StockUpdateView(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def patch(self, request, pk):
        stock = get_object_or_404(Stock, id=pk)
        price = request.data.get('price')
        if price is not None:
            stock.price = Decimal(str(price))
            stock.save()
        return Response(StockSerializer(stock).data)

# --- TRADING ---
class BuyStockView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        stock_id = request.data.get('stock_id')
        qty = int(request.data.get('quantity', 0))
        if qty <= 0: return Response({'error': 'Invalid quantity'}, status=400)
        
        stock = get_object_or_404(Stock, id=stock_id)
        cost = stock.price * Decimal(qty)

        with db_transaction.atomic():
            profile = request.user.profile
            if profile.balance < cost:
                return Response({'error': 'Insufficient balance'}, status=400)
            
            profile.balance -= cost
            profile.save()

            portfolio, _ = Portfolio.objects.get_or_create(user=request.user, stock=stock)
            # Update avg price
            current_total = portfolio.avg_price * Decimal(portfolio.quantity)
            portfolio.quantity += qty
            portfolio.avg_price = (current_total + cost) / Decimal(portfolio.quantity)
            portfolio.save()

            Transaction.objects.create(user=request.user, stock=stock, type='BUY', quantity=qty, price=stock.price)
        return Response({'message': 'Bought successfully'})

class SellStockView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        stock_id = request.data.get('stock_id')
        qty = int(request.data.get('quantity', 0))
        if qty <= 0: return Response({'error': 'Invalid quantity'}, status=400)
        
        stock = get_object_or_404(Stock, id=stock_id)
        
        with db_transaction.atomic():
            portfolio = get_object_or_404(Portfolio, user=request.user, stock=stock)
            if portfolio.quantity < qty:
                return Response({'error': 'Insufficient stocks'}, status=400)
            
            earnings = stock.price * Decimal(qty)
            profile = request.user.profile
            profile.balance += earnings
            profile.save()

            portfolio.quantity -= qty
            if portfolio.quantity == 0: portfolio.delete()
            else: portfolio.save()

            Transaction.objects.create(user=request.user, stock=stock, type='SELL', quantity=qty, price=stock.price)
        return Response({'message': 'Sold successfully'})

class PortfolioListView(generics.ListAPIView):
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user, quantity__gt=0)

# --- P2P ---
class ListingView(generics.ListCreateAPIView):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Listing.objects.filter(is_sold=False)
    
    def perform_create(self, serializer):
        stock_id = self.request.data.get('stock')
        qty = int(self.request.data.get('quantity'))
        stock = get_object_or_404(Stock, id=stock_id)
        
        with db_transaction.atomic():
            portfolio = get_object_or_404(Portfolio, user=self.request.user, stock=stock)
            if portfolio.quantity < qty:
                raise Exception("Insufficient stocks for listing")
            portfolio.quantity -= qty
            portfolio.save()
            serializer.save(user=self.request.user)

class BuyListingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        listing = get_object_or_404(Listing, id=pk, is_sold=False)
        if listing.user == request.user:
            return Response({'error': 'Cannot buy own listing'}, status=400)
        
        total_price = listing.price * Decimal(listing.quantity)
        
        with db_transaction.atomic():
            buyer_profile = request.user.profile
            if buyer_profile.balance < total_price:
                return Response({'error': 'Insufficient funds'}, status=400)
            
            buyer_profile.balance -= total_price
            buyer_profile.save()

            seller_profile = listing.user.profile
            seller_profile.balance += total_price
            seller_profile.save()

            # Buyer gets stocks
            port, _ = Portfolio.objects.get_or_create(user=request.user, stock=listing.stock)
            port.quantity += listing.quantity
            port.save()

            listing.is_sold = True
            listing.save()

            Transaction.objects.create(user=request.user, stock=listing.stock, type='P2P_BUY', quantity=listing.quantity, price=listing.price)
            Transaction.objects.create(user=listing.user, stock=listing.stock, type='P2P_SELL', quantity=listing.quantity, price=listing.price)
        return Response({'message': 'Listing bought successfully'})

# --- LEADERBOARD ---
class LeaderboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        users = User.objects.all()
        data = []
        for user in users:
            balance = user.profile.balance
            portfolio_val = Decimal(0)
            for p in user.portfolios.all():
                portfolio_val += Decimal(p.quantity) * p.stock.price
            data.append({
                'username': user.username,
                'total_value': balance + portfolio_val
            })
        data.sort(key=lambda x: x['total_value'], reverse=True)
        return Response(data[:10])

# --- ADMIN EVENTS ---
class EventView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by('-id')
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAdminUser]

class TransactionHistoryView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-timestamp')
