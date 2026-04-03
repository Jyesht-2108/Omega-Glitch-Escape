# 🎮 Omega Glitch Escape - CTF Game

A multi-level Capture The Flag (CTF) game built with Go backend and React frontend. Players solve progressively challenging puzzles while racing against time and competing on a live leaderboard.

## 🌟 Features

- **4 Progressive Levels**: From basic puzzles to advanced challenges
- **Real-time Leaderboard**: Live scoring and rankings
- **Team-based Competition**: Collaborative gameplay
- **Admin Dashboard**: Comprehensive game management
- **Anti-Cheat System**: Prevents console manipulation
- **Auto-save Progress**: Never lose your progress
- **Responsive Design**: Works on desktop and mobile
- **Secure Authentication**: JWT-based auth with Supabase

## 🏗️ Architecture

### Backend (Go)
- **Framework**: Gin Web Framework
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **API**: RESTful endpoints

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Routing**: React Router v6

## 📋 Prerequisites

- **Go**: 1.21 or higher
- **Node.js**: 18 or higher
- **Supabase Account**: For database
- **Git**: For version control

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/omega-glitch-escape.git
cd omega-glitch-escape
```

### 2. Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env

# Install dependencies
go mod download

# Run database migrations
# Go to Supabase SQL Editor and run:
# - database/supabase.sql
# - database/admin_migration.sql

# Start backend
go run main.go
```

Backend will run on `http://localhost:3000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (default points to localhost:3000)
nano .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:8080`

### 4. Access the Game

- **Game**: http://localhost:8080
- **Admin Panel**: http://localhost:8080/admin
- **API Health**: http://localhost:3000/health

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Getting Started
- [Quick Start Guide](docs/QUICK_START.md) - Get up and running quickly
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deploy to production (AWS + Vercel)

### Admin Guides
- [Admin System Overview](docs/ADMIN_SYSTEM.md)
- [Admin Quick Start](docs/ADMIN_QUICK_START.md)
- [Admin Complete Guide](docs/ADMIN_COMPLETE_GUIDE.md)
- [Admin Testing](docs/ADMIN_TESTING.md)

### Technical Documentation
- [Frontend-Backend Integration](docs/FRONTEND_BACKEND_INTEGRATION.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Security Verification](docs/SECURITY_VERIFICATION.md)
- [Supabase Connection Pool](docs/SUPABASE_CONNECTION_POOL.md)

### Feature Documentation
- [Anti-Cheat System](docs/ANTI_CHEAT_IMPROVEMENTS.md)
- [Auto-Save Feature](docs/AUTO_SAVE_FIX.md)
- [Live Leaderboard](docs/LIVE_LEADERBOARD.md)
- [Level Access Control](docs/LEVEL_ACCESS_CONTROL.md)

## 🎯 Game Levels

### Level 1: The Awakening
Basic puzzle to get started. Players learn the game mechanics.

### Level 2: Pattern Recognition
Intermediate challenge requiring pattern analysis.

### Level 3: Admin Access
Advanced puzzle involving system exploration and hidden clues.

### Level 4: The Final Glitch
Ultimate challenge combining all previous skills.

## 🔐 Admin Features

Access admin panel at `/admin` with credentials from `.env`:

- **Dashboard**: Overview of all teams and progress
- **Team Management**: View, edit, and manage teams
- **Requalify Teams**: Reset teams that completed the game
- **Live Monitoring**: Real-time team progress tracking
- **Leaderboard Management**: View and manage rankings

## 🛠️ Development

### Backend Commands

```bash
cd backend

# Run server
go run main.go

# Build binary
go build -o ctf-game-server .

# Run tests
go test ./...

# Format code
go fmt ./...
```

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

## 📦 Project Structure

```
omega-glitch-escape/
├── backend/
│   ├── config/          # Configuration management
│   ├── database/        # SQL migrations
│   ├── handlers/        # HTTP request handlers
│   ├── middleware/      # Auth and CORS middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── main.go          # Entry point
│   └── .env.example     # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── lib/         # Utilities
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.tsx      # Main app component
│   ├── public/          # Static assets
│   └── .env.example     # Environment template
├── docs/                # Documentation
├── DEPLOYMENT_GUIDE.md  # Production deployment
└── README.md            # This file
```

## 🌐 Deployment

### Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete instructions on deploying to:
- **Backend**: AWS EC2 (t3.medium)
- **Frontend**: Vercel
- **Database**: Supabase

### Quick Deploy

**Backend (AWS EC2):**
```bash
# Build
go build -o ctf-game-server .

# Run as service
sudo systemctl start ctf-game
```

**Frontend (Vercel):**
```bash
# Deploy
vercel --prod
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Server
PORT=3000
FRONTEND_URL=http://localhost:8080

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password
```

### Frontend Environment Variables

```env
# API
VITE_API_URL=http://localhost:3000/api

# Features
VITE_AUTO_SAVE_INTERVAL=30000
VITE_ANTI_CHEAT_ENABLED=true
VITE_ANTI_CHEAT_MAX_STRIKES=3
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Manual Testing
See [docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for comprehensive testing procedures.

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check `.env` file exists and has correct values
- Verify Supabase credentials
- Check port 3000 is not in use

**Frontend can't connect to backend:**
- Verify backend is running on port 3000
- Check `VITE_API_URL` in frontend `.env`
- Check CORS configuration in backend

**Database connection errors:**
- Verify Supabase credentials
- Check database migrations are applied
- Verify connection pool settings

See [docs/DEBUG_STEPS.md](docs/DEBUG_STEPS.md) for more troubleshooting help.

## 📊 Performance

- **Concurrent Users**: Supports 50+ simultaneous players
- **Response Time**: < 100ms for most API calls
- **Database**: Connection pooling for optimal performance
- **Frontend**: Optimized bundle size with code splitting

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Anti-cheat system
- Secure admin access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Vivek, Jyesht

## 🙏 Acknowledgments

- Supabase for database hosting
- Gin framework for Go backend
- React team for the frontend framework
- Tailwind CSS for styling

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in `docs/`
- Review troubleshooting guides

## 🗺️ Roadmap

- [ ] Add more puzzle levels
- [ ] Implement team chat
- [ ] Add puzzle hints system
- [ ] Create mobile app
- [ ] Add achievement system
- [ ] Implement team profiles
- [ ] Add puzzle editor for admins

---

**Ready to play?** Follow the [Quick Start](#-quick-start) guide and start your CTF adventure! 🚀
