"""
Smart Expense Tracker - Upload Routes
File upload and OCR processing for receipts
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from app.models.expense import Expense
from app.models.category import Category
from app.models.user import User
from app.database import db
from app.services.ocr_service import OCRService
from app.services.ml_service import MLService
from app.utils.helpers import generate_response, generate_unique_filename
from app.utils.validators import validate_file_upload

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/receipt', methods=['POST'])
@jwt_required()
def upload_receipt():
    """Upload and process receipt image"""
    try:
        current_user_id = get_jwt_identity()

        # Check if file was uploaded
        if 'file' not in request.files:
            return generate_response('error', 'No file uploaded', status_code=400)

        file = request.files['file']

        # Validate file
        file_validation = validate_file_upload(file)
        if not file_validation['valid']:
            return generate_response('error', file_validation['message'], status_code=400)

        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.instance_path, 'uploads', str(current_user_id))
        os.makedirs(upload_dir, exist_ok=True)

        # Generate unique filename
        original_filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]

        # Split filename and extension
        if '.' in original_filename:
            name, ext = original_filename.rsplit('.', 1)
            filename = f"{name}_{timestamp}_{unique_id}.{ext}"
        else:
            filename = f"{original_filename}_{timestamp}_{unique_id}"

        file_path = os.path.join(upload_dir, filename)

        # Save the file
        file.save(file_path)

        # Process with OCR
        ocr_service = OCRService()
        extracted_data = ocr_service.extract_receipt_data(file_path)

        # Get AI category suggestion if ML is enabled
        suggested_category = None
        confidence_score = 0.0

        if current_app.config.get('ENABLE_AI_CATEGORIZATION', True):
            ml_service = MLService()
            category_name, confidence_score = ml_service.predict_category(
                extracted_data.get('raw_text', ''),
                extracted_data.get('merchant_name', ''),
                extracted_data.get('total_amount', 0)
            )

            suggested_category = Category.query.filter_by(
                name=category_name, is_active=True
            ).first()

        # Store relative path for database
        relative_path = os.path.relpath(file_path, current_app.instance_path)

        # Prepare response data
        response_data = {
            'file_id': unique_id,
            'filename': filename,
            'file_path': relative_path,
            'extracted_data': {
                'merchant_name': extracted_data.get('merchant_name'),
                'total_amount': extracted_data.get('total_amount'),
                'date': extracted_data['date'].isoformat() if extracted_data.get('date') else None,
                'tax_amount': extracted_data.get('tax_amount', 0),
                'items': extracted_data.get('items', []),
                'confidence_score': extracted_data.get('confidence_score', 0),
                'raw_text': extracted_data.get('raw_text', '')[:500] + '...' if len(extracted_data.get('raw_text', '')) > 500 else extracted_data.get('raw_text', '')
            },
            'suggested_category': suggested_category.to_dict() if suggested_category else None,
            'ai_confidence': round(confidence_score, 2)
        }

        return generate_response('success', 'Receipt uploaded and processed successfully', response_data)

    except Exception as e:
        current_app.logger.error(f"Upload receipt error: {e}")
        return generate_response('error', 'Failed to upload and process receipt', status_code=500)

@upload_bp.route('/receipt/create-expense', methods=['POST'])
@jwt_required()
def create_expense_from_receipt():
    """Create expense from processed receipt data"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return generate_response('error', 'No data provided', status_code=400)

        # Required fields
        required_fields = ['file_path', 'description', 'amount', 'category_id']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return generate_response('error', f'Missing required fields: {", ".join(missing_fields)}', status_code=400)

        # Validate category
        category = Category.query.get(data['category_id'])
        if not category or not category.is_active:
            return generate_response('error', 'Invalid category', status_code=400)

        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return generate_response('error', 'Amount must be greater than 0', status_code=400)
        except (ValueError, TypeError):
            return generate_response('error', 'Invalid amount format', status_code=400)

        # Validate date
        expense_date = datetime.now().date()
        if data.get('date'):
            try:
                expense_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return generate_response('error', 'Invalid date format. Use YYYY-MM-DD', status_code=400)

        # Create expense
        expense = Expense(
            user_id=current_user_id,
            category_id=data['category_id'],
            description=data['description'].strip(),
            amount=amount,
            date=expense_date,
            currency=data.get('currency', 'USD').upper()
        )

        # Add optional fields
        if data.get('merchant_name'):
            expense.merchant_name = data['merchant_name'].strip()

        if data.get('tax_amount'):
            try:
                expense.tax_amount = float(data['tax_amount'])
            except (ValueError, TypeError):
                expense.tax_amount = 0.0

        if data.get('notes'):
            expense.notes = data['notes'].strip()

        # Receipt-specific fields
        expense.receipt_image_path = data['file_path']
        expense.receipt_text = data.get('raw_text', '')
        expense.created_by_ai = True
        expense.ai_confidence_score = data.get('ai_confidence', 0.0)
        expense.ai_extracted_data = data.get('extracted_data', {})

        # Business expense flags
        expense.is_business_expense = data.get('is_business_expense', False)
        expense.is_tax_deductible = data.get('is_tax_deductible', False)
        expense.is_reimbursable = data.get('is_reimbursable', False)

        expense.save()

        return generate_response('success', 'Expense created from receipt successfully', {
            'expense': expense.to_dict(include_receipt=True)
        }, status_code=201)

    except Exception as e:
        current_app.logger.error(f"Create expense from receipt error: {e}")
        return generate_response('error', 'Failed to create expense from receipt', status_code=500)

