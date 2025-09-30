from app.database import db, BaseModel, TimestampMixin

class Category(BaseModel, TimestampMixin):
    __tablename__ = 'categories'
    
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(7), default='#3498db', nullable=False)
    icon = db.Column(db.String(10), default='📋', nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_system = db.Column(db.Boolean, default=False, nullable=False)
    
    def __init__(self, name, description=None, color='#3498db', icon='📋', is_active=True, is_system=False):
        self.name = name
        self.description = description
        self.color = color
        self.icon = icon
        self.is_active = is_active
        self.is_system = is_system
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'is_active': self.is_active,
            'is_system': self.is_system
        }
