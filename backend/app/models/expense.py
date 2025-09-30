from app.database import db, BaseModel, TimestampMixin
from datetime import date

class Expense(BaseModel, TimestampMixin):
    __tablename__ = 'expenses'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD', nullable=False)
    date = db.Column(db.Date, default=date.today, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='expenses')
    category = db.relationship('Category', backref='expenses')
    
    def __init__(self, user_id, category_id, description, amount, currency='USD', date=None):
        self.user_id = user_id
        self.category_id = category_id
        self.description = description
        self.amount = float(amount)
        self.currency = currency
        self.date = date if date else date.today()
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'description': self.description,
            'amount': self.amount,
            'currency': self.currency,
            'date': self.date.isoformat(),
            'notes': self.notes
        }