@upload_bp.route('/receipt/reprocess/<file_id>', methods=['POST'])
@jwt_required()
def reprocess_receipt(file_id):
    """Reprocess a previously uploaded receipt"""
    try:
        current_user_id = get_jwt_identity()

        # Find file by searching in user's upload directory
        upload_dir = os.path.join(current_app.instance_path, 'uploads', str(current_user_id))

        file_path = None
        for filename in os.listdir(upload_dir):
            if file_id in filename:
                file_path = os.path.join(upload_dir, filename)
                break

        if not file_path or not os.path.exists(file_path):
            return generate_response('error', 'File not found', status_code=404)

        # Reprocess with OCR
        ocr_service = OCRService()
        extracted_data = ocr_service.extract_receipt_data(file_path)

        # Get new AI category suggestion
        suggested_category = None
        confidence_score = 0.0

        if current_app.config.get('ENABLE_AI_CATEGORIZATION', True):
            ml_service = MLService()
            category_name, confidence_score = ml_service.predict_category(
                extracted_data.get('raw_text', ''),
                extracted_data.get('merchant_name', ''),
                extracted_data.get('total_amount', 0)
            )

            suggested_category = Category.query.filter_by(
                name=category_name, is_active=True
            ).first()

        response_data = {
            'file_id': file_id,
            'extracted_data': {
                'merchant_name': extracted_data.get('merchant_name'),
                'total_amount': extracted_data.get('total_amount'),
                'date': extracted_data['date'].isoformat() if extracted_data.get('date') else None,
                'tax_amount': extracted_data.get('tax_amount', 0),
                'items': extracted_data.get('items', []),
                'confidence_score': extracted_data.get('confidence_score', 0),
                'raw_text': extracted_data.get('raw_text', '')
            },
            'suggested_category': suggested_category.to_dict() if suggested_category else None,
            'ai_confidence': round(confidence_score, 2)
        }

        return generate_response('success', 'Receipt reprocessed successfully', response_data)

    except Exception as e:
        current_app.logger.error(f"Reprocess receipt error: {e}")
        return generate_response('error', 'Failed to reprocess receipt', status_code=500)

