"""
Smart Expense Tracker - Authentication Routes
User registration, login, and authentication management
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, create_access_token, create_refresh_token, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import re
from app.models.user import User
from app.database import db
from app.utils.validators import validate_email, validate_password
from app.utils.helpers import generate_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()

        if not data:
            return generate_response('error', 'No data provided', status_code=400)

        # Validate required fields
        required_fields = ['email', 'username', 'first_name', 'last_name', 'password']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return generate_response('error', f'Missing required fields: {", ".join(missing_fields)}', status_code=400)

        email = data['email'].lower().strip()
        username = data['username'].lower().strip()
        first_name = data['first_name'].strip()
        last_name = data['last_name'].strip()
        password = data['password']

        # Validate email format
        if not validate_email(email):
            return generate_response('error', 'Invalid email format', status_code=400)

        # Validate password strength
        password_validation = validate_password(password)
        if not password_validation['valid']:
            return generate_response('error', password_validation['message'], status_code=400)

        # Check if user already exists
        existing_user = User.query.filter(
            (User.email == email) | (User.username == username)
        ).first()

        if existing_user:
            if existing_user.email == email:
                return generate_response('error', 'Email already registered', status_code=409)
            else:
                return generate_response('error', 'Username already taken', status_code=409)

        # Create new user
        user = User(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password
        )

        # Add optional fields
        if data.get('phone'):
            user.phone = data['phone']
        if data.get('date_of_birth'):
            try:
                user.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            except ValueError:
                return generate_response('error', 'Invalid date format for date_of_birth (use YYYY-MM-DD)', status_code=400)

        user.save()

        # Create access token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=24)
        )
        refresh_token = create_refresh_token(identity=user.id)

        return generate_response('success', 'User registered successfully', {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, status_code=201)

    except Exception as e:
        current_app.logger.error(f"Registration error: {e}")
        return generate_response('error', 'Registration failed. Please try again.', status_code=500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()

        if not data:
            return generate_response('error', 'No data provided', status_code=400)

        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return generate_response('error', 'Email and password are required', status_code=400)

        email = data['email'].lower().strip()
        password = data['password']

        # Find user by email
        user = User.query.filter_by(email=email).first()

        if not user:
            return generate_response('error', 'Invalid email or password', status_code=401)

        # Check if account is active
        if not user.is_active:
            return generate_response('error', 'Account is deactivated. Please contact support.', status_code=401)

        # Check password
        if not user.check_password(password):
            user.increment_failed_login()
            return generate_response('error', 'Invalid email or password', status_code=401)

        # Check for too many failed attempts
        if user.failed_login_attempts >= 5:
            return generate_response('error', 'Account temporarily locked due to multiple failed login attempts', status_code=423)

        # Update login info
        user.update_login_info()

        # Create tokens
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=24)
        )
        refresh_token = create_refresh_token(identity=user.id)

        return generate_response('success', 'Login successful', {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        })

    except Exception as e:
        current_app.logger.error(f"Login error: {e}")
        return generate_response('error', 'Login failed. Please try again.', status_code=500)

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user or not user.is_active:
            return generate_response('error', 'User not found or inactive', status_code=404)

        new_access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=24)
        )

        return generate_response('success', 'Token refreshed successfully', {
            'access_token': new_access_token
        })

    except Exception as e:
        current_app.logger.error(f"Token refresh error: {e}")
        return generate_response('error', 'Token refresh failed', status_code=500)

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return generate_response('error', 'User not found', status_code=404)

        return generate_response('success', 'Profile retrieved successfully', {
            'user': user.to_dict(include_sensitive=True)
        })

    except Exception as e:
        current_app.logger.error(f"Get profile error: {e}")
        return generate_response('error', 'Failed to retrieve profile', status_code=500)

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return generate_response('error', 'User not found', status_code=404)

        data = request.get_json()
        if not data:
            return generate_response('error', 'No data provided', status_code=400)

        # Update allowed fields
        updatable_fields = [
            'first_name', 'last_name', 'phone', 'default_currency', 
            'timezone', 'notification_preferences'
        ]

        for field in updatable_fields:
            if field in data:
                if field == 'date_of_birth' and data[field]:
                    try:
                        user.date_of_birth = datetime.strptime(data[field], '%Y-%m-%d').date()
                    except ValueError:
                        return generate_response('error', 'Invalid date format (use YYYY-MM-DD)', status_code=400)
                else:
                    setattr(user, field, data[field])

        user.save()

        return generate_response('success', 'Profile updated successfully', {
            'user': user.to_dict(include_sensitive=True)
        })

    except Exception as e:
        current_app.logger.error(f"Update profile error: {e}")
        return generate_response('error', 'Failed to update profile', status_code=500)

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return generate_response('error', 'User not found', status_code=404)

        data = request.get_json()
        if not data:
            return generate_response('error', 'No data provided', status_code=400)

        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return generate_response('error', 'Current password and new password are required', status_code=400)

        # Verify current password
        if not user.check_password(current_password):
            return generate_response('error', 'Current password is incorrect', status_code=400)

        # Validate new password
        password_validation = validate_password(new_password)
        if not password_validation['valid']:
            return generate_response('error', password_validation['message'], status_code=400)

        # Update password
        user.set_password(new_password)
        user.save()

        return generate_response('success', 'Password changed successfully')

    except Exception as e:
        current_app.logger.error(f"Change password error: {e}")
        return generate_response('error', 'Failed to change password', status_code=500)

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (invalidate token)"""
    try:
        # In a full implementation, you would add the token to a blacklist
        # For now, we'll just return success
        return generate_response('success', 'Logged out successfully')

    except Exception as e:
        current_app.logger.error(f"Logout error: {e}")
        return generate_response('error', 'Logout failed', status_code=500)

@auth_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return generate_response('error', 'User not found', status_code=404)

        data = request.get_json()
        if not data or not data.get('password'):
            return generate_response('error', 'Password confirmation required', status_code=400)

        # Verify password
        if not user.check_password(data['password']):
            return generate_response('error', 'Incorrect password', status_code=400)

        # Soft delete - deactivate account
        user.is_active = False
        user.save()

        return generate_response('success', 'Account deactivated successfully')

    except Exception as e:
        current_app.logger.error(f"Delete account error: {e}")
        return generate_response('error', 'Failed to delete account', status_code=500)
