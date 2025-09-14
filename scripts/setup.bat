@echo off
echo 🚀 Setting up Notes Management Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Copy environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please update the .env file with your actual configuration values
)

REM Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d postgres redis
if %errorlevel% neq 0 (
    echo ❌ Docker or Docker Compose is not available.
    echo Please install Docker Desktop or set up PostgreSQL and Redis manually.
    pause
    exit /b 1
)

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Run database migrations
echo 🗄️  Running database migrations...
npx prisma db push

REM Seed database (optional)
if exist "prisma\seed.ts" (
    echo 🌱 Seeding database...
    npx prisma db seed
)

echo ✅ Setup complete!
echo.
echo 🎯 Next steps:
echo 1. Update your .env file with the correct configuration
echo 2. Run 'npm run dev' to start the development server
echo 3. Visit http://localhost:7200/api/docs for API documentation
echo.
echo 📚 Available commands:
echo   npm run dev          - Start development server
echo   npm run build        - Build for production
echo   npm run start        - Start production server
echo   npm run test         - Run tests
echo   npm run db:studio    - Open Prisma Studio
echo   npm run db:migrate   - Run database migrations

pause