"""
Smart Expense Tracker - Helper Functions
Common utility functions for the application
"""

from flask import jsonify
import os
import secrets
import string
from datetime import datetime
import re
from werkzeug.utils import secure_filename as werkzeug_secure_filename

def generate_response(status, message, data=None, status_code=200):
    """Generate standardized API response"""
    response = {
        'status': status,
        'message': message,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }

    if data is not None:
        response['data'] = data

    return jsonify(response), status_code

def allowed_file(filename, allowed_extensions=None):
    """Check if file has allowed extension"""
    if allowed_extensions is None:
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

    return '.' in filename and            filename.rsplit('.', 1)[1].lower() in allowed_extensions

def secure_filename(filename):
    """Create secure filename for uploaded files"""
    if not filename:
        return 'unnamed_file'

    # Use werkzeug's secure_filename as base
    filename = werkzeug_secure_filename(filename)

    # Add timestamp to avoid conflicts
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Split filename and extension
    if '.' in filename:
        name, ext = filename.rsplit('.', 1)
        return f"{name}_{timestamp}.{ext}"
    else:
        return f"{filename}_{timestamp}"

def generate_unique_filename(original_filename, upload_dir):
    """Generate unique filename that doesn't exist in upload directory"""
    base_filename = secure_filename(original_filename)
    filename = base_filename
    counter = 1

    while os.path.exists(os.path.join(upload_dir, filename)):
        if '.' in base_filename:
            name, ext = base_filename.rsplit('.', 1)
            filename = f"{name}_{counter}.{ext}"
        else:
            filename = f"{base_filename}_{counter}"
        counter += 1

    return filename

def generate_random_string(length=12):
    """Generate random string for API keys, tokens, etc."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def format_currency(amount, currency='USD'):
    """Format amount as currency string"""
    try:
        amount = float(amount)

        # Currency symbols mapping
        symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
            'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥'
        }

        symbol = symbols.get(currency.upper(), currency.upper() + ' ')

        if currency.upper() in ['JPY', 'KRW']:  # No decimal places for these currencies
            return f"{symbol}{amount:,.0f}"
        else:
            return f"{symbol}{amount:,.2f}"

    except (ValueError, TypeError):
        return str(amount)

def parse_amount_from_text(text):
    """Extract monetary amount from text"""
    if not text:
        return None

    # Pattern to match amounts like $123.45, 123.45, $123, etc.
    patterns = [
        r'\$([\d,]+\.\d{2})',  # $123.45
        r'\$([\d,]+)',          # $123
        r'([\d,]+\.\d{2})',    # 123.45
        r'([\d,]+)'              # 123
    ]

    for pattern in patterns:
        matches = re.findall(pattern, text)
        if matches:
            try:
                # Take the largest amount found
                amounts = [float(match.replace(',', '')) for match in matches]
                return max(amounts)
            except ValueError:
                continue

    return None

def calculate_percentage_change(old_value, new_value):
    """Calculate percentage change between two values"""
    try:
        old_value = float(old_value)
        new_value = float(new_value)

        if old_value == 0:
            return 100 if new_value > 0 else 0

        return ((new_value - old_value) / old_value) * 100

    except (ValueError, TypeError, ZeroDivisionError):
        return 0

def get_date_range_label(start_date, end_date):
    """Get human-readable label for date range"""
    try:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

        # Same day
        if start_date == end_date:
            return start_date.strftime('%B %d, %Y')

        # Same month
        if start_date.month == end_date.month and start_date.year == end_date.year:
            return f"{start_date.strftime('%B %d')} - {end_date.strftime('%d, %Y')}"

        # Same year
        if start_date.year == end_date.year:
            return f"{start_date.strftime('%B %d')} - {end_date.strftime('%B %d, %Y')}"

        # Different years
        return f"{start_date.strftime('%B %d, %Y')} - {end_date.strftime('%B %d, %Y')}"

    except (ValueError, AttributeError):
        return f"{start_date} - {end_date}"

def clean_merchant_name(merchant_name):
    """Clean and standardize merchant name from OCR"""
    if not merchant_name:
        return None

    # Remove common OCR artifacts
    merchant_name = re.sub(r'[^a-zA-Z0-9\s&.-]', '', merchant_name)

    # Remove extra whitespace
    merchant_name = ' '.join(merchant_name.split())

    # Capitalize properly
    merchant_name = merchant_name.title()

    # Handle common abbreviations
    replacements = {
        'Llc': 'LLC',
        'Inc': 'Inc.',
        'Corp': 'Corp.',
        'Co ': 'Co. ',
        'And': '&'
    }

    for old, new in replacements.items():
        merchant_name = merchant_name.replace(old, new)

    return merchant_name.strip() if len(merchant_name.strip()) > 1 else None

def extract_keywords_from_text(text, max_keywords=10):
    """Extract keywords from text for categorization"""
    if not text:
        return []

    # Convert to lowercase and remove special characters
    text = re.sub(r'[^a-zA-Z\s]', ' ', text.lower())

    # Split into words
    words = text.split()

    # Remove common stop words
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
        'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may',
        'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    }

    # Filter words
    keywords = []
    for word in words:
        if (len(word) > 2 and 
            word not in stop_words and 
            not word.isdigit() and
            word not in keywords):
            keywords.append(word)

    return keywords[:max_keywords]

def validate_json_structure(data, required_fields, optional_fields=None):
    """Validate JSON data structure"""
    if not isinstance(data, dict):
        return {'valid': False, 'message': 'Data must be a JSON object'}

    if optional_fields is None:
        optional_fields = []

    # Check required fields
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)

    if missing_fields:
        return {
            'valid': False, 
            'message': f'Missing required fields: {", ".join(missing_fields)}'
        }

    # Check for unexpected fields
    allowed_fields = set(required_fields + optional_fields)
    extra_fields = set(data.keys()) - allowed_fields

    if extra_fields:
        return {
            'valid': False,
            'message': f'Unexpected fields: {", ".join(extra_fields)}'
        }

    return {'valid': True}

def paginate_query(query, page=1, per_page=20, max_per_page=100):
    """Paginate SQLAlchemy query"""
    if per_page > max_per_page:
        per_page = max_per_page

    if page < 1:
        page = 1

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        'items': items,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'has_prev': page > 1,
            'has_next': page * per_page < total
        }
    }

def log_user_action(user_id, action, details=None):
    """Log user action for audit trail"""
    # In a full implementation, this would write to an audit log table
    # For now, we'll just use application logging
    import logging

    logger = logging.getLogger('user_actions')

    log_message = f"User {user_id}: {action}"
    if details:
        log_message += f" - {details}"

    logger.info(log_message)
