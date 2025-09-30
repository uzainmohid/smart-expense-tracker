#!/bin/bash
# Smart Expense Tracker - Train ML Models Script

echo "🤖 Training ML models for Smart Expense Tracker..."

cd backend/ml_models

# Activate virtual environment if it exists
if [ -d "../venv" ]; then
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source ../venv/Scripts/activate
    else
        source ../venv/bin/activate
    fi
    echo "✅ Virtual environment activated"
fi

# Run training script
python train_model.py

echo "🎉 Model training complete!"
