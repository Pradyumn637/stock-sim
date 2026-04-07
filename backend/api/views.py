from datetime import datetime
from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework import status, views, permissions, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import transaction as db_transaction
from .models import Stock, Profile, Portfolio, Transaction, Event, News, Watchlist, Alert, P2PListing, MarketControl
from .serializers import (
    RegisterSerializer, UserSerializer, StockSerializer, 
    PortfolioSerializer, TransactionSerializer, NewsSerializer, 
    WatchlistSerializer, AlertSerializer, P2PListingSerializer, EventSerializer
)
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView

# Auth
def is_market_paused():
    try:
        control = MarketControl.objects.filter(id=1).first()
        return control.is_paused if control else False
    except:
        return False

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileDetail(views.APIView):
    def get(self, request):
        try:
            profile, created = Profile.objects.get_or_create(user=request.user)
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

# Market
class MarketListing(generics.ListCreateAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.IsAuthenticated]

    # For admin to create/edit stocks if they want
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class StockUpdateDelete(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def patch(self, request, pk):
        try:
            stock = get_object_or_404(Stock, id=pk)
            price = request.data.get('price')
            if price is not None:
                stock.price = Decimal(str(price))
                stock.save()
            return Response(StockSerializer(stock).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            stock = get_object_or_404(Stock, id=pk)
            stock.delete()
            return Response({'message': 'Stock deleted'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Trading
class BuyStock(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        if is_market_paused():
            return Response({'error': 'Trading is currently paused'}, status=status.HTTP_403_FORBIDDEN)
        try:
            stock_id = request.data.get('stock_id')
            qty_raw = request.data.get('quantity', 1)
            
            # Robust conversion
            quantity = Decimal(str(qty_raw))
            if quantity <= 0:
                return Response({'error': 'Quantity must be positive'}, status=status.HTTP_400_BAD_REQUEST)

            stock = get_object_or_404(Stock, id=stock_id)
            price = Decimal(str(stock.price))
            cost = price * quantity

            with db_transaction.atomic():
                profile, _ = Profile.objects.get_or_create(user=request.user)
                if profile.balance < cost:
                    return Response({'error': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)
                
                profile.balance -= cost
                profile.save()

                portfolio, created = Portfolio.objects.get_or_create(user=request.user, stock=stock)
                
                # Update average price
                current_qty = Decimal(str(portfolio.quantity))
                current_total_val = Decimal(str(portfolio.avg_price)) * current_qty
                new_total_val = current_total_val + cost
                
                portfolio.quantity += int(quantity)
                portfolio.avg_price = new_total_val / Decimal(str(portfolio.quantity))
                portfolio.save()

                Transaction.objects.create(
                    user=request.user, 
                    stock=stock, 
                    type='BUY', 
                    quantity=int(quantity), 
                    price=price
                )

            return Response({'message': 'Success'})
        except Exception as e:
            print(f"ERROR in BuyStock: {str(e)}")
            return Response({'error': f'Transaction failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SellStock(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        if is_market_paused():
            return Response({'error': 'Trading is currently paused'}, status=status.HTTP_403_FORBIDDEN)
        try:
            stock_id = request.data.get('stock_id')
            qty_raw = request.data.get('quantity', 1)
            
            # Robust conversion
            quantity = Decimal(str(qty_raw))
            if quantity <= 0:
                return Response({'error': 'Quantity must be positive'}, status=status.HTTP_400_BAD_REQUEST)
                
            stock = get_object_or_404(Stock, id=stock_id)
            price = Decimal(str(stock.price))
            
            with db_transaction.atomic():
                portfolio = get_object_or_404(Portfolio, user=request.user, stock=stock)
                if portfolio.quantity < int(quantity):
                    return Response({'error': 'Insufficient quantity'}, status=status.HTTP_400_BAD_REQUEST)
                
                earnings = price * quantity
                profile, _ = Profile.objects.get_or_create(user=request.user)
                profile.balance = Decimal(str(profile.balance)) + earnings
                profile.save()

                portfolio.quantity -= int(quantity)
                if portfolio.quantity == 0:
                    portfolio.delete()
                else:
                    portfolio.save()

                Transaction.objects.create(
                    user=request.user, 
                    stock=stock, 
                    type='SELL', 
                    quantity=int(quantity), 
                    price=price
                )

            return Response({'message': 'Success'})
        except Exception as e:
            print(f"ERROR in SellStock: {str(e)}")
            return Response({'error': f'Transaction failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Portfolio / Transactions
class PortfolioList(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        queryset = Portfolio.objects.filter(user=request.user, quantity__gt=0)
        serializer = PortfolioSerializer(queryset, many=True)
        return Response(serializer.data)

class TransactionList(generics.ListAPIView):
    serializer_class = TransactionSerializer
    def list(self, request, *args, **kwargs):
        try:
            queryset = Transaction.objects.filter(user=request.user).order_by('-timestamp')
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except:
            return Response([])

# News
class NewsList(generics.ListAPIView):
    queryset = News.objects.all().order_by('-timestamp')[:20]
    serializer_class = NewsSerializer

# Watchlist
class WatchlistList(generics.ListAPIView):
    serializer_class = WatchlistSerializer
    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)

class ToggleWatchlist(views.APIView):
    def post(self, request):
        stock_id = request.data.get('stock_id')
        stock = get_object_or_404(Stock, id=stock_id)
        wl, created = Watchlist.objects.get_or_create(user=request.user, stock=stock)
        if not created:
            wl.delete()
            return Response({'status': 'removed'})
        return Response({'status': 'added'})

# Alerts
class AlertList(generics.ListCreateAPIView):
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user)

    def post(self, request):
        print(f"DEBUG: Alert creation request data: {request.data}")
        try:
            stock_id = request.data.get("stock_id")
            target_price_raw = request.data.get("target_price")
            condition = request.data.get("condition")

            # 4. ADD VALIDATION
            if not stock_id:
                return Response({"error": "stock_id is provided"}, status=status.HTTP_400_BAD_REQUEST)
            target_price = None
            if target_price_raw and target_price_raw != "":
                try:
                    target_price = Decimal(str(target_price_raw))
                except Exception:
                    return Response({"error": "target_price is valid number"}, status=status.HTTP_400_BAD_REQUEST)

            # 2. FIX STOCK FETCHING
            try:
                stock = Stock.objects.get(id=stock_id)
            except Stock.DoesNotExist:
                return Response({"error": "Stock does not exist"}, status=status.HTTP_400_BAD_REQUEST)

            # 3. CREATE ALERT SAFELY
            # If target_price is None or empty, it will trigger on any change if the logic is updated elsewhere, but for now we fulfill the model's need.
            alert = Alert.objects.create(
                user=request.user,
                stock=stock,
                target_price=target_price,
                condition=condition
            )
            
            # 5. ADD ERROR HANDLING
            return Response({"message": "Alert created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AlertDelete(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, pk):
        try:
            alert = get_object_or_404(Alert, pk=pk, user=request.user)
            alert.delete()
            return Response({'message': 'Alert deleted'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Events (Admin)
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_events(request):
    print(f"DEBUG AUTH HEADER: {request.headers.get('Authorization')}")
    print(f"DEBUG USER: {request.user}")
    print(f"DEBUG AUTHENTICATED: {request.user.is_authenticated}")
    if request.method == 'GET':
        try:
            events = Event.objects.all().order_by("-id")
            serializer = EventSerializer(events, many=True)
            return Response(serializer.data)
        except Exception as e:
            print("EVENT ERROR:", str(e))  # IMPORTANT for debugging
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'POST':
        if not request.user.is_staff:
            return Response({"error": "Admin only"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            data = request.data.copy()
            if 'impact_percent' in data and 'impact_percentage' not in data:
                data['impact_percentage'] = data.get('impact_percent')
            
            serializer = EventSerializer(data=data)
            if serializer.is_valid():
                st_raw = request.data.get('scheduled_time')
                event_obj = None
                if st_raw:
                    # Use local time, removing Z if present
                    st = datetime.fromisoformat(st_raw.replace('Z', '')) 
                    event_obj = serializer.save(scheduled_time=st)
                else:
                    event_obj = serializer.save()
                
                if event_obj:
                    News.objects.create(
                        title=f"BREAKING: {event_obj.title}",
                        content=event_obj.description
                    )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("EVENT CREATE ERROR:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EventDelete(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def delete(self, request, pk):
        try:
            event = get_object_or_404(Event, pk=pk)
            event.delete()
            return Response({'message': 'Event deleted'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# P2P Trading
class P2PListingList(generics.ListCreateAPIView):
    serializer_class = P2PListingSerializer
    def get_queryset(self):
        return P2PListing.objects.filter(is_sold=False)
    
    def post(self, request):
        if is_market_paused():
            return Response({'error': 'Trading is currently paused'}, status=status.HTTP_403_FORBIDDEN)
        try:
            stock_id = request.data.get('stock')
            qty_raw = request.data.get('quantity')
            quantity = int(qty_raw)
            price = Decimal(str(request.data.get('price_per_share')))
            stock = get_object_or_404(Stock, id=stock_id)
            
            with db_transaction.atomic():
                portfolio = get_object_or_404(Portfolio, user=request.user, stock=stock)
                if portfolio.quantity < quantity:
                    return Response({'error': 'Insufficient quantity'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Deduct from portfolio immediately to "escrow"
                portfolio.quantity -= quantity
                portfolio.save()
                
                listing = P2PListing.objects.create(
                    seller=request.user, 
                    stock=stock, 
                    quantity=quantity, 
                    price_per_share=price
                )
                return Response(P2PListingSerializer(listing).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class P2PListingDelete(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def delete(self, request, pk):
        try:
            listing = get_object_or_404(P2PListing, pk=pk, seller=request.user, is_sold=False)
            # Return quantity to seller portfolio
            with db_transaction.atomic():
                portfolio, _ = Portfolio.objects.get_or_create(user=request.user, stock=listing.stock)
                portfolio.quantity += listing.quantity
                portfolio.save()
                listing.delete()
            return Response({'message': 'Listing deleted'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BuyP2PListing(views.APIView):
    def post(self, request, pk):
        if is_market_paused():
            return Response({'error': 'Trading is currently paused'}, status=status.HTTP_403_FORBIDDEN)
        try:
            listing = get_object_or_404(P2PListing, pk=pk, is_sold=False)
            buy_qty = int(request.data.get('quantity', listing.quantity))
            
            if buy_qty <= 0 or buy_qty > listing.quantity:
                return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)

            if listing.seller == request.user:
                return Response({'error': 'Cannot buy your own listing'}, status=status.HTTP_400_BAD_REQUEST)
            
            unit_price = Decimal(str(listing.price_per_share))
            total_cost = unit_price * Decimal(str(buy_qty))
            
            with db_transaction.atomic():
                profile, _ = Profile.objects.get_or_create(user=request.user)
                if profile.balance < total_cost:
                    return Response({'error': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Buyer pays
                profile.balance = Decimal(str(profile.balance)) - total_cost
                profile.save()
                
                # Seller gets money
                seller_profile, _ = Profile.objects.get_or_create(user=listing.seller)
                seller_profile.balance = Decimal(str(seller_profile.balance)) + total_cost
                seller_profile.save()
                
                # Update Buyer portfolio
                portfolio, created = Portfolio.objects.get_or_create(user=request.user, stock=listing.stock)
                
                # Update avg price for buyer
                current_qty = Decimal(str(portfolio.quantity))
                current_total_val = Decimal(str(portfolio.avg_price)) * current_qty
                new_total_val = current_total_val + total_cost
                
                portfolio.quantity += buy_qty
                portfolio.avg_price = new_total_val / Decimal(str(portfolio.quantity))
                portfolio.save()
                
                # Update listing
                listing.quantity -= buy_qty
                if listing.quantity == 0:
                    listing.is_sold = True
                listing.save()
                
                Transaction.objects.create(user=request.user, stock=listing.stock, type='P2P_BUY', quantity=buy_qty, price=unit_price)
                Transaction.objects.create(user=listing.seller, stock=listing.stock, type='P2P_SELL', quantity=buy_qty, price=unit_price)

            return Response({'message': 'Success'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ToggleAdmin(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        user_id = request.data.get('user_id')
        user = User.objects.get(id=user_id)
        user.is_staff = not user.is_staff
        user.save()
        return Response({'is_admin': user.is_staff})

# --- ADVANCED ADMIN FEATURES ---

class AdminLeaderboard(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        try:
            users = User.objects.all()
            leaderboard = []
            initial_balance = Decimal('100000.00')
            
            for user in users:
                profile, _ = Profile.objects.get_or_create(user=user)
                balance = Decimal(str(profile.balance))
                
                # Portfolio value
                portfolios = Portfolio.objects.filter(user=user)
                portfolio_value = Decimal('0.00')
                for p in portfolios:
                    portfolio_value += Decimal(str(p.quantity)) * Decimal(str(p.stock.price))
                
                # total_profit = (portfolio_value + balance) - initial_balance
                total_profit = (portfolio_value + balance) - initial_balance
                
                leaderboard.append({
                    "username": user.username,
                    "balance": float(balance),
                    "portfolio_value": float(portfolio_value),
                    "total_profit": float(total_profit)
                })
            
            # Sort by highest profit
            leaderboard.sort(key=lambda x: x['total_profit'], reverse=True)
            return Response(leaderboard)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PauseMarket(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        try:
            control, _ = MarketControl.objects.get_or_create(id=1)
            control.is_paused = True
            control.save()
            return Response({"message": "Market paused"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResumeMarket(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        try:
            control, _ = MarketControl.objects.get_or_create(id=1)
            control.is_paused = False
            control.save()
            return Response({"message": "Market resumed"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetMarket(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        try:
            stocks = Stock.objects.all()
            for stock in stocks:
                stock.price = Decimal('100.00')  # Default initial value
                stock.change_percent = Decimal('0.00')
                stock.save()
            return Response({"message": "All stock prices reset to 100.00"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CrashMarket(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        try:
            stocks = Stock.objects.all()
            for stock in stocks:
                old_price = Decimal(str(stock.price))
                stock.price = old_price * Decimal('0.80')
                if old_price > 0:
                    stock.change_percent = ((stock.price - old_price) / old_price) * Decimal('100')
                stock.save()
            return Response({"message": "Market crashed by 20%"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SkyrocketMarket(views.APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request):
        try:
            stocks = Stock.objects.all()
            for stock in stocks:
                old_price = Decimal(str(stock.price))
                stock.price = old_price * Decimal('1.20')
                if old_price > 0:
                    stock.change_percent = ((stock.price - old_price) / old_price) * Decimal('100')
                stock.save()
            return Response({"message": "Market skyrocketed by 20%"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
