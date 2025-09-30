#!/usr/bin/env python3
"""Database initialization script for Smart Expense Tracker"""

import os
import sys
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def init_database():
    """Initialize database with proper Flask app context"""
    try:
        print('🚀 Starting database initialization...')
        
        # Import after path setup
        from app import create_app
        from app.database import db
        
        print('📱 Creating Flask application...')
        app = create_app()
        
        print('🔧 Setting up application context...')
        with app.app_context():
            print('🗄️  Creating database tables...')
            
            # Drop all tables first (fresh start)
            db.drop_all()
            print('🧹 Cleared existing tables')
            
            # Create all tables
            db.create_all()
            print('📊 Created database tables')
            
            # Import models to ensure they're registered
            from app.models.user import User
            from app.models.category import Category  
            from app.models.expense import Expense
            
            # Create default categories
            print('📂 Creating default categories...')
            default_categories = [
                {
                    'name': 'Food & Dining',
                    'description': 'Food and dining expenses',
                    'color': '#ff6b6b',
                    'icon': '🍽️',
                    'is_system': True,
                    'sort_order': 1
                },
                {
                    'name': 'Transportation', 
                    'description': 'Transportation expenses',
                    'color': '#4ecdc4',
                    'icon': '🚗',
                    'is_system': True,
                    'sort_order': 2
                },
                {
                    'name': 'Shopping',
                    'description': 'Shopping expenses', 
                    'color': '#45b7d1',
                    'icon': '🛍️',
                    'is_system': True,
                    'sort_order': 3
                },
                {
                    'name': 'Entertainment',
                    'description': 'Entertainment expenses',
                    'color': '#96ceb4', 
                    'icon': '🎬',
                    'is_system': True,
                    'sort_order': 4
                },
                {
                    'name': 'Bills & Utilities',
                    'description': 'Bills and utilities',
                    'color': '#ffeaa7',
                    'icon': '💡',
                    'is_system': True,
                    'sort_order': 5
                },
                {
                    'name': 'Healthcare',
                    'description': 'Healthcare expenses',
                    'color': '#dda0dd',
                    'icon': '🏥', 
                    'is_system': True,
                    'sort_order': 6
                },
                {
                    'name': 'Education',
                    'description': 'Education expenses',
                    'color': '#ffb347',
                    'icon': '📚',
                    'is_system': True,
                    'sort_order': 7
                },
                {
                    'name': 'Travel',
                    'description': 'Travel expenses', 
                    'color': '#87ceeb',
                    'icon': '✈️',
                    'is_system': True,
                    'sort_order': 8
                },
                {
                    'name': 'Business',
                    'description': 'Business expenses',
                    'color': '#f0e68c',
                    'icon': '💼',
                    'is_system': True,
                    'sort_order': 9
                },
                {
                    'name': 'Other',
                    'description': 'Other miscellaneous expenses',
                    'color': '#d3d3d3', 
                    'icon': '📋',
                    'is_system': True,
                    'sort_order': 10
                }
            ]
            
            categories_created = 0
            for cat_data in default_categories:
                existing = Category.query.filter_by(name=cat_data['name']).first()
                if not existing:
                    category = Category(**cat_data)
                    db.session.add(category)
                    categories_created += 1
            
            db.session.commit()
            print(f'✅ Created {categories_created} default categories')
            
            # Verify tables were created
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f'📋 Database tables created: {", ".join(tables)}')
            
            print('🎉 Database initialization completed successfully!')
            return True
            
    except Exception as e:
        print(f'❌ Database initialization failed: {str(e)}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = init_database()
    if not success:
        sys.exit(1)
