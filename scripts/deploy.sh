#!/bin/bash
# Smart Expense Tracker - Deploy Script

echo "🚀 Deploying Smart Expense Tracker..."

# Build and run with Docker Compose
docker-compose down
docker-compose up --build -d

echo "✅ Deployment complete!"
echo ""
echo "Application is running at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo "- Database: PostgreSQL on port 5432"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
