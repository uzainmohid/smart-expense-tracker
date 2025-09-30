"""
Smart Expense Tracker - Route Tests
Unit tests for API endpoints
"""

import pytest
import json
from app import create_app
from app.database import db

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_register_user(client):
    """Test user registration"""
    user_data = {
        'email': 'test@example.com',
        'username': 'testuser',
        'first_name': 'Test',
        'last_name': 'User',
        'password': 'TestPassword123!'
    }

    response = client.post('/api/auth/register', 
                          data=json.dumps(user_data),
                          content_type='application/json')

    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['status'] == 'success'
    assert 'access_token' in data['data']

def test_login_user(client):
    """Test user login"""
    # First register a user
    user_data = {
        'email': 'test@example.com',
        'username': 'testuser',
        'first_name': 'Test',
        'last_name': 'User',
        'password': 'TestPassword123!'
    }

    client.post('/api/auth/register', 
               data=json.dumps(user_data),
               content_type='application/json')

    # Then login
    login_data = {
        'email': 'test@example.com',
        'password': 'TestPassword123!'
    }

    response = client.post('/api/auth/login',
                          data=json.dumps(login_data),
                          content_type='application/json')

    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'success'
    assert 'access_token' in data['data']
