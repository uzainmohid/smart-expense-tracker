from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///expense_tracker.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    from app.database import db
    db.init_app(app)
    
    CORS(app)
    
    # Basic routes
    @app.route('/')
    def index():
        return {'message': 'Smart Expense Tracker API', 'status': 'running'}
    
    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'service': 'Smart Expense Tracker API'}
    
    @app.route('/api/categories')
    def get_categories():
        try:
            from app.models.category import Category
            categories = Category.query.filter_by(is_active=True).all()
            return {
                'status': 'success',
                'data': [cat.to_dict() for cat in categories]
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}, 500
    
    return app

# Import this for external use
from app.database import db
