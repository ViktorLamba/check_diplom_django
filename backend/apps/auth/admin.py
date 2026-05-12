from django.contrib import admin
import os

from .models import TwoFactorCode

admin.site.site_header = 'R3DME Administration'
admin.site.site_title = 'R3DME Admin'
admin.site.index_title = 'Управление стендом'
admin.site.site_url = os.getenv('DJANGO_SITE_URL', '/')


@admin.register(TwoFactorCode)
class TwoFactorCodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'code', 'expires_at', 'is_used', 'created_at')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email', 'code')
