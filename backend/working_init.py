#!/usr/bin/env python3
"""Working database initialization"""

import os
import sys

def setup_database():
    print('🚀 Setting up database...')
    
    try:
        # Import app components
        from app import create_app
        from app.database import db
        
        print('📱 Creating Flask application...')
        app = create_app()
        
        print('🗄️ Initializing database...')
        with app.app_context():
            # Create all tables
            db.drop_all()  # Fresh start
            db.create_all()
            
            print('📊 Creating categories...')
            
            # Import models after db is set up
            from app.models.category import Category
            
            # Create categories manually
            categories_data = [
                ('Food & Dining', '🍽️', '#FF6B6B'),
                ('Transportation', '🚗', '#4ECDC4'),
                ('Shopping', '🛍️', '#45B7D1'),
                ('Entertainment', '🎬', '#96CEB4'),
                ('Bills & Utilities', '💡', '#FFEAA7'),
                ('Healthcare', '🏥', '#DDA0DD'),
                ('Education', '📚', '#FFB347'),
                ('Travel', '✈️', '#87CEEB'),
                ('Business', '💼', '#F0E68C'),
                ('Other', '📋', '#D3D3D3')
            ]
            
            for name, icon, color in categories_data:
                category = Category(
                    name=name,
                    icon=icon,
                    color=color,
                    description=f'{name} expenses',
                    is_active=True,
                    is_system=True
                )
                db.session.add(category)
            
            db.session.commit()
            
            # Verify
            count = Category.query.count()
            print(f'✅ Created {count} categories successfully!')
            
            print('🎉 Database setup completed!')
            return True
            
    except Exception as e:
        print(f'❌ Setup failed: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = setup_database()
    if success:
        print('\n🚀 Ready to start server with: python run.py')
    else:
        print('\n❌ Setup failed!')
        sys.exit(1)
