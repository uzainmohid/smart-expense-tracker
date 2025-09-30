"""
Smart Expense Tracker - Expense Routes
CRUD operations for expense management
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, timedelta
from app.models.expense import Expense
from app.models.category import Category
from app.models.user import User
from app.database import db
from app.utils.validators import (
    validate_amount, validate_description, validate_date,
    validate_category_id, validate_tags
)
from app.utils.helpers import generate_response, paginate_query
from app.services.ml_service import MLService

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('', methods=['GET'])
@jwt_required()
def get_expenses():
    """Get user's expenses with filtering and pagination"""
    try:
        current_user_id = get_jwt_identity()

        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category_id = request.args.get('category_id', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        search = request.args.get('search', '').strip()
        sort_by = request.args.get('sort_by', 'date')
        sort_order = request.args.get('sort_order', 'desc')

        # Build query
        query = Expense.query.filter_by(user_id=current_user_id)

        # Apply filters
        if category_id:
            query = query.filter_by(category_id=category_id)

        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(Expense.date >= start_date_obj)
            except ValueError:
                return generate_response('error', 'Invalid start_date format. Use YYYY-MM-DD', status_code=400)

        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(Expense.date <= end_date_obj)
            except ValueError:
                return generate_response('error', 'Invalid end_date format. Use YYYY-MM-DD', status_code=400)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Expense.description.ilike(search_term),
                    Expense.merchant_name.ilike(search_term),
                    Expense.notes.ilike(search_term)
                )
            )

        # Apply sorting
        if sort_by == 'amount':
            if sort_order == 'asc':
                query = query.order_by(Expense.amount.asc())
            else:
                query = query.order_by(Expense.amount.desc())
        elif sort_by == 'category':
            query = query.join(Category).order_by(
                Category.name.asc() if sort_order == 'asc' else Category.name.desc()
            )
        else:  # sort by date (default)
            if sort_order == 'asc':
                query = query.order_by(Expense.date.asc(), Expense.created_at.asc())
            else:
                query = query.order_by(Expense.date.desc(), Expense.created_at.desc())

        # Paginate results
        result = paginate_query(query, page=page, per_page=per_page)

        # Convert to dictionaries
        expenses_data = [expense.to_dict() for expense in result['items']]

        return generate_response('success', 'Expenses retrieved successfully', {
            'expenses': expenses_data,
            'pagination': result['pagination']
        })

    except Exception as e:
        current_app.logger.error(f"Get expenses error: {e}")
        return generate_response('error', 'Failed to retrieve expenses', status_code=500)

