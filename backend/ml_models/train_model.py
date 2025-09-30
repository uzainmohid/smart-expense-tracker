"""
Smart Expense Tracker - Model Training Script
Train and save ML models for expense categorization and prediction
"""

import os
import sys
import logging
from datetime import datetime

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from category_classifier import CategoryClassifier
from expense_predictor import ExpensePredictor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('model_training.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def setup_directories():
    """Create necessary directories for model storage"""
    directories = [
        'trained_models',
        'training_logs',
        'model_backups'
    ]

    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Directory created: {directory}")

def train_category_classifier():
    """Train and save the category classification model"""
    logger.info("Starting category classifier training...")

    try:
        classifier = CategoryClassifier()

        # Train the model
        if classifier.train_initial_model():
            # Save the model
            if classifier.save_model():
                logger.info("Category classifier trained and saved successfully!")
                return True
            else:
                logger.error("Failed to save category classifier")
                return False
        else:
            logger.error("Failed to train category classifier")
            return False

    except Exception as e:
        logger.error(f"Error training category classifier: {e}")
        return False

def train_expense_predictor():
    """Train and save the expense prediction model"""
    logger.info("Starting expense predictor training...")

    try:
        predictor = ExpensePredictor()

        # For initial training, we'll create some sample data
        # In a real application, this would use actual user data
        sample_data = generate_sample_expense_data()

        # Train the model
        if predictor.train_model(sample_data):
            # Save the model
            if predictor.save_model():
                logger.info("Expense predictor trained and saved successfully!")
                return True
            else:
                logger.error("Failed to save expense predictor")
                return False
        else:
            logger.error("Failed to train expense predictor")
            return False

    except Exception as e:
        logger.error(f"Error training expense predictor: {e}")
        return False

def generate_sample_expense_data():
    """Generate sample expense data for initial model training"""
    import random
    from datetime import datetime, timedelta

    categories = [
        'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
        'Healthcare', 'Entertainment', 'Travel', 'Business', 'Education', 'Other'
    ]

    sample_data = []
    start_date = datetime.now() - timedelta(days=365)  # 1 year of data

    for i in range(500):  # Generate 500 sample expenses
        # Random date within the last year
        random_days = random.randint(0, 365)
        expense_date = start_date + timedelta(days=random_days)

        # Random category
        category = random.choice(categories)

        # Category-based amount ranges
        amount_ranges = {
            'Food & Dining': (5, 100),
            'Transportation': (2, 150),
            'Shopping': (10, 500),
            'Bills & Utilities': (50, 300),
            'Healthcare': (20, 500),
            'Entertainment': (10, 200),
            'Travel': (100, 2000),
            'Business': (25, 1000),
            'Education': (50, 1500),
            'Other': (5, 200)
        }

        min_amount, max_amount = amount_ranges[category]
        amount = round(random.uniform(min_amount, max_amount), 2)

        sample_data.append({
            'date': expense_date.strftime('%Y-%m-%d'),
            'amount': amount,
            'category_name': category,
            'description': f"Sample {category.lower()} expense"
        })

    logger.info(f"Generated {len(sample_data)} sample expense records")
    return sample_data

def backup_existing_models():
    """Backup existing models before retraining"""
    model_files = [
        'trained_models/category_classifier.joblib',
        'trained_models/categories.joblib',
        'trained_models/expense_predictor.joblib',
        'trained_models/expense_scaler.joblib',
        'trained_models/predictor_features.joblib'
    ]

    backup_dir = f"model_backups/backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_dir, exist_ok=True)

    for model_file in model_files:
        if os.path.exists(model_file):
            import shutil
            backup_file = os.path.join(backup_dir, os.path.basename(model_file))
            shutil.copy2(model_file, backup_file)
            logger.info(f"Backed up {model_file} to {backup_file}")

def validate_models():
    """Validate that the trained models work correctly"""
    logger.info("Validating trained models...")

    try:
        # Test category classifier
        classifier = CategoryClassifier()
        if classifier.load_model():
            test_description = "Starbucks coffee"
            category, confidence = classifier.predict_category(test_description)
            logger.info(f"Category classifier test: '{test_description}' -> {category} (confidence: {confidence:.2f})")

        # Test expense predictor
        predictor = ExpensePredictor()
        if predictor.load_model():
            logger.info("Expense predictor loaded successfully")

        return True

    except Exception as e:
        logger.error(f"Model validation failed: {e}")
        return False

def main():
    """Main training function"""
    logger.info("=== Smart Expense Tracker - Model Training ===")
    logger.info(f"Training started at: {datetime.now()}")

    # Setup directories
    setup_directories()

    # Backup existing models
    backup_existing_models()

    # Train models
    success_count = 0

    if train_category_classifier():
        success_count += 1

    if train_expense_predictor():
        success_count += 1

    # Validate models
    if validate_models():
        logger.info("Model validation successful")

    # Summary
    logger.info(f"Training completed: {success_count}/2 models trained successfully")
    logger.info(f"Training finished at: {datetime.now()}")

    if success_count == 2:
        logger.info("🎉 All models trained successfully!")
        print("\n🎉 All models trained successfully!")
        print("Models are ready for use in the Smart Expense Tracker application.")
    else:
        logger.warning("⚠️  Some models failed to train. Check the logs for details.")
        print("\n⚠️  Some models failed to train. Check the logs for details.")

if __name__ == "__main__":
    main()