@upload_bp.route('/receipt/bulk', methods=['POST'])
@jwt_required()
def bulk_upload_receipts():
    """Upload and process multiple receipt images"""
    try:
        current_user_id = get_jwt_identity()

        # Check if files were uploaded
        if 'files' not in request.files:
            return generate_response('error', 'No files uploaded', status_code=400)

        files = request.files.getlist('files')

        if not files or len(files) == 0:
            return generate_response('error', 'No files provided', status_code=400)

        if len(files) > 10:  # Limit bulk uploads
            return generate_response('error', 'Maximum 10 files allowed per bulk upload', status_code=400)

        results = []
        upload_dir = os.path.join(current_app.instance_path, 'uploads', str(current_user_id))
        os.makedirs(upload_dir, exist_ok=True)

        ocr_service = OCRService()
        ml_service = MLService() if current_app.config.get('ENABLE_AI_CATEGORIZATION', True) else None

        for file in files:
            try:
                # Validate file
                file_validation = validate_file_upload(file)
                if not file_validation['valid']:
                    results.append({
                        'filename': file.filename,
                        'success': False,
                        'error': file_validation['message']
                    })
                    continue

                # Generate unique filename
                original_filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                unique_id = str(uuid.uuid4())[:8]

                if '.' in original_filename:
                    name, ext = original_filename.rsplit('.', 1)
                    filename = f"{name}_{timestamp}_{unique_id}.{ext}"
                else:
                    filename = f"{original_filename}_{timestamp}_{unique_id}"

                file_path = os.path.join(upload_dir, filename)
                file.save(file_path)

                # Process with OCR
                extracted_data = ocr_service.extract_receipt_data(file_path)

                # Get AI category suggestion
                suggested_category = None
                confidence_score = 0.0

                if ml_service:
                    category_name, confidence_score = ml_service.predict_category(
                        extracted_data.get('raw_text', ''),
                        extracted_data.get('merchant_name', ''),
                        extracted_data.get('total_amount', 0)
                    )

                    suggested_category = Category.query.filter_by(
                        name=category_name, is_active=True
                    ).first()

                relative_path = os.path.relpath(file_path, current_app.instance_path)

                results.append({
                    'filename': original_filename,
                    'success': True,
                    'file_id': unique_id,
                    'file_path': relative_path,
                    'extracted_data': {
                        'merchant_name': extracted_data.get('merchant_name'),
                        'total_amount': extracted_data.get('total_amount'),
                        'date': extracted_data['date'].isoformat() if extracted_data.get('date') else None,
                        'tax_amount': extracted_data.get('tax_amount', 0),
                        'confidence_score': extracted_data.get('confidence_score', 0)
                    },
                    'suggested_category': suggested_category.to_dict() if suggested_category else None,
                    'ai_confidence': round(confidence_score, 2)
                })

            except Exception as e:
                current_app.logger.error(f"Error processing file {file.filename}: {e}")
                results.append({
                    'filename': file.filename,
                    'success': False,
                    'error': 'Failed to process file'
                })

        successful_uploads = sum(1 for result in results if result['success'])

        return generate_response('success', f'Processed {successful_uploads} of {len(files)} files', {
            'results': results,
            'summary': {
                'total_files': len(files),
                'successful': successful_uploads,
                'failed': len(files) - successful_uploads
            }
        })

    except Exception as e:
        current_app.logger.error(f"Bulk upload receipts error: {e}")
        return generate_response('error', 'Failed to upload receipts', status_code=500)

@upload_bp.route('/receipt/<file_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_uploaded_file(file_id):
    """Delete an uploaded receipt file"""
    try:
        current_user_id = get_jwt_identity()

        # Find file by searching in user's upload directory
        upload_dir = os.path.join(current_app.instance_path, 'uploads', str(current_user_id))

        file_path = None
        filename = None
        for fname in os.listdir(upload_dir):
            if file_id in fname:
                filename = fname
                file_path = os.path.join(upload_dir, fname)
                break

        if not file_path or not os.path.exists(file_path):
            return generate_response('error', 'File not found', status_code=404)

        # Check if file is associated with any expense
        expense = Expense.query.filter(
            Expense.user_id == current_user_id,
            Expense.receipt_image_path.like(f'%{filename}%')
        ).first()

        if expense:
            # Don't delete file if it's associated with an expense
            # Just remove the association
            expense.receipt_image_path = None
            expense.save()

            return generate_response('success', 'File association removed from expense')
        else:
            # Delete the physical file
            os.remove(file_path)
            return generate_response('success', 'File deleted successfully')

    except Exception as e:
        current_app.logger.error(f"Delete uploaded file error: {e}")
        return generate_response('error', 'Failed to delete file', status_code=500)

@upload_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_upload_stats():
    """Get upload statistics for the user"""
    try:
        current_user_id = get_jwt_identity()

        # Count expenses created from receipts
        ai_created_expenses = Expense.query.filter_by(
            user_id=current_user_id,
            created_by_ai=True
        ).count()

        total_expenses = Expense.query.filter_by(user_id=current_user_id).count()

        # Count uploaded files
        upload_dir = os.path.join(current_app.instance_path, 'uploads', str(current_user_id))
        uploaded_files = 0
        if os.path.exists(upload_dir):
            uploaded_files = len([f for f in os.listdir(upload_dir) if os.path.isfile(os.path.join(upload_dir, f))])

        stats = {
            'ai_created_expenses': ai_created_expenses,
            'total_expenses': total_expenses,
            'uploaded_files': uploaded_files,
            'ai_usage_percentage': round((ai_created_expenses / total_expenses * 100), 2) if total_expenses > 0 else 0
        }

        return generate_response('success', 'Upload statistics retrieved successfully', {
            'stats': stats
        })

    except Exception as e:
        current_app.logger.error(f"Get upload stats error: {e}")
        return generate_response('error', 'Failed to retrieve upload statistics', status_code=500)
