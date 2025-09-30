"""
Smart Expense Tracker - Service Tests
Unit tests for business logic services
"""

import pytest
from app.services.ml_service import MLService
from app.services.ocr_service import OCRService
from app.services.expense_analyzer import ExpenseAnalyzer

def test_ml_service_initialization():
    """Test ML service initialization"""
    ml_service = MLService()
    assert ml_service is not None
    assert hasattr(ml_service, 'predict_category')

def test_ocr_service_initialization():
    """Test OCR service initialization"""
    ocr_service = OCRService()
    assert ocr_service is not None
    assert hasattr(ocr_service, 'extract_text')

def test_expense_analyzer_initialization():
    """Test expense analyzer initialization"""
    analyzer = ExpenseAnalyzer()
    assert analyzer is not None
    assert hasattr(analyzer, 'get_dashboard_data')

def test_ml_service_category_prediction():
    """Test ML service category prediction"""
    ml_service = MLService()

    # Test with sample data
    description = "Starbucks coffee"
    merchant = "Starbucks"
    amount = 5.50

    category, confidence = ml_service.predict_category(description, merchant, amount)

    assert isinstance(category, str)
    assert isinstance(confidence, float)
    assert 0 <= confidence <= 1
