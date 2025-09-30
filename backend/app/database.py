from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize SQLAlchemy
db = SQLAlchemy()

class TimestampMixin:
    """Mixin to add timestamp fields to models"""
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class BaseModel(db.Model):
    """Base model class with common functionality"""
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    
    def save(self):
        """Save instance to database"""
        db.session.add(self)
        db.session.commit()
        return self
    
    def delete(self):
        """Delete instance from database"""
        db.session.delete(self)
        db.session.commit()
    
    def to_dict(self):
        """Convert model instance to dictionary"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

def init_db():
    """Initialize database with sample data"""
    from app.models.category import Category
    
    # Create sample categories
    categories = [
        {'name': 'Food & Dining', 'color': '#FF6B6B', 'icon': '🍽️'},
        {'name': 'Transportation', 'color': '#4ECDC4', 'icon': '🚗'},
        {'name': 'Shopping', 'color': '#45B7D1', 'icon': '🛍️'},
        {'name': 'Entertainment', 'color': '#96CEB4', 'icon': '🎬'},
        {'name': 'Bills & Utilities', 'color': '#FFEAA7', 'icon': '💡'},
        {'name': 'Healthcare', 'color': '#DDA0DD', 'icon': '🏥'},
        {'name': 'Education', 'color': '#FFB347', 'icon': '📚'},
        {'name': 'Travel', 'color': '#87CEEB', 'icon': '✈️'},
        {'name': 'Business', 'color': '#F0E68C', 'icon': '💼'},
        {'name': 'Other', 'color': '#D3D3D3', 'icon': '📋'}
    ]
    
    for cat_data in categories:
        if not Category.query.filter_by(name=cat_data['name']).first():
            category = Category(
                name=cat_data['name'],
                color=cat_data['color'],
                icon=cat_data['icon'],
                description=f"Expenses related to {cat_data['name'].lower()}",
                is_system=True,
                is_active=True
            )
            db.session.add(category)
    
    try:
        db.session.commit()
        print("✅ Sample categories created successfully!")
    except Exception as e:
        print(f"❌ Error creating sample categories: {e}")
        db.session.rollback()