@expenses_bp.route('', methods=['POST'])
@jwt_required()
def create_expense():
    """Create a new expense"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return generate_response('error', 'No data provided', status_code=400)

        # Validate required fields
        description_validation = validate_description(data.get('description'))
        if not description_validation['valid']:
            return generate_response('error', description_validation['message'], status_code=400)

        amount_validation = validate_amount(data.get('amount'))
        if not amount_validation['valid']:
            return generate_response('error', amount_validation['message'], status_code=400)

        category_validation = validate_category_id(data.get('category_id'))
        if not category_validation['valid']:
            return generate_response('error', category_validation['message'], status_code=400)

        # Validate category exists and belongs to user or is system category
        category = Category.query.get(category_validation['category_id'])
        if not category or not category.is_active:
            return generate_response('error', 'Invalid category', status_code=400)

        # Validate optional date
        expense_date = date.today()
        if data.get('date'):
            date_validation = validate_date(data['date'])
            if not date_validation['valid']:
                return generate_response('error', date_validation['message'], status_code=400)
            expense_date = date_validation['date']

        # Validate optional tags
        tags_validation = validate_tags(data.get('tags'))
        if not tags_validation['valid']:
            return generate_response('error', tags_validation['message'], status_code=400)

        # Create expense
        expense = Expense(
            user_id=current_user_id,
            category_id=category_validation['category_id'],
            description=description_validation['description'],
            amount=amount_validation['amount'],
            date=expense_date,
            currency=data.get('currency', 'USD').upper(),
            merchant_name=data.get('merchant_name'),
            payment_method=data.get('payment_method'),
            notes=data.get('notes'),
            location=data.get('location'),
            tax_amount=float(data.get('tax_amount', 0)),
            tip_amount=float(data.get('tip_amount', 0)),
            is_business_expense=data.get('is_business_expense', False),
            is_tax_deductible=data.get('is_tax_deductible', False),
            is_reimbursable=data.get('is_reimbursable', False)
        )

        # Set tags
        if tags_validation['tags']:
            expense.set_tags_list(tags_validation['tags'])

        expense.save()

        return generate_response('success', 'Expense created successfully', {
            'expense': expense.to_dict()
        }, status_code=201)

    except Exception as e:
        current_app.logger.error(f"Create expense error: {e}")
        return generate_response('error', 'Failed to create expense', status_code=500)

@expenses_bp.route('/<int:expense_id>', methods=['GET'])
@jwt_required()
def get_expense(expense_id):
    """Get a specific expense"""
    try:
        current_user_id = get_jwt_identity()

        expense = Expense.query.filter_by(id=expense_id, user_id=current_user_id).first()
        if not expense:
            return generate_response('error', 'Expense not found', status_code=404)

        return generate_response('success', 'Expense retrieved successfully', {
            'expense': expense.to_dict(include_receipt=True)
        })

    except Exception as e:
        current_app.logger.error(f"Get expense error: {e}")
        return generate_response('error', 'Failed to retrieve expense', status_code=500)

@expenses_bp.route('/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    """Update an existing expense"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return generate_response('error', 'No data provided', status_code=400)

        expense = Expense.query.filter_by(id=expense_id, user_id=current_user_id).first()
        if not expense:
            return generate_response('error', 'Expense not found', status_code=404)

        # Update fields if provided
        if 'description' in data:
            description_validation = validate_description(data['description'])
            if not description_validation['valid']:
                return generate_response('error', description_validation['message'], status_code=400)
            expense.description = description_validation['description']

        if 'amount' in data:
            amount_validation = validate_amount(data['amount'])
            if not amount_validation['valid']:
                return generate_response('error', amount_validation['message'], status_code=400)
            expense.amount = amount_validation['amount']

        if 'category_id' in data:
            category_validation = validate_category_id(data['category_id'])
            if not category_validation['valid']:
                return generate_response('error', category_validation['message'], status_code=400)

            category = Category.query.get(category_validation['category_id'])
            if not category or not category.is_active:
                return generate_response('error', 'Invalid category', status_code=400)

            expense.category_id = category_validation['category_id']

        if 'date' in data:
            date_validation = validate_date(data['date'])
            if not date_validation['valid']:
                return generate_response('error', date_validation['message'], status_code=400)
            expense.date = date_validation['date']

        if 'tags' in data:
            tags_validation = validate_tags(data['tags'])
            if not tags_validation['valid']:
                return generate_response('error', tags_validation['message'], status_code=400)
            expense.set_tags_list(tags_validation['tags'])

        # Update other optional fields
        optional_fields = [
            'merchant_name', 'payment_method', 'notes', 'location',
            'is_business_expense', 'is_tax_deductible', 'is_reimbursable'
        ]

        for field in optional_fields:
            if field in data:
                setattr(expense, field, data[field])

        if 'tax_amount' in data:
            expense.tax_amount = float(data['tax_amount'])

        if 'tip_amount' in data:
            expense.tip_amount = float(data['tip_amount'])

        expense.last_modified_by = 'user'
        expense.save()

        return generate_response('success', 'Expense updated successfully', {
            'expense': expense.to_dict()
        })

    except Exception as e:
        current_app.logger.error(f"Update expense error: {e}")
        return generate_response('error', 'Failed to update expense', status_code=500)

