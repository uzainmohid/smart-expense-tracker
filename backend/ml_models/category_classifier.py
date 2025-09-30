"""
Smart Expense Tracker - Category Classifier
Pre-trained models and utilities for expense categorization
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import logging

class CategoryClassifier:
    """Pre-trained category classifier with sample data"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.model = None
        self.categories = []

    def get_sample_training_data(self):
        """Generate sample training data for initial model training"""

        # Sample expense descriptions with their categories
        training_data = [
            # Food & Dining
            ("McDonald's breakfast", "Food & Dining"),
            ("Starbucks coffee", "Food & Dining"),
            ("Pizza delivery", "Food & Dining"),
            ("Restaurant dinner", "Food & Dining"),
            ("Grocery shopping", "Food & Dining"),
            ("Subway sandwich", "Food & Dining"),
            ("Coffee shop", "Food & Dining"),
            ("Fast food lunch", "Food & Dining"),
            ("Fine dining", "Food & Dining"),
            ("Catering service", "Food & Dining"),

            # Transportation
            ("Gas station fuel", "Transportation"),
            ("Uber ride", "Transportation"),
            ("Taxi fare", "Transportation"),
            ("Bus ticket", "Transportation"),
            ("Train ticket", "Transportation"),
            ("Parking fee", "Transportation"),
            ("Car maintenance", "Transportation"),
            ("Metro card", "Transportation"),
            ("Airline ticket", "Transportation"),
            ("Lyft ride", "Transportation"),

            # Shopping
            ("Amazon purchase", "Shopping"),
            ("Clothing store", "Shopping"),
            ("Department store", "Shopping"),
            ("Online shopping", "Shopping"),
            ("Electronics store", "Shopping"),
            ("Bookstore", "Shopping"),
            ("Pharmacy", "Shopping"),
            ("Hardware store", "Shopping"),
            ("Sporting goods", "Shopping"),
            ("Target shopping", "Shopping"),

            # Bills & Utilities
            ("Electric bill", "Bills & Utilities"),
            ("Water bill", "Bills & Utilities"),
            ("Internet bill", "Bills & Utilities"),
            ("Phone bill", "Bills & Utilities"),
            ("Cable TV", "Bills & Utilities"),
            ("Insurance premium", "Bills & Utilities"),
            ("Netflix subscription", "Bills & Utilities"),
            ("Spotify premium", "Bills & Utilities"),
            ("Gym membership", "Bills & Utilities"),
            ("Utility payment", "Bills & Utilities"),

            # Healthcare
            ("Doctor visit", "Healthcare"),
            ("Pharmacy prescription", "Healthcare"),
            ("Dental checkup", "Healthcare"),
            ("Hospital bill", "Healthcare"),
            ("Medical test", "Healthcare"),
            ("Health insurance", "Healthcare"),
            ("Clinic visit", "Healthcare"),
            ("Therapy session", "Healthcare"),
            ("Medical supplies", "Healthcare"),
            ("Vision exam", "Healthcare"),

            # Entertainment
            ("Movie theater", "Entertainment"),
            ("Concert ticket", "Entertainment"),
            ("Sports event", "Entertainment"),
            ("Streaming service", "Entertainment"),
            ("Video games", "Entertainment"),
            ("Theme park", "Entertainment"),
            ("Music festival", "Entertainment"),
            ("Theater show", "Entertainment"),
            ("Gaming subscription", "Entertainment"),
            ("Entertainment venue", "Entertainment"),

            # Travel
            ("Hotel booking", "Travel"),
            ("Flight ticket", "Travel"),
            ("Car rental", "Travel"),
            ("Travel insurance", "Travel"),
            ("Resort booking", "Travel"),
            ("Airbnb stay", "Travel"),
            ("Cruise booking", "Travel"),
            ("Travel agency", "Travel"),
            ("Vacation package", "Travel"),
            ("Travel expenses", "Travel"),

            # Business
            ("Office supplies", "Business"),
            ("Business lunch", "Business"),
            ("Conference fee", "Business"),
            ("Professional service", "Business"),
            ("Business travel", "Business"),
            ("Office rent", "Business"),
            ("Software license", "Business"),
            ("Consulting fee", "Business"),
            ("Business equipment", "Business"),
            ("Professional development", "Business"),

            # Education
            ("University tuition", "Education"),
            ("Online course", "Education"),
            ("Textbooks", "Education"),
            ("School supplies", "Education"),
            ("Training program", "Education"),
            ("Educational software", "Education"),
            ("Certification exam", "Education"),
            ("Workshop fee", "Education"),
            ("Academic conference", "Education"),
            ("Student loan", "Education"),

            # Other
            ("Bank fee", "Other"),
            ("ATM withdrawal", "Other"),
            ("Gift purchase", "Other"),
            ("Donation", "Other"),
            ("Legal fee", "Other"),
            ("Miscellaneous", "Other"),
            ("Unknown expense", "Other"),
            ("Service fee", "Other"),
            ("General expense", "Other"),
            ("Various items", "Other")
        ]

        return training_data

    def train_initial_model(self):
        """Train initial model with sample data"""
        try:
            training_data = self.get_sample_training_data()

            # Separate features and labels
            X = [desc for desc, cat in training_data]
            y = [cat for desc, cat in training_data]

            # Create and train pipeline
            pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2), lowercase=True)),
                ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
            ])

            # Split data for validation
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )

            # Train model
            pipeline.fit(X_train, y_train)

            # Evaluate
            y_pred = pipeline.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)

            self.logger.info(f"Initial model trained with accuracy: {accuracy:.2f}")
            print(f"Initial model trained with accuracy: {accuracy:.2f}")

            self.model = pipeline
            self.categories = list(set(y))

            return True

        except Exception as e:
            self.logger.error(f"Error training initial model: {e}")
            return False

    def predict_category(self, description, merchant_name=None):
        """Predict category for expense description"""
        if not self.model:
            self.train_initial_model()

        # Combine description and merchant name
        text = description
        if merchant_name:
            text += " " + merchant_name

        try:
            predicted_category = self.model.predict([text])[0]
            probabilities = self.model.predict_proba([text])[0]
            confidence = max(probabilities)

            return predicted_category, confidence

        except Exception as e:
            self.logger.error(f"Error predicting category: {e}")
            return "Other", 0.3

    def save_model(self, model_path='ml_models/trained_models/'):
        """Save trained model"""
        try:
            os.makedirs(model_path, exist_ok=True)

            if self.model:
                model_file = os.path.join(model_path, 'category_classifier.joblib')
                categories_file = os.path.join(model_path, 'categories.joblib')

                joblib.dump(self.model, model_file)
                joblib.dump(self.categories, categories_file)

                print(f"Model saved to {model_file}")
                return True

        except Exception as e:
            self.logger.error(f"Error saving model: {e}")
            return False

    def load_model(self, model_path='ml_models/trained_models/'):
        """Load trained model"""
        try:
            model_file = os.path.join(model_path, 'category_classifier.joblib')
            categories_file = os.path.join(model_path, 'categories.joblib')

            if os.path.exists(model_file) and os.path.exists(categories_file):
                self.model = joblib.load(model_file)
                self.categories = joblib.load(categories_file)

                print("Model loaded successfully")
                return True

        except Exception as e:
            self.logger.error(f"Error loading model: {e}")

        return False

if __name__ == "__main__":
    # Train and save initial model
    classifier = CategoryClassifier()
    if classifier.train_initial_model():
        classifier.save_model()
        print("Initial category classifier model created and saved!")
