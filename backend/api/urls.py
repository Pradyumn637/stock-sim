from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, ProfileDetail, MarketListing, BuyStock, SellStock, PortfolioList,
    TransactionList, NewsList, WatchlistList, ToggleWatchlist, AlertList, P2PListingList, BuyP2PListing, ToggleAdmin, UserList, StockUpdateDelete, admin_events, AlertDelete, P2PListingDelete, EventDelete
)

urlpatterns = [
    # Fixed Auth Endpoints
    path('signup/', RegisterView.as_view(), name='signup'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    
    # Core Endpoints
    path('stocks/', MarketListing.as_view(), name='stocks'),
    path('buy/', BuyStock.as_view(), name='buy'),
    path('sell/', SellStock.as_view(), name='sell'),
    path('portfolio/', PortfolioList.as_view(), name='portfolio'),

    # Other stabilization features (keep logic)
    path('profile/', ProfileDetail.as_view(), name='profile'),
    path('transactions/', TransactionList.as_view(), name='transactions'),
    path('news/', NewsList.as_view(), name='news'),
    path('watchlist/', WatchlistList.as_view(), name='watchlist'),
    path('watchlist/toggle/', ToggleWatchlist.as_view(), name='toggle_watchlist'),
    path('alerts/', AlertList.as_view(), name='alerts'),
    path('p2p/', P2PListingList.as_view(), name='p2p_listings'),
    path('p2p/buy/<int:pk>/', BuyP2PListing.as_view(), name='p2p_buy'),
    path('admin/users/', UserList.as_view(), name='admin_users'),
    path('admin/toggle-admin/', ToggleAdmin.as_view(), name='admin_toggle'),
    path('admin/events/', admin_events, name='admin_events'),
    path('admin/events/<int:pk>/', EventDelete.as_view(), name='admin_event_delete'),
    path('admin/stocks/<int:pk>/', StockUpdateDelete.as_view(), name='admin_stock_update_delete'),
    path('alerts/<int:pk>/', AlertDelete.as_view(), name='alert_delete'),
    path('p2p/<int:pk>/', P2PListingDelete.as_view(), name='p2p_delete'),
]
