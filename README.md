# Notes Management Backend

A comprehensive NestJS backend application for managing notes with real-time collaboration, version control, and user management features.

## 🚀 Features

### Core Features
- **User Authentication & Authorization**: JWT-based auth with refresh tokens and role-based access control
- **Notes Management**: Full CRUD operations with rich text support
- **Version Control**: Automatic versioning with restore capabilities
- **Real-time Collaboration**: WebSocket-based real-time updates and notifications
- **Sharing & Permissions**: Granular sharing controls with different visibility levels
- **Search & Filtering**: Advanced search with tags, content, and metadata filtering
- **Admin Panel**: Complete admin dashboard with user management, system stats, and content moderation

### Technical Features
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and performance
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Rate limiting, input validation, CORS, security headers
- **Real-time**: Socket.IO for live notifications and updates
- **File Upload**: Avatar and attachment support
- **Email System**: Nodemailer with HTML templates for notifications
- **Health Checks**: Comprehensive health monitoring

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Authentication**: JWT with Passport
- **Real-time**: Socket.IO
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (if not using Docker)
- Redis (if not using Docker)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd notes-management-backend

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start database services
docker-compose up -d postgres redis

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

## 🔧 Configuration

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/notes_management"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DEST="./uploads"

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

## 🖥️ Frontend (Client App)

This repository is the backend. If you're also working on the web client, use the following guidelines to run it alongside the API.

### Prerequisites
- Node.js 18+
- npm (or pnpm/yarn)

### Environment (frontend)
Create a `.env` (or `.env.local`) in the frontend project:

```env
# Point the frontend to this backend
NEXT_API_BASE_URL=http://localhost:7200

# Socket.IO URL (ws for local http, wss for https)
NEXT_WS_URL=ws://localhost:7200

# Optional extras
NEXT_AUTH_STORAGE_KEY=notes_auth
NEXT_APP_NAME=Notes
```

Note: For local development the frontend typically runs on `http://localhost:3000`. Ensure this origin is allowed by the backend CORS config. Set the backend `FRONTEND_URL` to your frontend origin, for example:

```env
FRONTEND_URL="http://localhost:3000"
```

### Run (frontend)
```bash
npm install
npm run dev
```

### Build & Preview (frontend)
```bash
npm run build
npm run preview
```

### Integration notes
- Ensure the backend is running on `http://localhost:7200` (or update `NEXT_API_BASE_URL`).
- WebSocket base should match your deployment (`ws://` locally, `wss://` in production).
- If you change ports/origins, update both the frontend `.env` and backend `FRONTEND_URL`.

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:7200/api/docs
- **OpenAPI JSON**: http://localhost:7200/api/docs-json

## 🗄️ Database Schema

### Core Models
- **Users**: User accounts with profiles and authentication
- **Notes**: Notes with content, metadata, and visibility settings
- **NoteVersions**: Version history for notes
- **NoteUsers**: Sharing permissions between users and notes
- **Notifications**: Real-time notifications for users

### Key Relationships
- Users can create multiple Notes (1:N)
- Notes have multiple Versions (1:N)
- Notes can be shared with multiple Users (N:M)
- Users receive multiple Notifications (1:N)

## 🔐 Authentication

### Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation

### JWT Token Structure
```json
{
  "sub": "user-id",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 📝 Notes API

### Endpoints
- `GET /notes` - List notes with filtering and pagination
- `POST /notes` - Create a new note
- `GET /notes/:id` - Get note by ID
- `PATCH /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `POST /notes/:id/share` - Share note with users
- `GET /notes/:id/versions` - Get note versions
- `POST /notes/:id/versions/:version/restore` - Restore note version

## 👑 Admin API

### Endpoints
- `GET /admin/stats` - Get system statistics
- `GET /admin/users` - List all users with pagination
- `POST /admin/users/:id/toggle-status` - Activate/deactivate user
- `POST /admin/users/:id/change-role` - Change user role (USER/ADMIN)
- `DELETE /admin/users/:id` - Delete user permanently
- `GET /admin/notes` - List all notes in system
- `DELETE /admin/notes/:id` - Delete any note
- `GET /admin/activity` - Get recent system activity

### Query Parameters
- `page`, `limit` - Pagination
- `search` - Search in title and content
- `tags` - Filter by tags
- `visibility` - Filter by visibility (PRIVATE, SHARED, PUBLIC)
- `authorId` - Filter by author
- `sortBy`, `sortOrder` - Sorting options

## 🔔 Notifications

### Real-time Features
- Live notifications via WebSocket
- Note sharing notifications
- Note update notifications
- System announcements

### WebSocket Events
- `notification` - New notification received
- `note-updated` - Note was updated
- `system-message` - System-wide message

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Docker Production

```bash
# Build and start all services
docker-compose --profile production up -d

# Or build manually
docker build -t notes-backend .
docker run -p 3000:3000 notes-backend
```

### Manual Production

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## 📊 Monitoring

### Health Checks
- `GET /health` - Application health status
- `GET /health/db` - Database connectivity
- `GET /health/redis` - Redis connectivity

### Metrics
The application includes built-in health checks and can be integrated with monitoring solutions like:
- Prometheus
- Grafana
- New Relic
- DataDog

## 🔒 Security Features

- **Rate Limiting**: Multiple tiers (short/medium/long term)
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js integration
- **Password Security**: Bcrypt hashing with salt rounds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the health endpoints for system status

## 🗺️ Roadmap

- [ ] Advanced search with Elasticsearch
- [ ] File attachments for notes
- [ ] Note templates
- [ ] Collaborative editing
- [ ] Mobile app API enhancements
- [ ] Advanced analytics and reporting
- [ ] Integration with external services (Google Drive, Dropbox)
- [ ] Advanced notification preferences
- [ ] Note categories and folders
- [ ] Export functionality (PDF, Markdown, etc.)#   R e a l - T i m e - N o t e s - M a n a g e m e n t - S y s t e m - B a c k e n d  
 #   R e a l - T i m e - N o t e s - M a n a g e m e n t - S y s t e m - B a c k e n d  
 