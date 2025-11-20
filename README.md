# 🐸G-M8(GROUPMATE)

A next-generation web platform that helps **teachers and students collaborate efficiently** through organized classrooms, student groups, real-time chats, and project submissions — all in one place.  
Designed for seamless academic teamwork and project management.

---

## 📌 Overview

**GroupMate** is a full-stack web application that makes **classroom group management and collaboration** effortless.

Teachers can create classrooms, manage students, assign projects, and monitor progress — while students can form groups, communicate, and manage submissions all under one platform.

Each classroom works independently with its own students, groups, deadlines, and chat systems.

---

## 🧩 Features

### 👩‍🏫 For Teachers
- Create and manage multiple classrooms  
- Generate unique **join codes** for each class  
- View all student groups in a classroom  
- Assign project **deadlines** and **resources**  

### 🎓 For Students
- Join a class using the provided code  
- Create new groups with custom names  
- Choose a **group leader** and invite friends  
- If not in a group — browse all groups and send a **join request**  
- Group leader can **accept or reject** requests  

### 💬 Group Collaboration
- Built-in **group chat** using Socket.io for instant messaging  
- Share resources and ideas in real time  
- Keep track of tasks, deadlines, and members  

---
## Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React.js, ShadCN UI |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Authentication** | JWT (JSON Web Token) |
| **Real-Time Chat** | Socket.io |
| **Version Control** | Git + GitHub |

---

## 📂 Folder Structure
```bash
G-M8
│
├── client/                     # 🌐 Frontend (React)
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── logo.png
│   │
│   └── src/
│       ├── assets/             # Images, icons, logos
│       ├── components/         # Reusable UI components (Navbar, ChatBox, etc.)
│       ├── pages/              # Full pages (Dashboard, Login, ClassroomView, etc.)
│       ├── context/            # React Context (AuthContext, SocketContext)
│       ├── hooks/              # Custom React hooks
│       ├── services/           # API calls (Axios)
│       ├── utils/              # Helper functions
│       ├── App.js
│       ├── index.js
│       └── styles/             # CSS 
│
├── server/                     # ⚙️ Backend (Node.js + Express)
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── socket.js           # Socket.io setup (for real-time chat)
│   │
│   ├── controllers/            # Logic for each route
│   │   ├── userController.js
│   │   ├── groupController.js
│   │   ├── classController.js
│   │   └── chatController.js
│   │
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js
│   │   ├── Class.js
│   │   ├── Group.js
│   │   └── Message.js
│   │
│   ├── routes/                 # All API endpoints
│   │   ├── userRoutes.js
│   │   ├── classRoutes.js
│   │   ├── groupRoutes.js
│   │   └── chatRoutes.js
│   │
│   ├── middleware/             # Auth & error handlers
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── utils/                  # Token generation, validators
│   ├── server.js               # Entry point for Express app
│   └── package.json
│
├── README.md
└──package.json                # Root for combined scripts
```

---

# Project members
>1. Kurumeti Mitesh
>2. Mohammed Tahir Siddique
>3. Pavan Kishor M
>4. Rohith G S

