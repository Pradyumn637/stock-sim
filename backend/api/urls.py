from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, login_view, ProfileDetail, MarketListing, BuyStock, SellStock, PortfolioList,
    TransactionList, NewsList, WatchlistList, ToggleWatchlist, AlertList, P2PListingList,
    BuyP2PListing, ToggleAdmin, UserList, StockUpdateDelete, admin_events, AlertDelete,
    P2PListingDelete, EventDelete, AdminLeaderboard, PauseMarket, ResumeMarket,
    ResetMarket, CrashMarket, SkyrocketMarket
)

urlpatterns = [
    # ✅ Auth (FIXED)
    path('signup/', RegisterView.as_view(), name='signup'),
    path('login/', login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Core Endpoints
    path('stocks/', MarketListing.as_view(), name='stocks'),
    path('buy/', BuyStock.as_view(), name='buy'),
    path('sell/', SellStock.as_view(), name='sell'),
    path('portfolio/', PortfolioList.as_view(), name='portfolio'),

    # Other features
    path('profile/', ProfileDetail.as_view(), name='profile'),
    path('transactions/', TransactionList.as_view(), name='transactions'),
    path('news/', NewsList.as_view(), name='news'),
    path('watchlist/', WatchlistList.as_view(), name='watchlist'),
    path('watchlist/toggle/', ToggleWatchlist.as_view(), name='toggle_watchlist'),
    path('alerts/', AlertList.as_view(), name='alerts'),
    path('alerts/<int:pk>/', AlertDelete.as_view(), name='alert_delete'),

    # P2P
    path('p2p/', P2PListingList.as_view(), name='p2p_listings'),
    path('p2p/buy/<int:pk>/', BuyP2PListing.as_view(), name='p2p_buy'),
    path('p2p/<int:pk>/', P2PListingDelete.as_view(), name='p2p_delete'),

    # Admin
    path('admin/users/', UserList.as_view(), name='admin_users'),
    path('admin/toggle-admin/', ToggleAdmin.as_view(), name='admin_toggle'),
    path('admin/events/', admin_events, name='admin_events'),
    path('admin/events/<int:pk>/', EventDelete.as_view(), name='admin_event_delete'),
    path('admin/stocks/<int:pk>/', StockUpdateDelete.as_view(), name='admin_stock_update_delete'),

    # Advanced Admin
    path('admin/leaderboard/', AdminLeaderboard.as_view(), name='admin_leaderboard'),
    path('admin/market/pause/', PauseMarket.as_view(), name='admin_market_pause'),
    path('admin/market/resume/', ResumeMarket.as_view(), name='admin_market_resume'),
    path('admin/market/reset/', ResetMarket.as_view(), name='admin_market_reset'),
    path('admin/market/crash/', CrashMarket.as_view(), name='admin_market_crash'),
    path('admin/market/skyrocket/', SkyrocketMarket.as_view(), name='admin_market_skyrocket'),
]