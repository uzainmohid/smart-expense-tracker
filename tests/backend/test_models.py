"""
Smart Expense Tracker - Model Tests
Unit tests for database models
"""

import pytest
from datetime import date, datetime
from app.models.user import User
from app.models.category import Category
from app.models.expense import Expense
from app.database import db

def test_user_creation():
    """Test user model creation"""
    user = User(
        email="test@example.com",
        username="testuser",
        first_name="Test",
        last_name="User",
        password="TestPassword123!"
    )

    assert user.email == "test@example.com"
    assert user.username == "testuser"
    assert user.first_name == "Test"
    assert user.last_name == "User"
    assert user.check_password("TestPassword123!")
    assert not user.check_password("wrongpassword")

def test_category_creation():
    """Test category model creation"""
    category = Category(
        name="Food & Dining",
        description="Food related expenses",
        color="#ff6b6b",
        icon="🍽️"
    )

    assert category.name == "Food & Dining"
    assert category.description == "Food related expenses"
    assert category.color == "#ff6b6b"
    assert category.icon == "🍽️"

def test_expense_creation():
    """Test expense model creation"""
    expense = Expense(
        user_id=1,
        category_id=1,
        description="Lunch at restaurant",
        amount=25.50,
        currency="USD",
        date=date.today()
    )

    assert expense.user_id == 1
    assert expense.category_id == 1
    assert expense.description == "Lunch at restaurant"
    assert expense.amount == 25.50
    assert expense.currency == "USD"
    assert expense.date == date.today()
