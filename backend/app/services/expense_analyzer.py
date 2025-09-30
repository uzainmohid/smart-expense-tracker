"""
Smart Expense Tracker - Expense Analyzer Service
Advanced analytics and insights for expense data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta, date
from collections import defaultdict
from sqlalchemy import func, extract, and_
from app.models.expense import Expense
from app.models.category import Category
from app.database import db
import logging

class ExpenseAnalyzer:
    """Advanced expense analytics and insights"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def get_dashboard_data(self, user_id, period='month'):
        """Get comprehensive dashboard data for user"""
        try:
            current_date = datetime.now()

            # Define date ranges
            if period == 'week':
                start_date = current_date - timedelta(days=7)
            elif period == 'year':
                start_date = current_date - timedelta(days=365)
            else:  # month
                start_date = current_date.replace(day=1)

            # Get expenses for the period
            expenses = Expense.query.filter(
                Expense.user_id == user_id,
                Expense.date >= start_date.date()
            ).all()

            if not expenses:
                return self._empty_dashboard_data()

            # Calculate basic metrics
            total_amount = sum(exp.amount for exp in expenses)
            total_count = len(expenses)
            avg_per_transaction = total_amount / total_count if total_count > 0 else 0

            # Get previous period for comparison
            prev_start = self._get_previous_period_start(start_date, period)
            prev_expenses = Expense.query.filter(
                Expense.user_id == user_id,
                Expense.date >= prev_start.date(),
                Expense.date < start_date.date()
            ).all()

            prev_total = sum(exp.amount for exp in prev_expenses)
            spending_change = ((total_amount - prev_total) / prev_total * 100) if prev_total > 0 else 0

            # Category breakdown
            category_data = self._get_category_breakdown(expenses)

            # Recent transactions
            recent_transactions = sorted(expenses, key=lambda x: x.date, reverse=True)[:10]

            # Spending trends
            daily_spending = self._get_daily_spending(expenses)

            # Top merchants
            merchant_data = self._get_top_merchants(expenses)

            return {
                'summary': {
                    'total_amount': round(total_amount, 2),
                    'total_count': total_count,
                    'avg_per_transaction': round(avg_per_transaction, 2),
                    'spending_change_percent': round(spending_change, 2),
                    'period': period
                },
                'category_breakdown': category_data,
                'recent_transactions': [exp.to_dict() for exp in recent_transactions],
                'daily_spending': daily_spending,
                'top_merchants': merchant_data,
                'insights': self._generate_insights(expenses, period)
            }

        except Exception as e:
            self.logger.error(f"Error getting dashboard data: {e}")
            return self._empty_dashboard_data()

    def _empty_dashboard_data(self):
        """Return empty dashboard data structure"""
        return {
            'summary': {
                'total_amount': 0,
                'total_count': 0,
                'avg_per_transaction': 0,
                'spending_change_percent': 0,
                'period': 'month'
            },
            'category_breakdown': [],
            'recent_transactions': [],
            'daily_spending': [],
            'top_merchants': [],
            'insights': []
        }

    def _get_previous_period_start(self, current_start, period):
        """Get start date for previous period"""
        if period == 'week':
            return current_start - timedelta(days=7)
        elif period == 'year':
            return current_start - timedelta(days=365)
        else:  # month
            # Previous month
            if current_start.month == 1:
                return current_start.replace(year=current_start.year - 1, month=12)
            else:
                return current_start.replace(month=current_start.month - 1)

    def _get_category_breakdown(self, expenses):
        """Get spending breakdown by category"""
        category_totals = defaultdict(float)
        category_counts = defaultdict(int)
        category_info = {}

        for expense in expenses:
            category_name = expense.category.name if expense.category else 'Other'
            category_totals[category_name] += expense.amount
            category_counts[category_name] += 1

            if category_name not in category_info and expense.category:
                category_info[category_name] = {
                    'color': expense.category.color,
                    'icon': expense.category.icon
                }

        # Calculate percentages
        total_amount = sum(category_totals.values())

        result = []
        for category, amount in category_totals.items():
            percentage = (amount / total_amount * 100) if total_amount > 0 else 0
            result.append({
                'category': category,
                'amount': round(amount, 2),
                'percentage': round(percentage, 2),
                'count': category_counts[category],
                'color': category_info.get(category, {}).get('color', '#3498db'),
                'icon': category_info.get(category, {}).get('icon', '📋')
            })

        return sorted(result, key=lambda x: x['amount'], reverse=True)

    def _get_daily_spending(self, expenses):
        """Get daily spending data for charts"""
        daily_totals = defaultdict(float)

        for expense in expenses:
            daily_totals[expense.date] += expense.amount

        # Sort by date and format for frontend
        result = []
        for exp_date, amount in sorted(daily_totals.items()):
            result.append({
                'date': exp_date.isoformat(),
                'amount': round(amount, 2)
            })

        return result

    def _get_top_merchants(self, expenses):
        """Get top merchants by spending"""
        merchant_totals = defaultdict(float)
        merchant_counts = defaultdict(int)

        for expense in expenses:
            if expense.merchant_name:
                merchant_totals[expense.merchant_name] += expense.amount
                merchant_counts[expense.merchant_name] += 1

        # Sort by amount and return top 10
        result = []
        for merchant, amount in sorted(merchant_totals.items(), key=lambda x: x[1], reverse=True)[:10]:
            result.append({
                'merchant': merchant,
                'amount': round(amount, 2),
                'count': merchant_counts[merchant]
            })

        return result

    def _generate_insights(self, expenses, period):
        """Generate AI-powered insights"""
        insights = []

        if not expenses:
            return insights

        # Calculate basic stats
        amounts = [exp.amount for exp in expenses]
        avg_amount = np.mean(amounts)
        std_amount = np.std(amounts)

        # Insight 1: Spending patterns
        category_totals = defaultdict(float)
        for exp in expenses:
            category_totals[exp.category.name if exp.category else 'Other'] += exp.amount

        top_category = max(category_totals, key=category_totals.get)
        top_category_percent = (category_totals[top_category] / sum(amounts)) * 100

        insights.append({
            'type': 'spending_pattern',
            'title': f'Top Spending Category: {top_category}',
            'message': f'You spent {top_category_percent:.1f}% of your budget on {top_category.lower()}.',
            'category': 'analysis'
        })

        # Insight 2: Unusual transactions
        unusual_threshold = avg_amount + (2 * std_amount)
        unusual_count = sum(1 for amount in amounts if amount > unusual_threshold)

        if unusual_count > 0:
            insights.append({
                'type': 'unusual_spending',
                'title': f'{unusual_count} Unusual Transaction{"s" if unusual_count > 1 else ""}',
                'message': f'You had {unusual_count} transaction{"s" if unusual_count > 1 else ""} significantly above your average.',
                'category': 'alert'
            })

        # Insight 3: Spending frequency
        if period == 'month':
            days_with_spending = len(set(exp.date for exp in expenses))
            total_days = (datetime.now().date() - min(exp.date for exp in expenses)).days + 1
            spending_frequency = (days_with_spending / total_days) * 100

            if spending_frequency > 80:
                insights.append({
                    'type': 'frequency',
                    'title': 'High Spending Frequency',
                    'message': f'You made purchases on {spending_frequency:.0f}% of days this {period}.',
                    'category': 'warning'
                })

        # Insight 4: Weekend vs Weekday spending
        weekend_spending = sum(exp.amount for exp in expenses if exp.date.weekday() >= 5)
        weekday_spending = sum(exp.amount for exp in expenses if exp.date.weekday() < 5)

        if weekend_spending > weekday_spending:
            insights.append({
                'type': 'weekend_spending',
                'title': 'Higher Weekend Spending',
                'message': f'You spend more on weekends (${weekend_spending:.0f}) than weekdays (${weekday_spending:.0f}).',
                'category': 'info'
            })

        return insights

    def get_monthly_comparison(self, user_id, months=6):
        """Get month-over-month spending comparison"""
        try:
            current_date = datetime.now()
            results = []

            for i in range(months):
                # Calculate month start/end
                if current_date.month - i <= 0:
                    year = current_date.year - 1
                    month = 12 + (current_date.month - i)
                else:
                    year = current_date.year
                    month = current_date.month - i

                # Get monthly total
                monthly_total = db.session.query(func.sum(Expense.amount)).filter(
                    Expense.user_id == user_id,
                    extract('year', Expense.date) == year,
                    extract('month', Expense.date) == month
                ).scalar() or 0

                results.append({
                    'year': year,
                    'month': month,
                    'month_name': datetime(year, month, 1).strftime('%B %Y'),
                    'total': round(monthly_total, 2)
                })

            return sorted(results, key=lambda x: (x['year'], x['month']))

        except Exception as e:
            self.logger.error(f"Error getting monthly comparison: {e}")
            return []

    def get_budget_analysis(self, user_id):
        """Analyze spending against category budgets"""
        try:
            current_date = datetime.now()
            start_of_month = current_date.replace(day=1).date()

            # Get categories with budgets
            categories_with_budgets = Category.query.filter(
                Category.monthly_budget_limit.isnot(None)
            ).all()

            budget_analysis = []

            for category in categories_with_budgets:
                # Get current month spending for this category
                current_spending = db.session.query(func.sum(Expense.amount)).filter(
                    Expense.user_id == user_id,
                    Expense.category_id == category.id,
                    Expense.date >= start_of_month
                ).scalar() or 0

                budget_used_percent = (current_spending / category.monthly_budget_limit) * 100
                remaining_budget = category.monthly_budget_limit - current_spending

                status = 'safe'
                if budget_used_percent >= 100:
                    status = 'over'
                elif budget_used_percent >= category.budget_alert_threshold * 100:
                    status = 'warning'

                budget_analysis.append({
                    'category': category.to_dict(),
                    'budget_limit': category.monthly_budget_limit,
                    'current_spending': round(current_spending, 2),
                    'budget_used_percent': round(budget_used_percent, 2),
                    'remaining_budget': round(remaining_budget, 2),
                    'status': status
                })

            return sorted(budget_analysis, key=lambda x: x['budget_used_percent'], reverse=True)

        except Exception as e:
            self.logger.error(f"Error getting budget analysis: {e}")
            return []

    def get_expense_predictions(self, user_id):
        """Get expense predictions based on historical data"""
        try:
            # Get last 6 months of data
            six_months_ago = datetime.now() - timedelta(days=180)

            expenses = Expense.query.filter(
                Expense.user_id == user_id,
                Expense.date >= six_months_ago.date()
            ).all()

            if len(expenses) < 30:
                return None

            # Prepare data for prediction
            expense_data = [exp.to_dict() for exp in expenses]

            # Use ML service for predictions
            from app.services.ml_service import MLService
            ml_service = MLService()

            predictions = ml_service.predict_future_spending(expense_data)

            return predictions

        except Exception as e:
            self.logger.error(f"Error getting expense predictions: {e}")
            return None
