"""
Smart Expense Tracker - Routes Package
Contains all API route blueprints
"""

from .auth import auth_bp
from .expenses import expenses_bp
from .dashboard import dashboard_bp
from .upload import upload_bp

__all__ = ['auth_bp', 'expenses_bp', 'dashboard_bp', 'upload_bp']
