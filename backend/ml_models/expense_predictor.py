"""
Smart Expense Tracker - Expense Predictor
Machine learning models for predicting future expenses
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
from datetime import datetime, timedelta
import logging

class ExpensePredictor:
    """Predict future expenses based on historical data"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.model = None
        self.scaler = None
        self.feature_columns = []

    def prepare_features(self, expenses_df):
        """Prepare features for prediction model"""
        try:
            # Ensure date is datetime
            if 'date' in expenses_df.columns:
                expenses_df['date'] = pd.to_datetime(expenses_df['date'])

            # Create time-based features
            expenses_df['year'] = expenses_df['date'].dt.year
            expenses_df['month'] = expenses_df['date'].dt.month
            expenses_df['day'] = expenses_df['date'].dt.day
            expenses_df['day_of_week'] = expenses_df['date'].dt.dayofweek
            expenses_df['day_of_year'] = expenses_df['date'].dt.dayofyear
            expenses_df['week_of_year'] = expenses_df['date'].dt.isocalendar().week
            expenses_df['is_weekend'] = (expenses_df['day_of_week'] >= 5).astype(int)

            # Monthly aggregated features
            monthly_stats = expenses_df.groupby(['year', 'month'])['amount'].agg([
                'sum', 'mean', 'count', 'std'
            ]).fillna(0)

            monthly_stats.columns = ['monthly_total', 'monthly_avg', 'monthly_count', 'monthly_std']
            monthly_stats = monthly_stats.reset_index()

            # Merge back to main dataframe
            expenses_df = expenses_df.merge(monthly_stats, on=['year', 'month'], how='left')

            # Category encoding (if category information available)
            if 'category_name' in expenses_df.columns:
                category_dummies = pd.get_dummies(expenses_df['category_name'], prefix='category')
                expenses_df = pd.concat([expenses_df, category_dummies], axis=1)

                # Store category columns for later use
                category_columns = [col for col in category_dummies.columns]
            else:
                category_columns = []

            # Lag features (previous period spending)
            expenses_df = expenses_df.sort_values('date')
            expenses_df['lag_1_amount'] = expenses_df['amount'].shift(1)
            expenses_df['lag_7_amount'] = expenses_df['amount'].shift(7)  # Previous week
            expenses_df['lag_30_amount'] = expenses_df['amount'].shift(30)  # Previous month

            # Rolling averages
            expenses_df['rolling_7_avg'] = expenses_df['amount'].rolling(window=7).mean()
            expenses_df['rolling_30_avg'] = expenses_df['amount'].rolling(window=30).mean()

            # Fill NaN values
            expenses_df = expenses_df.fillna(0)

            # Define feature columns
            self.feature_columns = [
                'month', 'day', 'day_of_week', 'day_of_year', 'week_of_year', 'is_weekend',
                'monthly_avg', 'monthly_count', 'monthly_std',
                'lag_1_amount', 'lag_7_amount', 'lag_30_amount',
                'rolling_7_avg', 'rolling_30_avg'
            ] + category_columns

            # Filter to only include available columns
            available_columns = [col for col in self.feature_columns if col in expenses_df.columns]

            return expenses_df[available_columns + ['amount']]

        except Exception as e:
            self.logger.error(f"Error preparing features: {e}")
            return expenses_df

    def train_model(self, expenses_data):
        """Train the expense prediction model"""
        try:
            if len(expenses_data) < 30:
                self.logger.warning("Insufficient data for training. Need at least 30 records.")
                return False

            # Convert to DataFrame if needed
            if isinstance(expenses_data, list):
                df = pd.DataFrame(expenses_data)
            else:
                df = expenses_data.copy()

            # Prepare features
            df = self.prepare_features(df)

            if df.empty:
                return False

            # Separate features and target
            available_features = [col for col in self.feature_columns if col in df.columns]
            X = df[available_features]
            y = df['amount']

            # Remove rows with invalid data
            valid_indices = ~(X.isin([np.inf, -np.inf]).any(axis=1) | X.isnull().any(axis=1) | y.isnull())
            X = X[valid_indices]
            y = y[valid_indices]

            if len(X) < 10:
                self.logger.warning("Insufficient valid data after cleaning.")
                return False

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            # Scale features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)

            # Train model
            self.model = RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                max_depth=10
            )

            self.model.fit(X_train_scaled, y_train)

            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)

            self.logger.info(f"Model trained - MSE: {mse:.2f}, R2: {r2:.2f}")
            print(f"Prediction model trained - MSE: {mse:.2f}, R2: {r2:.2f}")

            return True

        except Exception as e:
            self.logger.error(f"Error training model: {e}")
            return False

    def predict_future_expenses(self, historical_data, days_ahead=30):
        """Predict future expenses"""
        try:
            if not self.model or not self.scaler:
                self.logger.error("Model not trained. Train model first.")
                return None

            # Convert to DataFrame if needed
            if isinstance(historical_data, list):
                df = pd.DataFrame(historical_data)
            else:
                df = historical_data.copy()

            # Get the last date from historical data
            df['date'] = pd.to_datetime(df['date'])
            last_date = df['date'].max()

            # Generate future dates
            future_dates = [last_date + timedelta(days=i) for i in range(1, days_ahead + 1)]

            predictions = []

            for future_date in future_dates:
                # Create feature vector for future date
                future_features = self._create_future_features(df, future_date)

                if future_features is not None:
                    # Scale features
                    future_features_scaled = self.scaler.transform([future_features])

                    # Make prediction
                    predicted_amount = self.model.predict(future_features_scaled)[0]
                    predicted_amount = max(0, predicted_amount)  # Ensure non-negative

                    predictions.append({
                        'date': future_date.strftime('%Y-%m-%d'),
                        'predicted_amount': round(predicted_amount, 2)
                    })

            return predictions

        except Exception as e:
            self.logger.error(f"Error predicting future expenses: {e}")
            return None

    def _create_future_features(self, historical_df, future_date):
        """Create feature vector for future date"""
        try:
            # Basic time features
            features = {
                'month': future_date.month,
                'day': future_date.day,
                'day_of_week': future_date.weekday(),
                'day_of_year': future_date.timetuple().tm_yday,
                'week_of_year': future_date.isocalendar()[1],
                'is_weekend': 1 if future_date.weekday() >= 5 else 0
            }

            # Monthly statistics (from historical data)
            monthly_data = historical_df[
                (historical_df['date'].dt.month == future_date.month)
            ]

            if not monthly_data.empty:
                features['monthly_avg'] = monthly_data['amount'].mean()
                features['monthly_count'] = len(monthly_data)
                features['monthly_std'] = monthly_data['amount'].std() or 0
            else:
                # Use overall statistics if no data for this month
                features['monthly_avg'] = historical_df['amount'].mean()
                features['monthly_count'] = len(historical_df) / 12  # Average per month
                features['monthly_std'] = historical_df['amount'].std() or 0

            # Lag features (from historical data)
            recent_data = historical_df.tail(30)  # Last 30 records

            if not recent_data.empty:
                features['lag_1_amount'] = recent_data['amount'].iloc[-1]
                features['lag_7_amount'] = recent_data['amount'].iloc[-min(7, len(recent_data))]
                features['lag_30_amount'] = recent_data['amount'].iloc[0]
                features['rolling_7_avg'] = recent_data['amount'].tail(7).mean()
                features['rolling_30_avg'] = recent_data['amount'].mean()
            else:
                features.update({
                    'lag_1_amount': 0, 'lag_7_amount': 0, 'lag_30_amount': 0,
                    'rolling_7_avg': 0, 'rolling_30_avg': 0
                })

            # Category features (set to average if category info not available)
            for col in self.feature_columns:
                if col.startswith('category_') and col not in features:
                    features[col] = 0  # Default to 0 for category dummies

            # Return feature vector in correct order
            feature_vector = []
            for col in self.feature_columns:
                if col in features:
                    feature_vector.append(features[col])
                else:
                    feature_vector.append(0)

            return feature_vector

        except Exception as e:
            self.logger.error(f"Error creating future features: {e}")
            return None

    def save_model(self, model_path='ml_models/trained_models/'):
        """Save trained model"""
        try:
            os.makedirs(model_path, exist_ok=True)

            if self.model and self.scaler:
                model_file = os.path.join(model_path, 'expense_predictor.joblib')
                scaler_file = os.path.join(model_path, 'expense_scaler.joblib')
                features_file = os.path.join(model_path, 'predictor_features.joblib')

                joblib.dump(self.model, model_file)
                joblib.dump(self.scaler, scaler_file)
                joblib.dump(self.feature_columns, features_file)

                print(f"Prediction model saved to {model_file}")
                return True

        except Exception as e:
            self.logger.error(f"Error saving model: {e}")
            return False

    def load_model(self, model_path='ml_models/trained_models/'):
        """Load trained model"""
        try:
            model_file = os.path.join(model_path, 'expense_predictor.joblib')
            scaler_file = os.path.join(model_path, 'expense_scaler.joblib')
            features_file = os.path.join(model_path, 'predictor_features.joblib')

            if all(os.path.exists(f) for f in [model_file, scaler_file, features_file]):
                self.model = joblib.load(model_file)
                self.scaler = joblib.load(scaler_file)
                self.feature_columns = joblib.load(features_file)

                print("Prediction model loaded successfully")
                return True

        except Exception as e:
            self.logger.error(f"Error loading model: {e}")

        return False

if __name__ == "__main__":
    # Example usage
    predictor = ExpensePredictor()
    print("Expense predictor module initialized")
