"""
WSGI configuration for Smart Expense Tracker
Used for production deployment with Gunicorn
"""

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
