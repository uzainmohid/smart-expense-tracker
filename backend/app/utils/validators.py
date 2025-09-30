"""
Smart Expense Tracker - Validators
Input validation functions
"""

import re
from datetime import datetime

def validate_email(email):
    """Validate email format"""
    if not email or not isinstance(email, str):
        return False

    # Basic email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email.strip()) is not None

def validate_password(password):
    """Validate password strength"""
    if not password or not isinstance(password, str):
        return {'valid': False, 'message': 'Password is required'}

    # Password requirements
    min_length = 8
    max_length = 128

    if len(password) < min_length:
        return {'valid': False, 'message': f'Password must be at least {min_length} characters long'}

    if len(password) > max_length:
        return {'valid': False, 'message': f'Password must be less than {max_length} characters long'}

    # Check for required character types
    has_upper = bool(re.search(r'[A-Z]', password))
    has_lower = bool(re.search(r'[a-z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_special = bool(re.search(r'[!@#$%^&*()_+{}\[\]:;<>,.?~`-]', password))

    missing_requirements = []
    if not has_upper:
        missing_requirements.append('uppercase letter')
    if not has_lower:
        missing_requirements.append('lowercase letter')
    if not has_digit:
        missing_requirements.append('number')
    if not has_special:
        missing_requirements.append('special character')

    if missing_requirements:
        return {
            'valid': False,
            'message': f'Password must contain at least one: {", ".join(missing_requirements)}'
        }

    # Check for common weak passwords
    weak_passwords = [
        'password', '12345678', 'qwerty123', 'abc123456',
        'password123', 'admin123', 'welcome123'
    ]

    if password.lower() in weak_passwords:
        return {'valid': False, 'message': 'Password is too common. Please choose a stronger password'}

    return {'valid': True, 'message': 'Password is valid'}

def validate_phone(phone):
    """Validate phone number format"""
    if not phone:
        return True  # Phone is optional

    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone)

    # Check if it's a valid US phone number (10 or 11 digits)
    if len(digits_only) == 10:
        return True
    elif len(digits_only) == 11 and digits_only[0] == '1':
        return True

    return False

def validate_amount(amount):
    """Validate expense amount"""
    try:
        amount_float = float(amount)
        if amount_float <= 0:
            return {'valid': False, 'message': 'Amount must be greater than 0'}
        if amount_float > 1000000:  # 1 million limit
            return {'valid': False, 'message': 'Amount is too large'}
        return {'valid': True, 'amount': round(amount_float, 2)}
    except (ValueError, TypeError):
        return {'valid': False, 'message': 'Invalid amount format'}

def validate_currency(currency):
    """Validate currency code"""
    valid_currencies = {
        'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR',
        'BRL', 'MXN', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK',
        'HUF', 'RUB', 'ZAR', 'KRW', 'SGD', 'HKD', 'NZD', 'TRY'
    }

    if not currency or currency.upper() not in valid_currencies:
        return False

    return True

def validate_date(date_str):
    """Validate date format (YYYY-MM-DD)"""
    if not date_str:
        return {'valid': False, 'message': 'Date is required'}

    try:
        parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()

        # Check if date is not in the future
        if parsed_date > datetime.now().date():
            return {'valid': False, 'message': 'Date cannot be in the future'}

        # Check if date is not too old (10 years)
        ten_years_ago = datetime.now().replace(year=datetime.now().year - 10).date()
        if parsed_date < ten_years_ago:
            return {'valid': False, 'message': 'Date cannot be more than 10 years ago'}

        return {'valid': True, 'date': parsed_date}
    except ValueError:
        return {'valid': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}

def validate_category_id(category_id):
    """Validate category ID"""
    try:
        cat_id = int(category_id)
        if cat_id <= 0:
            return {'valid': False, 'message': 'Invalid category ID'}
        return {'valid': True, 'category_id': cat_id}
    except (ValueError, TypeError):
        return {'valid': False, 'message': 'Category ID must be a number'}

def validate_description(description):
    """Validate expense description"""
    if not description or not isinstance(description, str):
        return {'valid': False, 'message': 'Description is required'}

    description = description.strip()

    if len(description) < 1:
        return {'valid': False, 'message': 'Description cannot be empty'}

    if len(description) > 255:
        return {'valid': False, 'message': 'Description is too long (maximum 255 characters)'}

    return {'valid': True, 'description': description}

def validate_tags(tags):
    """Validate tags array"""
    if not tags:
        return {'valid': True, 'tags': []}

    if not isinstance(tags, list):
        return {'valid': False, 'message': 'Tags must be an array'}

    if len(tags) > 10:
        return {'valid': False, 'message': 'Maximum 10 tags allowed'}

    validated_tags = []
    for tag in tags:
        if not isinstance(tag, str):
            return {'valid': False, 'message': 'All tags must be strings'}

        tag = tag.strip()
        if len(tag) < 1:
            continue

        if len(tag) > 50:
            return {'valid': False, 'message': 'Tag is too long (maximum 50 characters)'}

        validated_tags.append(tag)

    return {'valid': True, 'tags': validated_tags}

def validate_file_upload(file):
    """Validate uploaded file"""
    if not file:
        return {'valid': False, 'message': 'No file uploaded'}

    if file.filename == '':
        return {'valid': False, 'message': 'No file selected'}

    # Check file extension
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
    if '.' not in file.filename or        file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return {'valid': False, 'message': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}

    # Check file size (16MB limit)
    file.seek(0, 2)  # Seek to end of file
    size = file.tell()
    file.seek(0)  # Reset file pointer

    max_size = 16 * 1024 * 1024  # 16MB
    if size > max_size:
        return {'valid': False, 'message': 'File is too large (maximum 16MB)'}

    return {'valid': True, 'file': file}

def sanitize_filename(filename):
    """Sanitize filename for safe storage"""
    if not filename:
        return 'unnamed_file'

    # Remove directory path
    filename = filename.split('/')[-1].split('\\')[-1]

    # Replace spaces and special characters
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)

    # Limit length
    if len(filename) > 100:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:95] + '.' + ext if ext else name[:100]

    return filename
