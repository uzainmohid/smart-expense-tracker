"""
Smart Expense Tracker - Dashboard Routes
Analytics and insights for expense data visualization
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, date
from sqlalchemy import func, extract, and_
from app.models.expense import Expense
from app.models.category import Category
from app.models.user import User
from app.database import db
from app.services.expense_analyzer import ExpenseAnalyzer
from app.services.ml_service import MLService
from app.utils.helpers import generate_response

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_dashboard_overview():
    """Get comprehensive dashboard overview"""
    try:
        current_user_id = get_jwt_identity()
        period = request.args.get('period', 'month')  # month, week, year

        analyzer = ExpenseAnalyzer()
        dashboard_data = analyzer.get_dashboard_data(current_user_id, period)

        return generate_response('success', 'Dashboard overview retrieved successfully', {
            'overview': dashboard_data
        })

    except Exception as e:
        current_app.logger.error(f"Get dashboard overview error: {e}")
        return generate_response('error', 'Failed to retrieve dashboard overview', status_code=500)

@dashboard_bp.route('/spending-trends', methods=['GET'])
@jwt_required()
def get_spending_trends():
    """Get spending trends over time"""
    try:
        current_user_id = get_jwt_identity()
        months = request.args.get('months', 12, type=int)

        # Limit months to reasonable range
        months = max(1, min(months, 24))

        trends = []
        current_date = datetime.now()

        for i in range(months):
            # Calculate month/year
            target_date = current_date - timedelta(days=30 * i)
            year = target_date.year
            month = target_date.month

            # Get monthly total
            monthly_total = db.session.query(func.sum(Expense.amount)).filter(
                Expense.user_id == current_user_id,
                extract('year', Expense.date) == year,
                extract('month', Expense.date) == month
            ).scalar() or 0

            # Get expense count
            monthly_count = db.session.query(func.count(Expense.id)).filter(
                Expense.user_id == current_user_id,
                extract('year', Expense.date) == year,
                extract('month', Expense.date) == month
            ).scalar() or 0

            trends.append({
                'year': year,
                'month': month,
                'month_name': target_date.strftime('%B %Y'),
                'total_amount': round(monthly_total, 2),
                'expense_count': monthly_count,
                'average_expense': round(monthly_total / monthly_count, 2) if monthly_count > 0 else 0
            })

        # Reverse to show chronological order
        trends.reverse()

        return generate_response('success', 'Spending trends retrieved successfully', {
            'trends': trends
        })

    except Exception as e:
        current_app.logger.error(f"Get spending trends error: {e}")
        return generate_response('error', 'Failed to retrieve spending trends', status_code=500)

@dashboard_bp.route('/category-analysis', methods=['GET'])
@jwt_required()
def get_category_analysis():
    """Get detailed category spending analysis"""
    try:
        current_user_id = get_jwt_identity()
        period = request.args.get('period', 'month')  # month, week, year, all

        # Calculate date range
        current_date = datetime.now()

        if period == 'week':
            start_date = current_date - timedelta(days=7)
        elif period == 'year':
            start_date = current_date - timedelta(days=365)
        elif period == 'month':
            start_date = current_date.replace(day=1)
        else:  # all
            start_date = None

        # Build query
        query = db.session.query(
            Category.id,
            Category.name,
            Category.color,
            Category.icon,
            func.sum(Expense.amount).label('total_amount'),
            func.count(Expense.id).label('expense_count'),
            func.avg(Expense.amount).label('average_amount'),
            func.min(Expense.date).label('first_expense'),
            func.max(Expense.date).label('last_expense')
        ).join(Expense).filter(Expense.user_id == current_user_id)

        if start_date:
            query = query.filter(Expense.date >= start_date.date())

        results = query.group_by(Category.id).order_by(func.sum(Expense.amount).desc()).all()

        # Calculate total for percentages
        total_spending = sum(result.total_amount for result in results)

        category_analysis = []
        for result in results:
            percentage = (result.total_amount / total_spending * 100) if total_spending > 0 else 0

            category_analysis.append({
                'category_id': result.id,
                'category_name': result.name,
                'color': result.color,
                'icon': result.icon,
                'total_amount': round(result.total_amount, 2),
                'expense_count': result.expense_count,
                'average_amount': round(result.average_amount, 2),
                'percentage': round(percentage, 2),
                'first_expense': result.first_expense.isoformat() if result.first_expense else None,
                'last_expense': result.last_expense.isoformat() if result.last_expense else None
            })

        return generate_response('success', 'Category analysis retrieved successfully', {
            'analysis': category_analysis,
            'total_spending': round(total_spending, 2),
            'period': period
        })

    except Exception as e:
        current_app.logger.error(f"Get category analysis error: {e}")
        return generate_response('error', 'Failed to retrieve category analysis', status_code=500)

@dashboard_bp.route('/monthly-comparison', methods=['GET'])
@jwt_required()
def get_monthly_comparison():
    """Get month-over-month spending comparison"""
    try:
        current_user_id = get_jwt_identity()
        months = request.args.get('months', 6, type=int)

        analyzer = ExpenseAnalyzer()
        comparison_data = analyzer.get_monthly_comparison(current_user_id, months)

        # Calculate changes and trends
        for i, month_data in enumerate(comparison_data):
            if i > 0:
                prev_total = comparison_data[i-1]['total']
                current_total = month_data['total']

                if prev_total > 0:
                    change_percent = ((current_total - prev_total) / prev_total) * 100
                    month_data['change_percent'] = round(change_percent, 2)
                    month_data['change_direction'] = 'up' if change_percent > 0 else 'down' if change_percent < 0 else 'same'
                else:
                    month_data['change_percent'] = 0
                    month_data['change_direction'] = 'same'
            else:
                month_data['change_percent'] = 0
                month_data['change_direction'] = 'same'

        return generate_response('success', 'Monthly comparison retrieved successfully', {
            'comparison': comparison_data
        })

    except Exception as e:
        current_app.logger.error(f"Get monthly comparison error: {e}")
        return generate_response('error', 'Failed to retrieve monthly comparison', status_code=500)

@dashboard_bp.route('/budget-analysis', methods=['GET'])
@jwt_required()
def get_budget_analysis():
    """Get budget vs actual spending analysis"""
    try:
        current_user_id = get_jwt_identity()

        analyzer = ExpenseAnalyzer()
        budget_data = analyzer.get_budget_analysis(current_user_id)

        return generate_response('success', 'Budget analysis retrieved successfully', {
            'budget_analysis': budget_data
        })

    except Exception as e:
        current_app.logger.error(f"Get budget analysis error: {e}")
        return generate_response('error', 'Failed to retrieve budget analysis', status_code=500)

@dashboard_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_spending_insights():
    """Get AI-powered spending insights"""
    try:
        current_user_id = get_jwt_identity()

        # Get user's expenses for analysis
        six_months_ago = datetime.now() - timedelta(days=180)
        expenses = Expense.query.filter(
            Expense.user_id == current_user_id,
            Expense.date >= six_months_ago.date()
        ).all()

        if not expenses:
            return generate_response('success', 'No expenses found for insights', {
                'insights': []
            })

        # Convert to format expected by ML service
        expense_data = [exp.to_dict() for exp in expenses]

        # Generate insights using ML service
        ml_service = MLService()
        insights = ml_service.get_spending_insights(expense_data)

        return generate_response('success', 'Spending insights retrieved successfully', {
            'insights': insights
        })

    except Exception as e:
        current_app.logger.error(f"Get spending insights error: {e}")
        return generate_response('error', 'Failed to retrieve spending insights', status_code=500)

@dashboard_bp.route('/predictions', methods=['GET'])
@jwt_required()
def get_spending_predictions():
    """Get future spending predictions"""
    try:
        current_user_id = get_jwt_identity()

        analyzer = ExpenseAnalyzer()
        predictions = analyzer.get_expense_predictions(current_user_id)

        if not predictions:
            return generate_response('success', 'Insufficient data for predictions', {
                'predictions': None,
                'message': 'Need at least 30 days of expense data for predictions'
            })

        return generate_response('success', 'Spending predictions retrieved successfully', {
            'predictions': predictions
        })

    except Exception as e:
        current_app.logger.error(f"Get spending predictions error: {e}")
        return generate_response('error', 'Failed to retrieve spending predictions', status_code=500)

@dashboard_bp.route('/top-merchants', methods=['GET'])
@jwt_required()
def get_top_merchants():
    """Get top merchants by spending"""
    try:
        current_user_id = get_jwt_identity()
        period = request.args.get('period', 'month')
        limit = request.args.get('limit', 10, type=int)

        # Limit the limit parameter
        limit = max(1, min(limit, 50))

        # Calculate date range
        current_date = datetime.now()
        if period == 'week':
            start_date = current_date - timedelta(days=7)
        elif period == 'year':
            start_date = current_date - timedelta(days=365)
        elif period == 'month':
            start_date = current_date.replace(day=1)
        else:  # all
            start_date = None

        # Build query
        query = db.session.query(
            Expense.merchant_name,
            func.sum(Expense.amount).label('total_amount'),
            func.count(Expense.id).label('transaction_count'),
            func.avg(Expense.amount).label('average_amount'),
            func.min(Expense.date).label('first_transaction'),
            func.max(Expense.date).label('last_transaction')
        ).filter(
            Expense.user_id == current_user_id,
            Expense.merchant_name.isnot(None),
            Expense.merchant_name != ''
        )

        if start_date:
            query = query.filter(Expense.date >= start_date.date())

        results = query.group_by(Expense.merchant_name).order_by(
            func.sum(Expense.amount).desc()
        ).limit(limit).all()

        top_merchants = []
        for result in results:
            top_merchants.append({
                'merchant_name': result.merchant_name,
                'total_amount': round(result.total_amount, 2),
                'transaction_count': result.transaction_count,
                'average_amount': round(result.average_amount, 2),
                'first_transaction': result.first_transaction.isoformat() if result.first_transaction else None,
                'last_transaction': result.last_transaction.isoformat() if result.last_transaction else None
            })

        return generate_response('success', 'Top merchants retrieved successfully', {
            'merchants': top_merchants,
            'period': period
        })

    except Exception as e:
        current_app.logger.error(f"Get top merchants error: {e}")
        return generate_response('error', 'Failed to retrieve top merchants', status_code=500)

@dashboard_bp.route('/expense-patterns', methods=['GET'])
@jwt_required()
def get_expense_patterns():
    """Get expense patterns (by day of week, time, etc.)"""
    try:
        current_user_id = get_jwt_identity()
        period = request.args.get('period', 'month')

        # Calculate date range
        current_date = datetime.now()
        if period == 'week':
            start_date = current_date - timedelta(days=7)
        elif period == 'year':
            start_date = current_date - timedelta(days=365)
        elif period == 'month':
            start_date = current_date.replace(day=1)
        else:  # all
            start_date = None

        # Get expenses
        query = Expense.query.filter(Expense.user_id == current_user_id)
        if start_date:
            query = query.filter(Expense.date >= start_date.date())

        expenses = query.all()

        if not expenses:
            return generate_response('success', 'No expenses found for pattern analysis', {
                'patterns': {}
            })

        # Analyze patterns
        from collections import defaultdict

        # Day of week pattern
        day_of_week_spending = defaultdict(float)
        day_of_week_count = defaultdict(int)

        # Daily pattern (by day of month)
        daily_spending = defaultdict(float)
        daily_count = defaultdict(int)

        for expense in expenses:
            # Day of week (0=Monday, 6=Sunday)
            day_of_week = expense.date.weekday()
            day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            day_name = day_names[day_of_week]

            day_of_week_spending[day_name] += expense.amount
            day_of_week_count[day_name] += 1

            # Day of month
            day_of_month = expense.date.day
            daily_spending[day_of_month] += expense.amount
            daily_count[day_of_month] += 1

        # Format day of week data
        dow_data = []
        for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']:
            total = day_of_week_spending[day]
            count = day_of_week_count[day]
            avg = total / count if count > 0 else 0

            dow_data.append({
                'day': day,
                'total_amount': round(total, 2),
                'transaction_count': count,
                'average_amount': round(avg, 2)
            })

        # Format daily data (top 10 days by spending)
        daily_data = []
        for day in sorted(daily_spending.keys(), key=lambda x: daily_spending[x], reverse=True)[:10]:
            total = daily_spending[day]
            count = daily_count[day]
            avg = total / count if count > 0 else 0

            daily_data.append({
                'day_of_month': day,
                'total_amount': round(total, 2),
                'transaction_count': count,
                'average_amount': round(avg, 2)
            })

        patterns = {
            'day_of_week': dow_data,
            'top_spending_days': daily_data,
            'analysis': {
                'most_expensive_day': max(dow_data, key=lambda x: x['total_amount'])['day'],
                'most_active_day': max(dow_data, key=lambda x: x['transaction_count'])['day'],
                'weekend_vs_weekday': {
                    'weekend_total': round(day_of_week_spending['Saturday'] + day_of_week_spending['Sunday'], 2),
                    'weekday_total': round(sum(day_of_week_spending[day] for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']), 2)
                }
            }
        }

        return generate_response('success', 'Expense patterns retrieved successfully', {
            'patterns': patterns,
            'period': period
        })

    except Exception as e:
        current_app.logger.error(f"Get expense patterns error: {e}")
        return generate_response('error', 'Failed to retrieve expense patterns', status_code=500)

@dashboard_bp.route('/export-data', methods=['GET'])
@jwt_required()
def export_dashboard_data():
    """Export dashboard data for external analysis"""
    try:
        current_user_id = get_jwt_identity()
        format_type = request.args.get('format', 'json')  # json or csv
        period = request.args.get('period', 'all')

        # Calculate date range
        current_date = datetime.now()
        if period == 'week':
            start_date = current_date - timedelta(days=7)
        elif period == 'month':
            start_date = current_date.replace(day=1)
        elif period == 'year':
            start_date = current_date - timedelta(days=365)
        else:  # all
            start_date = None

        # Get expenses
        query = Expense.query.filter(Expense.user_id == current_user_id)
        if start_date:
            query = query.filter(Expense.date >= start_date.date())

        expenses = query.order_by(Expense.date.desc()).all()

        if format_type == 'csv':
            # Return CSV format instructions
            return generate_response('success', 'Use the expenses API with CSV format', {
                'message': 'For CSV export, use the /api/expenses endpoint with format=csv parameter',
                'url': '/api/expenses?format=csv'
            })

        # JSON format
        export_data = {
            'export_date': datetime.now().isoformat(),
            'period': period,
            'total_expenses': len(expenses),
            'expenses': [expense.to_dict() for expense in expenses],
            'summary': {
                'total_amount': sum(exp.amount for exp in expenses),
                'date_range': {
                    'start': start_date.isoformat() if start_date else None,
                    'end': current_date.isoformat()
                }
            }
        }

        return generate_response('success', 'Dashboard data exported successfully', {
            'export_data': export_data
        })

    except Exception as e:
        current_app.logger.error(f"Export dashboard data error: {e}")
        return generate_response('error', 'Failed to export dashboard data', status_code=500)
