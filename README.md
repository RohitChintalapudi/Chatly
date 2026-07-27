<div align="center">

# Chatly

**A full-stack real-time chat application with a retro black-outlined aesthetic, customizable themes, and live messaging powered by WebSockets.**

![Demo App](/frontend/public/screenshot-for-readme.png)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Pages    │  │Components│  │  Stores  │  │   Lib      │  │
│  │ Landing   │  │ Navbar   │  │ Auth     │  │ axios.js   │  │
│  │ Home      │  │ Sidebar  │  │ Chat     │  │ utils.js   │  │
│  │ Login     │  │ Chat     │  │ Theme    │  │            │  │
│  │ SignUp    │  │ Message  │  │          │  │            │  │
│  │ Settings  │  │ Skeletons│  │          │  │            │  │
│  │ Profile   │  └──────────┘  └──────────┘  └────────────┘  │
│  └──────────┘                                               │
│                         │  HTTP + WebSocket                  │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    SERVER (Express + Socket.io)              │
│                         │                                    │
│  ┌──────────┐  ┌────────┴───────┐  ┌──────────────────┐    │
│  │  Routes   │  │  Controllers   │  │    Middleware     │    │
│  │ /auth     │  │  auth          │  │ protectRoute     │    │
│  │ /messages │  │  message       │  │ (JWT verify)     │    │
│  │ /contact  │  │  contact       │  └──────────────────┘    │
│  └──────────┘  └────────────────┘                            │
│                         │                                    │
│  ┌──────────┐  ┌────────┴───────┐  ┌──────────────────┐    │
│  │  Models   │  │     Lib        │  │   Socket.io      │    │
│  │ User      │  │  db.js         │  │ online tracking  │    │
│  │ Message   │  │  cloudinary.js │  │ message events   │    │
│  │ Contact   │  │  utils.js      │  │ userMap          │    │
│  └──────────┘  └────────────────┘  └──────────────────┘    │
│                         │                                    │
└─────────────────────────┼───────────────────────────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
     ┌────────┴──┐  ┌─────┴────┐  ┌──┴──────────┐
     │  MongoDB   │  │Cloudinary│  │  JWT Cookie  │
     │  Atlas     │  │  Images  │  │  Auth Token  │
     └───────────┘  └──────────┘  └─────────────┘
```

### Data Flow

```
User types message
       │
       ▼
MessageInput ──POST──▶ /api/messages/send/:id
                              │
                              ▼
                   message.controller.js
                   ├── Saves to MongoDB
                   ├── Uploads image to Cloudinary (if any)
                   └── Emits "newMessage" via Socket.io
                              │
                              ▼
                   Socket.io ──▶ Receiver's client
                              │
                              ▼
                   useChatStore listener
                   ├── If sender is selected → append to messages
                   └── If sender is different → increment unread count
                              │
                              ▼
                   Sidebar shows unread badge
                   ChatContainer shows new message
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI framework with hooks and functional components |
| **React Router v6** | Client-side routing with protected/public routes |
| **Zustand** | Lightweight global state management (Auth, Chat, Theme stores) |
| **Tailwind CSS** | Utility-first CSS with CSS custom properties for theming |
| **DaisyUI** | Tailwind component library |
| **Socket.io Client** | Real-time WebSocket communication |
| **Axios** | HTTP client with cookie-based credentials |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications for success/error feedback |
| **Vite** | Build tool and dev server |
| **CSS Custom Properties** | Dynamic accent colors, dark/light mode via `--accent`, `--surface`, `--line` etc. |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express** | HTTP server with RESTful API |
| **MongoDB + Mongoose** | NoSQL database with schema validation |
| **Socket.io** | Real-time bidirectional WebSocket server |
| **JWT (jsonwebtoken)** | Stateless authentication via httpOnly cookies |
| **bcryptjs** | Password hashing with salt rounds |
| **Cloudinary** | Cloud image storage (profile pics, chat images) |
| **cookie-parser** | Parse HTTP cookies for JWT extraction |
| **dotenv** | Environment variable management |

### DevOps & Deployment

| Tool | Purpose |
|---|---|
| **Vite** | Frontend build tool (produces optimized `dist/`) |
| **nodemon** | Backend auto-restart during development |
| **concurrently** | Run frontend + backend simultaneously |
| **Render / Railway** | Backend hosting (free tier) |
| **Vercel** | Frontend hosting (free tier) |

---

## Features

### Authentication & Security
- Sign up / Login / Logout with email + password
- JWT stored in **httpOnly cookies** (XSS-resistant)
- **SameSite=strict** for CSRF protection
- bcrypt password hashing (salt rounds: 10)
- `protectRoute` middleware on all sensitive endpoints
- Password change with old password verification

### Real-Time Messaging
- One-to-one direct chat between any two users
- Instant message delivery via **Socket.io WebSockets**
- Messages persisted in MongoDB with timestamps
- Text and image messages supported

