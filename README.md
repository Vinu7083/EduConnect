# EduConnect 

A modern Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time chat, AI-powered Q&A, and material sharing capabilities.

## 🚀 Quick Start

### Prerequisites

1. Install [Node.js](https://nodejs.org/) (version 14 or higher)
2. Install [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
3. Get an [OpenAI API key](https://platform.openai.com/api-keys)

### Installation



2. Install dependencies for both frontend and backend
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   ```

3. Set up environment variables
   ```bash
   # In the backend directory, copy .env.example to .env
   cp .env.example .env
   ```

   Edit `.env` and add your values:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/lms
   JWT_SECRET=your_jwt_secret_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   FRONTEND_URL=http://localhost:3000
   UPLOAD_PATH=./uploads
   ```

4. Start MongoDB
   ```bash
   # On macOS/Linux
   sudo service mongod start
   # OR on Windows
   net start MongoDB
   ```

5. Start the development servers
   ```bash
   # Start backend server (from the backend directory)
   npm run dev

   # In a new terminal, start frontend server (from the root directory)
   npm run dev
   ```

6. Open your browser and navigate to:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🎯 Features

- **Authentication**
  - Student and Professor registration/login
  - Role-based access control

- **Course Management**
  - Create and join courses
  - Upload and manage course materials
  - View course details and participants

- **Real-time Chat**
  - Course-specific discussion threads
  - Support for text, images, and file attachments
  - Real-time updates using Socket.IO

- **AI-powered Q&A**
  - Students can ask questions to AI
  - Professor review and approval system
  - Integration with OpenAI's GPT model

- **Material Sharing**
  - Upload various file types (PDF, DOC, PPT, images)
  - Organize materials by course
  - Easy access and download

## 📁 Project Structure

```
/
├── backend/                # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── server.js         # Entry point
│
└── frontend/             # React frontend
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable components
        ├── context/      # React context
        ├── hooks/        # Custom hooks
        ├── pages/        # Page components
        ├── services/     # API services
        └── types/        # TypeScript types
```

## 🔧 Development

### Backend API Routes

- **Auth**
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user

- **Courses**
  - `GET /api/courses` - Get all courses
  - `POST /api/courses` - Create course
  - `GET /api/courses/:id` - Get course details

- **Chat**
  - `GET /api/threads` - Get chat threads
  - `POST /api/messages` - Send message
  - `GET /api/messages?threadId=:id` - Get thread messages

- **Materials**
  - `GET /api/materials` - Get course materials
  - `POST /api/materials` - Upload material

- **AI Q&A**
  - `POST /api/ai/chat` - Ask AI question
  - `GET /api/ai/pending` - Get pending responses
  - `POST /api/ai/approve` - Approve AI response

### Database Models

- **User**
  - name: String
  - email: String (unique)
  - password: String (hashed)
  - role: String (student/professor)

- **Course**
  - title: String
  - code: String (unique)
  - description: String
  - professor: ObjectId (ref: User)
  - students: [ObjectId] (ref: User)

- **Material**
  - title: String
  - description: String
  - fileUrl: String
  - courseId: ObjectId (ref: Course)
  - uploadedBy: ObjectId (ref: User)

- **Message**
  - threadId: ObjectId (ref: Thread)
  - userId: ObjectId (ref: User)
  - content: String
  - role: String (student/professor/ai)
  - approved: Boolean

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.