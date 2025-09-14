# Упрощенный вариант (если не используется)
from django.http import HttpResponse

def classify_image(request):
    return HttpResponse("Classification will be here")