### Image Sharing
- Profile picture upload (stored on Cloudinary)
- Image messages in chat (base64 → Cloudinary → URL)
- 10MB request body limit for large images

### Online Presence
- Real-time online/offline status indicators
- Socket.io tracks connected users via `userSocketMap`
- Live `getOnlineUsers` broadcast on connect/disconnect

### Unread Message Tracking
- Per-user unread badge on sidebar contacts
- Badge appears instantly via socket events
- Auto-clears when you open that conversation
- Subtle background highlight on contacts with unread messages

### Theme Customization
- **Dark / Light mode** toggle (pure matte black `#0a0a0a` in dark mode)
- **8 accent colors**: Cyan, Pink, Purple, Blue, Green, Orange, Red, Yellow
- **5 chat font weights**: Normal, Medium, Semibold, Bold, Extra Bold
- All preferences persisted to localStorage
- Live chat preview in Settings page
- CSS custom properties for dynamic theming across the entire app

### UI/UX
- Animated landing page with hero, features, testimonials carousel, contact form
- Retro black-outlined aesthetic (`border-2 border-black` / `border-white`)
- Floating bubble backgrounds with subtle accent glow
- Skeleton loading states for smooth transitions
- Logout modal with gradual blur + fade animation
- Section-based navbar (Chat section, extensible for future Voice, etc.)

### Contact & Feedback
- Public contact form (no auth required)
- Messages stored in MongoDB
- Name, email, subject, message fields

---

## Project Structure

```
Chatly/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js      # signup, login, logout, updateProfile, changePassword
│   │   │   ├── message.controller.js   # getUsers, getMessages, sendMessage
│   │   │   └── contact.controller.js   # submitContactMessage
│   │   ├── models/
│   │   │   ├── user.model.js           # User schema (email, name, password, profilePic)
│   │   │   ├── message.model.js        # Message schema (sender, receiver, text, image)
│   │   │   └── contactMessage.model.js # Contact form schema
│   │   ├── routes/
│   │   │   ├── auth.route.js           # POST signup/login/logout, PUT update/change, GET check
│   │   │   ├── message.route.js        # GET users/:id, POST send/:id
│   │   │   └── contact.route.js        # POST /
│   │   ├── middleware/
│   │   │   └── auth.middleware.js      # protectRoute (JWT verification)
│   │   ├── lib/
│   │   │   ├── db.js                   # Mongoose connection
│   │   │   ├── socket.js               # Socket.io server + online user tracking
│   │   │   ├── cloudinary.js           # Cloudinary v2 config
│   │   │   └── utils.js                # generateToken (JWT creation)
│   │   ├── seeds/
│   │   │   └── user.seed.js            # 15 sample users for development
│   │   └── index.js                    # Express server entry point
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Animated marketing page
│   │   │   ├── HomePage.jsx            # Chat dashboard (sidebar + chat)
│   │   │   ├── LoginPage.jsx           # Login form
│   │   │   ├── SignUpPage.jsx          # Registration form
│   │   │   ├── SettingsPage.jsx        # Accent color + font weight picker
│   │   │   └── ProfilePage.jsx         # Profile card + password change
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Top nav (section tabs, theme toggle, auth buttons)
│   │   │   ├── Sidebar.jsx             # Contact list with online status + unread badges
│   │   │   ├── ChatContainer.jsx       # Message list with bubbles
│   │   │   ├── ChatDashboard.jsx       # Welcome screen with feature overview
│   │   │   ├── ChatHeader.jsx          # Selected user header
│   │   │   ├── MessageInput.jsx        # Text + image input
│   │   │   ├── SectionDivider.jsx      # Diamond divider component
│   │   │   └── skeletons/              # Loading skeletons
│   │   ├── store/
│   │   │   ├── useAuthStore.js         # Auth state, socket, online users
│   │   │   ├── useChatStore.js         # Messages, users, unread counts
│   │   │   └── useThemeStore.js        # Dark mode, accent color, font weight
│   │   ├── lib/
│   │   │   ├── axios.js                # Axios instance with base URL
│   │   │   └── utils.js                # Utility functions
│   │   ├── App.jsx                     # Routes + theme injection
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # CSS variables, keyframes, animations
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── package.json                        # Root orchestrator (build + start scripts)
```

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Login with email + password |
| POST | `/logout` | Yes | Clear JWT cookie |
| PUT | `/update-profile` | Yes | Update profile picture (Cloudinary) |
| PUT | `/change-password` | Yes | Change password (old → new) |
| GET | `/check` | Yes | Verify auth + return user data |

### Messages (`/api/messages`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | Yes | Get all users for sidebar |
| GET | `/:id` | Yes | Get conversation with a specific user |
| POST | `/send/:id` | Yes | Send message (text/image) to a user |

### Contact (`/api/contact`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | No | Submit a contact/feedback message |

