import os
import django
import random
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from api.models import Stock, News, User, Profile

def seed():
    stocks_data = [
        {'symbol': 'AAPL', 'name': 'Apple Inc.', 'price': '150.00'},
        {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'price': '2800.00'},
        {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'price': '700.00'},
        {'symbol': 'MSFT', 'name': 'Microsoft Corp.', 'price': '300.00'},
        {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'price': '3300.00'},
        {'symbol': 'NFLX', 'name': 'Netflix Inc.', 'price': '500.00'},
        {'symbol': 'META', 'name': 'Meta Platforms Inc.', 'price': '330.00'},
        {'symbol': 'NVDA', 'name': 'NVIDIA Corp.', 'price': '220.00'},
    ]

    for data in stocks_data:
        Stock.objects.get_or_create(symbol=data['symbol'], defaults={'name': data['name'], 'price': Decimal(data['price'])})

    News.objects.get_or_create(title="Market Open", content="The market is now open for trading!")
    
    # Create admin
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        admin.profile.balance = Decimal('500000.00')
        admin.profile.save()
        print("Admin created: admin / admin123")
    
    # Create test user
    if not User.objects.filter(username='user').exists():
        user = User.objects.create_user('user', 'user@example.com', 'user123')
        user.profile.balance = Decimal('100000.00')
        user.profile.save()
        print("User created: user / user123")

if __name__ == '__main__':
    seed()
