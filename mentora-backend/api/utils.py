from rest_framework.views import exception_handler
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage


def custom_exception_handler(exc, context):
    """Return JSON errors consistent with the original Flask API."""
    response = exception_handler(exc, context)
    if response is not None:
        error_detail = response.data
        if isinstance(error_detail, dict):
            # Flatten first-level detail key if present
            if 'detail' in error_detail:
                error_detail = error_detail['detail']
        response.data = {'error': str(error_detail)}
    return response


def paginate(queryset, page, per_page):
    """Return a (items, total, num_pages) tuple."""
    paginator = Paginator(queryset, per_page)
    try:
        items = paginator.page(page)
    except EmptyPage:
        items = paginator.page(paginator.num_pages)
    return list(items.object_list), paginator.count, paginator.num_pages
