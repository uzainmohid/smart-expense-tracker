#!/usr/bin/env python3
"""Run the Smart Expense Tracker backend"""

from app import create_app

# Create app instance
app = create_app()

if __name__ == '__main__':
    print('🚀 Starting Smart Expense Tracker Backend...')
    print('📍 Server will run at: http://localhost:5000')
    print('🏥 Health check: http://localhost:5000/api/health')
    print('📊 API Base: http://localhost:5000/api/')
    print('')
    print('Press Ctrl+C to stop the server')
    print('=' * 50)
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )
