import random
from datetime import datetime
from decimal import Decimal
from .models import Event, Stock, News, Alert

class EventTriggerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            # 1. Check for scheduled events
            current_time = datetime.now()
            pending_events = Event.objects.filter(scheduled_time__lte=current_time, is_executed=False)
            
            for event in pending_events:
                stock = event.stock
                old_price = stock.price
                multiplier = Decimal("1") + (Decimal(str(event.impact_percentage)) / Decimal("100"))
                stock.price = stock.price * multiplier
                
                if old_price > 0:
                    stock.change_percent = ((stock.price - old_price) / old_price) * Decimal("100")
                else:
                    stock.change_percent = Decimal("0")
                    
                stock.save()
                
                News.objects.create(
                    title=f"Market Update: {event.title}",
                    content=f"{event.description}. Impact on {stock.symbol}: {event.impact_percentage}%"
                )
                
                event.is_executed = True
                event.save()

            # 2. Random fluctuations
            if random.random() < 0.1:
                for s in Stock.objects.all():
                    old_price = s.price
                    fluctuation = Decimal(str(random.uniform(-0.02, 0.02)))
                    s.price = s.price * (Decimal("1") + fluctuation)
                    if old_price > 0:
                        s.change_percent = ((s.price - old_price) / old_price) * Decimal("100")
                    s.save()

            # 3. Check for Alerts
            for stock in Stock.objects.all():
                alerts = Alert.objects.filter(stock=stock, is_triggered=False)
                for alert in alerts:
                    triggered = False
                    if alert.target_price is None:
                        triggered = True
                    elif alert.condition == 'ABOVE' and stock.price >= alert.target_price:
                        triggered = True
                    elif alert.condition == 'BELOW' and stock.price <= alert.target_price:
                        triggered = True
                    
                    if triggered:
                        alert.is_triggered = True
                        alert.save()
                        News.objects.create(
                            title=f"Alert Triggered: {stock.symbol}",
                            content=f"Price is now ${stock.price} (Alert condition: {alert.condition} {alert.target_price or 'any change'})"
                        )
        except Exception as e:
            print(f"MIDDLEWARE ERROR: {str(e)}")

        response = self.get_response(request)
        return response
