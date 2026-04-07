from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, login_view, CurrentUserView, StockListView, 
    StockManageView, BuyStockView, SellStockView, PortfolioListView,
    ListingView, BuyListingView, LeaderboardView, EventView, TransactionHistoryView,
    NewsView, WatchlistView, WatchlistDeleteView, AlertView, AlertDeleteView,
    MarketControlView, StockCandleView, ListingDeleteView
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', CurrentUserView.as_view(), name='user'),

    # Stocks
    path('stocks/', StockListView.as_view(), name='stocks'),
    path('stocks/<int:pk>/', StockManageView.as_view(), name='stock_manage'),
    path('stocks/<int:pk>/candles/', StockCandleView.as_view(), name='stock_candles'),

    # Trading
    path('buy/', BuyStockView.as_view(), name='buy'),
    path('sell/', SellStockView.as_view(), name='sell'),
    path('portfolio/', PortfolioListView.as_view(), name='portfolio'),
    path('transactions/', TransactionHistoryView.as_view(), name='transactions'),

    # P2P
    path('p2p/', ListingView.as_view(), name='p2p_listings'),
    path('p2p/<int:pk>/buy/', BuyListingView.as_view(), name='p2p_buy'),
    path('p2p/<int:pk>/', ListingDeleteView.as_view(), name='p2p_delete'),

    # Features
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('events/', EventView.as_view(), name='events'),
    path('news/', NewsView.as_view(), name='news'),
    path('watchlist/', WatchlistView.as_view(), name='watchlist'),
    path('watchlist/<int:pk>/', WatchlistDeleteView.as_view(), name='watchlist_delete'),
    path('alerts/', AlertView.as_view(), name='alerts'),
    path('alerts/<int:pk>/', AlertDeleteView.as_view(), name='alert_delete'),

    # Market Controls
    path('market/control/<str:action>/', MarketControlView.as_view(), name='market_control'),
]