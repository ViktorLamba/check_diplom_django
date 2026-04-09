from django.contrib import admin

from .models import TwoFactorCode


@admin.register(TwoFactorCode)
class TwoFactorCodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'code', 'expires_at', 'is_used', 'created_at')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email', 'code')