@expenses_bp.route('/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    """Delete an expense"""
    try:
        current_user_id = get_jwt_identity()

        expense = Expense.query.filter_by(id=expense_id, user_id=current_user_id).first()
        if not expense:
            return generate_response('error', 'Expense not found', status_code=404)

        expense.delete()

        return generate_response('success', 'Expense deleted successfully')

    except Exception as e:
        current_app.logger.error(f"Delete expense error: {e}")
        return generate_response('error', 'Failed to delete expense', status_code=500)

@expenses_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get all available categories"""
    try:
        current_user_id = get_jwt_identity()

        categories = Category.query.filter_by(is_active=True).order_by(
            Category.sort_order.asc(), Category.name.asc()
        ).all()

        categories_data = [
            category.to_dict(include_stats=True, user_id=current_user_id) 
            for category in categories
        ]

        return generate_response('success', 'Categories retrieved successfully', {
            'categories': categories_data
        })

    except Exception as e:
        current_app.logger.error(f"Get categories error: {e}")
        return generate_response('error', 'Failed to retrieve categories', status_code=500)

@expenses_bp.route('/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete_expenses():
    """Delete multiple expenses"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data or not data.get('expense_ids'):
            return generate_response('error', 'No expense IDs provided', status_code=400)

        expense_ids = data['expense_ids']
        if not isinstance(expense_ids, list):
            return generate_response('error', 'expense_ids must be an array', status_code=400)

        # Validate all IDs belong to the user
        expenses = Expense.query.filter(
            Expense.id.in_(expense_ids),
            Expense.user_id == current_user_id
        ).all()

        if len(expenses) != len(expense_ids):
            return generate_response('error', 'Some expenses not found or not authorized', status_code=400)

        # Delete all expenses
        for expense in expenses:
            expense.delete()

        return generate_response('success', f'{len(expenses)} expenses deleted successfully')

    except Exception as e:
        current_app.logger.error(f"Bulk delete expenses error: {e}")
        return generate_response('error', 'Failed to delete expenses', status_code=500)

@expenses_bp.route('/suggest-category', methods=['POST'])
@jwt_required()
def suggest_category():
    """Get AI-suggested category for expense"""
    try:
        data = request.get_json()

        if not data:
            return generate_response('error', 'No data provided', status_code=400)

        description = data.get('description', '')
        merchant_name = data.get('merchant_name', '')
        amount = data.get('amount', 0)

        if not description and not merchant_name:
            return generate_response('error', 'Description or merchant name required', status_code=400)

        # Use ML service to predict category
        ml_service = MLService()
        predicted_category, confidence = ml_service.predict_category(
            description, merchant_name, amount
        )

        # Find the category object
        category = Category.query.filter_by(name=predicted_category, is_active=True).first()

        if category:
            return generate_response('success', 'Category suggestion retrieved', {
                'suggested_category': category.to_dict(),
                'confidence_score': round(confidence, 2)
            })
        else:
            # Fallback to default category
            default_category = Category.query.filter_by(name='Other', is_active=True).first()
            return generate_response('success', 'Category suggestion retrieved', {
                'suggested_category': default_category.to_dict() if default_category else None,
                'confidence_score': 0.3
            })

    except Exception as e:
        current_app.logger.error(f"Suggest category error: {e}")
        return generate_response('error', 'Failed to suggest category', status_code=500)

@expenses_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_expense_stats():
    """Get expense statistics"""
    try:
        current_user_id = get_jwt_identity()
        period = request.args.get('period', 'month')  # month, week, year

        # Calculate date range
        current_date = datetime.now()
        if period == 'week':
            start_date = current_date - timedelta(days=7)
        elif period == 'year':
            start_date = current_date - timedelta(days=365)
        else:  # month
            start_date = current_date.replace(day=1)

        # Get expenses for the period
        expenses = Expense.query.filter(
            Expense.user_id == current_user_id,
            Expense.date >= start_date.date()
        ).all()

        if not expenses:
            return generate_response('success', 'No expenses found for this period', {
                'stats': {
                    'total_amount': 0,
                    'total_count': 0,
                    'average_amount': 0,
                    'period': period
                }
            })

        # Calculate statistics
        amounts = [expense.amount for expense in expenses]
        total_amount = sum(amounts)
        total_count = len(amounts)
        average_amount = total_amount / total_count if total_count > 0 else 0

        # Category breakdown
        from collections import defaultdict
        category_totals = defaultdict(float)
        for expense in expenses:
            category_name = expense.category.name if expense.category else 'Other'
            category_totals[category_name] += expense.amount

        top_categories = sorted(
            category_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        stats = {
            'total_amount': round(total_amount, 2),
            'total_count': total_count,
            'average_amount': round(average_amount, 2),
            'period': period,
            'top_categories': [
                {'category': cat, 'amount': round(amount, 2)}
                for cat, amount in top_categories
            ]
        }

        return generate_response('success', 'Statistics retrieved successfully', {
            'stats': stats
        })

    except Exception as e:
        current_app.logger.error(f"Get expense stats error: {e}")
        return generate_response('error', 'Failed to retrieve statistics', status_code=500)
