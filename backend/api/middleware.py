import random
from decimal import Decimal
from datetime import datetime
from .models import Event, Stock

class MarketEngineMiddleware:
    """
    Simplified Market Engine: 
    Fluctuates prices and triggers events on each request to simulate real-time activity.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only run simulation for API requests to avoid overhead
        if request.path.startswith('/api/'):
            try:
                # 1. Trigger Scheduled Events
                now = datetime.now()
                pending_events = Event.objects.filter(scheduled_time__lte=now, is_executed=False)
                for event in pending_events:
                    stock = event.stock
                    old_price = stock.price
                    impact = Decimal(str(event.impact_percent)) / Decimal('100')
                    stock.price = stock.price * (Decimal('1') + impact)
                    if old_price > 0:
                        stock.change_percent = ((stock.price - old_price) / old_price) * Decimal('100')
                    stock.save()
                    event.is_executed = True
                    event.save()

                # 2. Random Fluctuations (10% chance)
                if random.random() < 0.1:
                    for s in Stock.objects.all():
                        old_price = s.price
                        noise = Decimal(str(random.uniform(-0.015, 0.015)))
                        s.price = s.price * (Decimal('1') + noise)
                        if old_price > 0:
                            s.change_percent = ((s.price - old_price) / old_price) * Decimal('100')
                        s.save()
            except Exception as e:
                print(f"MARKET FAILURE: {str(e)}")

        return self.get_response(request)
