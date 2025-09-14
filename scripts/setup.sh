#!/bin/bash

# Notes Management Backend Setup Script
echo "🚀 Setting up Notes Management Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your actual configuration values"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres redis
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    docker compose up -d postgres redis
else
    echo "❌ Docker or Docker Compose is not installed."
    echo "Please install Docker and Docker Compose, or set up PostgreSQL and Redis manually."
    exit 1
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma db push

# Seed database (optional)
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update your .env file with the correct configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000/api/docs for API documentation"
echo ""
echo "📚 Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run start        - Start production server"
echo "  npm run test         - Run tests"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run db:migrate   - Run database migrations"