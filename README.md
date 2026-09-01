# CP Progress Tracker 🚀

A full-stack Competitive Programming Progress Tracking platform built to monitor and compare Codeforces performance. The application helps users track contest ratings, solved problems, rankings, and overall progress through an interactive dashboard.

## 🌐 Live Demo

**Live Website:** https://cp-progress-tracker-red.vercel.app/

## ✨ Features

### 👤 User Management
- Add Codeforces users by handle
- View detailed user profiles
- Store and manage tracked users
- Delete users when needed

### 📊 Performance Dashboard
- Current Codeforces rating
- Maximum rating achieved
- Rank and maximum rank
- Number of contests participated
- Total problems solved
- User statistics overview

### 🏆 Leaderboard
- Compare all tracked users
- Sort users based on performance
- View rankings at a glance
- Track progress against peers

### 📅 Contest Calendar
- Upcoming Codeforces contests
- Previous contests history
- Contest duration and timing
- Direct links to contest pages

### 📈 Analytics
- Rating history visualization
- Recent activity tracking
- Last solved problems
- Performance insights

### 🔐 Admin Panel
- Add new users
- Manage tracked users
- Maintain leaderboard data

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- React Icons
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### External APIs
- Codeforces API

---

## 📂 Project Structure

```text
cp-progress-tracker/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── assets/
│   │
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone <your-repository-url>
cd cp-progress-tracker
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

---

## 🚀 Deployment

### Frontend
- Deployed on Vercel

### Backend
- Deployed on Railway

---

## 📡 API Endpoints

### Users

```http
GET    /api/users
POST   /api/users
DELETE /api/users/:id
```

### Leaderboard

```http
GET /api/users/leaderboard
```

### Contest Calendar

```http
GET /api/calendar
```

---

## 🎯 Future Improvements

- User authentication
- Friend groups and teams
- Rating prediction system
- Advanced analytics dashboard
- Problem recommendation engine
- Daily progress tracking
- Contest performance analysis

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Abhishek Shahi**

Competitive Programming Progress Tracker built to help programmers monitor and improve their Codeforces journey.