---

## Setup & Installation

### Prerequisites

- **Node.js** >= 18
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary** account (free tier works) — [sign up here](https://cloudinary.com/)

### 1. Clone the repository

```bash
git clone https://github.com/RohitChintalapudi/Chatly.git
cd Chatly
```

### 2. Setup environment variables

Create `backend/.env`:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
```

### 3. Install dependencies & build

```bash
npm run build
```

This installs backend + frontend dependencies and builds the frontend.

### 4. Seed sample users (optional, for development)

```bash
cd backend
node src/seeds/user.seed.js
```

### 5. Start the app

```bash
npm start
```

The app runs at **http://localhost:5001** in production mode.

For development with hot reload:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend dev server runs at **http://localhost:5173**, proxying API calls to the backend.

---

## Concepts & Patterns Used

| Concept | Where | Why |
|---|---|---|
| **JWT in httpOnly cookies** | `utils.js`, `auth.middleware.js` | XSS-resistant auth tokens |
| **bcrypt password hashing** | `auth.controller.js` | Secure password storage |
| **Socket.io rooms & events** | `socket.js`, controllers | Real-time bidirectional messaging |
| **Zustand state management** | `useAuthStore`, `useChatStore`, `useThemeStore` | Lightweight global state without boilerplate |
| **CSS Custom Properties** | `index.css`, `App.jsx` | Dynamic theming (accent colors, dark mode) |
| **Optimistic UI updates** | `useChatStore.sendMessage` | Messages appear instantly before server confirmation |
| **Unread count tracking** | `useChatStore` | Per-user badge system via socket events |
| **Skeleton loading** | `SidebarSkeleton`, `MessageSkeleton` | Better perceived performance during data fetch |
| **Middleware pattern** | `protectRoute` | Reusable auth guard for protected routes |
| **RESTful API design** | All routes/controllers | Clean separation of concerns |
| **Component composition** | Pages → Components | Reusable, maintainable UI |
| **Environment-based config** | `dotenv`, `NODE_ENV` | Different behavior for dev vs production |
| **Base64 → Cloudinary upload** | Profile pics, chat images | Client-side image encoding for simplicity |
| **SPA with server fallback** | `index.js` production catch-all | Single-page app routing works on page refresh |

---

## What I Learned

Building Chatly from scratch taught me the full cycle of shipping a production-grade application:

- **Real-time architecture** — How Socket.io works under the hood: event-based communication, maintaining user-socket mappings, broadcasting events, and handling connect/disconnect lifecycle
- **Authentication depth** — Why httpOnly cookies are safer than localStorage tokens, how SameSite attributes prevent CSRF, and how bcrypt salting protects passwords
- **State management** — Why Zustand over Redux for this scale: less boilerplate, no providers needed, and clean selector patterns
- **WebSocket vs REST** — When to use each: REST for initial data loads, WebSocket for real-time updates
- **CSS architecture** — How CSS custom properties enable dynamic theming without rebuilding classes, and how to structure dark mode with Tailwind's `dark:` variant vs custom properties
- **MongoDB document design** — Schema design trade-offs for chat messages (embedding vs referencing), indexing for query performance
- **Cloudinary integration** — Base64 encoding trade-offs, upload workflows, and why multipart form-data is better for production
- **Full-stack debugging** — Debugging across the stack: socket connection issues, CORS configuration, cookie SameSite policies, MongoDB connection strings, and environment variable mismatches
- **UI/UX from design to code** — Translating a retro black-outlined aesthetic into Tailwind classes, creating smooth animations with CSS transitions, and building responsive layouts
- **Production deployment** — Setting up build pipelines, environment-specific configurations, static file serving, and SPA fallback routing

---

## Roadmap — V2 Plans

| Feature | Description | Status |
|---|---|---|
| **Voice Messages** | Record and send voice notes with playback controls & waveform visualizer | Completed |
| **Dedicated Audio Rooms** | Clubhouse/Discord style P2P WebRTC audio channels with host controls | Completed |
| **Group Chats** | Create group conversations with multiple participants | Planned |
| **Message Reactions** | React to messages with emojis | Planned |
| **Message Search** | Search through conversation history | Planned |
| **Read Receipts** | See when your message was delivered and read | Planned |
| **Push Notifications** | Browser notifications for new messages when tab is inactive | Planned |
| **Typing Indicators** | Show when the other user is typing a response | Planned |
| **Message Editing & Deletion** | Edit or delete sent messages | Planned |
| **User Status** | Custom status messages (Available, Busy, Away, etc.) | Planned |
| **File Sharing** | Send PDFs, documents, and other file types | Planned |
| **Chat Encryption** | End-to-end encryption for private conversations | Planned |

---

## License

This project is licensed under the MIT License.

---

<div align="center">

**Built with passion by [Rohit Chintalapudi](https://github.com/RohitChintalapudi)**

</div>
