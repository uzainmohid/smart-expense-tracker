"""
Smart Expense Tracker - ML Service
Machine Learning service for expense categorization and insights
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import logging
from datetime import datetime, timedelta
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
except:
    pass

class MLService:
    """Machine Learning service for expense categorization and analysis"""

    def __init__(self, model_path='ml_models/trained_models/'):
        self.model_path = model_path
        self.logger = logging.getLogger(__name__)
        self.vectorizer = None
        self.classifier = None
        self.categories = []

        # Initialize NLTK components
        try:
            self.stop_words = set(stopwords.words('english'))
            self.lemmatizer = WordNetLemmatizer()
        except:
            self.stop_words = set()
            self.lemmatizer = None

        # Ensure model directory exists
        os.makedirs(model_path, exist_ok=True)

        # Load existing model if available
        self.load_model()

    def preprocess_text(self, text):
        """Preprocess text for ML model"""
        if not text:
            return ""

        # Convert to lowercase
        text = text.lower()

        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)

        # Tokenize
        tokens = word_tokenize(text) if text else []

        # Remove stopwords and lemmatize
        if self.lemmatizer and self.stop_words:
            tokens = [
                self.lemmatizer.lemmatize(token) 
                for token in tokens 
                if token not in self.stop_words and len(token) > 2
            ]

        return ' '.join(tokens)

    def create_features(self, description, merchant_name=None, amount=None):
        """Create feature vector from expense data"""
        features = []

        # Text features
        text_data = description or ""
        if merchant_name:
            text_data += " " + merchant_name

        processed_text = self.preprocess_text(text_data)
        features.append(processed_text)

        return ' '.join(features)

    def prepare_training_data(self, expenses_data):
        """Prepare training data from expense records"""
        X = []
        y = []

        for expense in expenses_data:
            feature_text = self.create_features(
                expense.get('description', ''),
                expense.get('merchant_name', ''),
                expense.get('amount', 0)
            )

            X.append(feature_text)
            y.append(expense.get('category_name', 'Other'))

        return X, y

    def train_model(self, expenses_data, model_type='random_forest'):
        """Train the categorization model"""
        try:
            X, y = self.prepare_training_data(expenses_data)

            if len(X) < 10:
                self.logger.warning("Insufficient training data. Need at least 10 samples.")
                return False

            # Create pipeline
            if model_type == 'naive_bayes':
                classifier = MultinomialNB(alpha=0.1)
            elif model_type == 'svm':
                classifier = SVC(kernel='linear', probability=True, random_state=42)
            else:  # random_forest
                classifier = RandomForestClassifier(n_estimators=100, random_state=42)

            pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
                ('classifier', classifier)
            ])

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )

            # Train model
            pipeline.fit(X_train, y_train)

            # Evaluate model
            y_pred = pipeline.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)

            self.logger.info(f"Model trained with accuracy: {accuracy:.2f}")
            self.logger.info(f"Classification Report:\n{classification_report(y_test, y_pred)}")

            # Save model
            self.classifier = pipeline
            self.categories = list(set(y))
            self.save_model()

            return True

        except Exception as e:
            self.logger.error(f"Error training model: {e}")
            return False

    def predict_category(self, description, merchant_name=None, amount=None):
        """Predict category for an expense"""
        if not self.classifier:
            return self._get_rule_based_category(description, merchant_name), 0.5

        try:
            feature_text = self.create_features(description, merchant_name, amount)

            # Get prediction and probability
            predicted_category = self.classifier.predict([feature_text])[0]
            probabilities = self.classifier.predict_proba([feature_text])[0]
            confidence = max(probabilities)

            return predicted_category, confidence

        except Exception as e:
            self.logger.error(f"Error predicting category: {e}")
            return self._get_rule_based_category(description, merchant_name), 0.3

    def _get_rule_based_category(self, description, merchant_name=None):
        """Fallback rule-based categorization"""
        text = (description + " " + (merchant_name or "")).lower()

        # Define category keywords
        category_keywords = {
            'Food & Dining': [
                'restaurant', 'cafe', 'pizza', 'burger', 'starbucks', 'mcdonalds', 
                'kfc', 'subway', 'food', 'dining', 'lunch', 'dinner', 'breakfast',
                'coffee', 'bar', 'pub', 'buffet', 'bakery', 'deli'
            ],
            'Transportation': [
                'gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'metro',
                'parking', 'toll', 'car', 'auto', 'transport', 'airline', 'flight'
            ],
            'Shopping': [
                'amazon', 'walmart', 'target', 'costco', 'mall', 'store', 'shop',
                'retail', 'clothing', 'shoes', 'electronics', 'grocery'
            ],
            'Bills & Utilities': [
                'electric', 'water', 'internet', 'phone', 'cable', 'utility',
                'bill', 'payment', 'subscription', 'service', 'insurance'
            ],
            'Healthcare': [
                'hospital', 'doctor', 'pharmacy', 'medical', 'dental', 'health',
                'clinic', 'medicine', 'prescription', 'therapy'
            ],
            'Entertainment': [
                'movie', 'theater', 'cinema', 'netflix', 'spotify', 'game',
                'entertainment', 'concert', 'event', 'ticket', 'show'
            ]
        }

        # Score each category
        category_scores = {}
        for category, keywords in category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                category_scores[category] = score

        # Return category with highest score
        if category_scores:
            return max(category_scores, key=category_scores.get)

        return 'Other'

    def get_spending_insights(self, user_expenses):
        """Generate spending insights using ML analysis"""
        try:
            df = pd.DataFrame(user_expenses)

            if df.empty:
                return {}

            insights = {}

            # Convert date strings to datetime
            df['date'] = pd.to_datetime(df['date'])
            df['month'] = df['date'].dt.to_period('M')

            # Monthly spending trend
            monthly_spending = df.groupby('month')['amount'].sum()
            insights['monthly_trend'] = {
                'increasing': monthly_spending.is_monotonic_increasing,
                'avg_monthly': monthly_spending.mean(),
                'trend_direction': 'up' if monthly_spending.iloc[-1] > monthly_spending.iloc[0] else 'down'
            }

            # Category analysis
            category_spending = df.groupby('category_name')['amount'].agg(['sum', 'mean', 'count'])
            insights['top_categories'] = category_spending.sort_values('sum', ascending=False).head(5).to_dict('index')

            # Spending patterns
            df['day_of_week'] = df['date'].dt.day_name()
            day_spending = df.groupby('day_of_week')['amount'].mean()
            insights['spending_by_day'] = day_spending.to_dict()

            # Unusual spending detection
            df['z_score'] = np.abs((df['amount'] - df['amount'].mean()) / df['amount'].std())
            unusual_expenses = df[df['z_score'] > 2]['amount'].tolist()
            insights['unusual_expenses'] = {
                'count': len(unusual_expenses),
                'amounts': unusual_expenses[:5]  # Top 5 unusual amounts
            }

            # Budget recommendations
            avg_monthly = monthly_spending.mean()
            insights['budget_recommendations'] = {
                'suggested_monthly_budget': avg_monthly * 1.1,  # 10% buffer
                'top_category_limit': category_spending['sum'].iloc[0] * 0.8  # 20% reduction on top category
            }

            return insights

        except Exception as e:
            self.logger.error(f"Error generating insights: {e}")
            return {}

    def predict_future_spending(self, user_expenses, months_ahead=3):
        """Predict future spending based on historical data"""
        try:
            df = pd.DataFrame(user_expenses)

            if len(df) < 30:  # Need sufficient historical data
                return None

            # Prepare time series data
            df['date'] = pd.to_datetime(df['date'])
            monthly_spending = df.groupby(df['date'].dt.to_period('M'))['amount'].sum()

            # Simple linear trend prediction
            X = np.arange(len(monthly_spending)).reshape(-1, 1)
            y = monthly_spending.values

            from sklearn.linear_model import LinearRegression
            model = LinearRegression()
            model.fit(X, y)

            # Predict future months
            future_X = np.arange(len(monthly_spending), len(monthly_spending) + months_ahead).reshape(-1, 1)
            predictions = model.predict(future_X)

            return {
                'predicted_amounts': predictions.tolist(),
                'confidence': 'medium',  # Simple confidence estimate
                'trend': 'increasing' if model.coef_[0] > 0 else 'decreasing'
            }

        except Exception as e:
            self.logger.error(f"Error predicting future spending: {e}")
            return None

    def save_model(self):
        """Save trained model to disk"""
        try:
            if self.classifier:
                model_file = os.path.join(self.model_path, 'expense_categorizer.joblib')
                categories_file = os.path.join(self.model_path, 'categories.joblib')

                joblib.dump(self.classifier, model_file)
                joblib.dump(self.categories, categories_file)

                self.logger.info("Model saved successfully")

        except Exception as e:
            self.logger.error(f"Error saving model: {e}")

    def load_model(self):
        """Load trained model from disk"""
        try:
            model_file = os.path.join(self.model_path, 'expense_categorizer.joblib')
            categories_file = os.path.join(self.model_path, 'categories.joblib')

            if os.path.exists(model_file) and os.path.exists(categories_file):
                self.classifier = joblib.load(model_file)
                self.categories = joblib.load(categories_file)

                self.logger.info("Model loaded successfully")
                return True

        except Exception as e:
            self.logger.error(f"Error loading model: {e}")

        return False

    def retrain_with_feedback(self, expense_data, correct_category):
        """Retrain model with user feedback"""
        # This would be implemented for online learning
        # For now, we'll log the feedback for future retraining
        self.logger.info(f"Feedback received: {expense_data} -> {correct_category}")
