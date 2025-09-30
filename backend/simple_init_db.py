#!/usr/bin/env python3
"""Simple database initialization"""

def init_database():
    print('🚀 Initializing database...')
    
    # Import the app and db
    from app import create_app, db
    
    # Create app instance
    app = create_app()
    
    print('📱 Created Flask app')
    
    # Create all tables within app context
    with app.app_context():
        print('🗄️  Dropping existing tables...')
        db.drop_all()
        
        print('🏗️  Creating new tables...')
        db.create_all()
        
        # Import models to make sure they're registered
        from app.models.user import User
        from app.models.category import Category
        from app.models.expense import Expense
        
        print('📂 Creating default categories...')
        
        # Create default categories
        categories = [
            {'name': 'Food & Dining', 'description': 'Food and dining', 'color': '#ff6b6b', 'icon': '🍽️'},
            {'name': 'Transportation', 'description': 'Transportation', 'color': '#4ecdc4', 'icon': '🚗'},
            {'name': 'Shopping', 'description': 'Shopping', 'color': '#45b7d1', 'icon': '🛍️'},
            {'name': 'Entertainment', 'description': 'Entertainment', 'color': '#96ceb4', 'icon': '🎬'},
            {'name': 'Bills & Utilities', 'description': 'Bills and utilities', 'color': '#ffeaa7', 'icon': '💡'},
            {'name': 'Healthcare', 'description': 'Healthcare', 'color': '#dda0dd', 'icon': '🏥'},
            {'name': 'Education', 'description': 'Education', 'color': '#ffb347', 'icon': '📚'},
            {'name': 'Travel', 'description': 'Travel', 'color': '#87ceeb', 'icon': '✈️'},
            {'name': 'Business', 'description': 'Business', 'color': '#f0e68c', 'icon': '💼'},
            {'name': 'Other', 'description': 'Other expenses', 'color': '#d3d3d3', 'icon': '📋'},
        ]
        
        for cat_data in categories:
            category = Category(
                name=cat_data['name'],
                description=cat_data['description'],
                color=cat_data['color'],
                icon=cat_data['icon'],
                is_system=True,
                is_active=True
            )
            db.session.add(category)
        
        db.session.commit()
        print('✅ Database initialized successfully!')
        
        # Verify
        category_count = Category.query.count()
        print(f'✅ Created {category_count} categories')
        
        return True

if __name__ == '__main__':
    try:
        success = init_database()
        if success:
            print('\n🎉 Database setup complete!')
        else:
            print('\n❌ Database setup failed!')
    except Exception as e:
        print(f'\n❌ Error: {e}')
        import traceback
        traceback.print_exc()
