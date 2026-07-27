<div align="center">

# 💬 Chatly — Native Audio & Real-Time Chat Suite

**A state-of-the-art, full-stack real-time messaging platform and live drop-in audio suite built with React, Node.js, Socket.IO, and P2P WebRTC — with zero external audio SDK dependencies.**

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P-FF6B00?style=for-the-badge&logo=webrtc&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 🌟 Key Features

### 1. 🎤 In-Chat Voice Notes (Pure `MediaRecorder` API)
- **Inline Recording Panel**: Live timer (`00:00`), pulsing red recording indicator, trash/cancel button, and instant send.
- **Custom Waveform Player**: Inline audio player in chat history with Play/Pause, dynamic animated soundwave bars, scrubbable progress timeline, duration timer, and speed multiplier toggles (`1x`, `1.5x`, `2x`).

### 2. 🎙️ Dedicated Live Audio Rooms (Peer-to-Peer WebRTC Mesh)
- **Clubhouse & Discord Style Channels**: Drop-in live audio rooms with direct shareable invite link routing (`/room/:roomId`).
- **Active Speaker Visualizer**: Browser `AudioContext` & `AnalyserNode` frequency spectrum volume detection driving a **pulsing glowing orange aura ring** around active speakers.
- **Creator Host Controls**: Golden Crown Host badge, Mute All Participants button, Room Lock/Unlock switch, Edit Room Title, and End Room Session for everyone.
- **Guest Access Support**: Instant guest display name setup for unauthenticated link openers.

### 3. 💬 Real-Time Direct Messaging
- Instant 1-on-1 messaging powered by Socket.IO.
- Base64 & Cloudinary image attachments.
- Online user status indicators and real-time unread notification badges.

### 4. 🎨 Sleek Dark & Light Themes
- Retro black-outlined aesthetic with smooth HSL color palettes and CSS custom properties.
- Dynamic theme switching with instant persistence.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React 18)                              │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │   Pages & Dashboards │  │      Components      │  │   Zustand Stores  │  │
│  │  HomePage (Chats)    │  │ MessageInput (Mic)   │  │ useAuthStore      │  │
│  │  AudioRoomsDashboard │  │ AudioMessageBubble   │  │ useChatStore      │  │
│  │  AudioRoomPage (P2P) │  │ HostSettingsModal    │  │ useThemeStore     │  │
│  └──────────────────────┘  └──────────────────────┘  └───────────────────┘  │
│                             │                  │                            │
│                  HTTP (Axios REST)        WebSocket & WebRTC                │
└─────────────────────────────┼──────────────────┼────────────────────────────┘
                              │                  │
┌─────────────────────────────┼──────────────────┼────────────────────────────┐
│                             ▼                  ▼                            │
│                      SERVER (Node.js + Express + Socket.IO)                 │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │     REST API Routes  │  │   Signaling Broker   │  │   Cloud Storage   │  │
│  │ /api/auth            │  │ join-room, offer     │  │ Cloudinary        │  │
│  │ /api/messages        │  │ answer, ice-candidate│  │ (Image & Audio)   │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └───────────────────┘  │
└─────────────┼─────────────────────────┼─────────────────────────────────────┘
              ▼                         ▼
    ┌──────────────────┐      ┌─────────────────────────┐
    │  MongoDB Database│      │ WebRTC P2P Media Mesh   │
    │  (Users/Messages)│      │  [Peer A] ◄═══► [Peer B]│
    └──────────────────┘      └─────────────────────────┘
```

---

## 🔄 WebRTC Signaling & P2P Connection Flow

```
   [Peer A (Host)]               [Socket.IO Server]               [Peer B (Joiner)]
          │                              │                                │
          │──── 1. emit("create-room") ─►│                                │
          │                              │◄─── 2. emit("join-room") ──────│
          │◄── 3. emit("user-connected")─│                                │
          │                              │                                │
          │──── 4. createOffer() ───────►│                                │
          │     emit("offer")            │──── 5. relay offer ───────────►│
          │                              │                                │
          │                              │◄─── 6. createAnswer() ─────────│
          │◄── 7. relay answer ──────────│     emit("answer")             │
          │                              │                                │
          │──── 8. ICE Candidate (STUN)─►│                                │
          │                              │──── 9. relay ICE candidate ───►│
          │                              │                                │
          └═══════════════════════════════════════════════════════════════┘
                          DIRECT ENCRYPTED P2P AUDIO STREAM
```

---

## 📁 Directory Structure

```text
fullstack-chat-app/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Auth and message logic
│   │   ├── lib/            # DB, Cloudinary, and Socket.IO WebRTC signaling
│   │   ├── middleware/     # JWT route protection
│   │   ├── models/         # Mongoose User and Message schemas
│   │   ├── routes/         # Express API routes
│   │   └── index.js        # Server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # AudioMessageBubble, MessageInput, HostSettingsModal, Navbar, Sidebar
    │   ├── pages/          # HomePage, AudioRoomsDashboardPage, AudioRoomPage, Auth pages
    │   ├── store/          # Zustand auth, chat, and theme state management
    │   ├── lib/            # Axios instance and formatting utilities
    │   ├── App.jsx         # App router and toast configuration
    │   └── main.jsx        # React DOM entry point
    └── package.json
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Database (Local or MongoDB Atlas)
- Cloudinary Account (for image & audio hosting)

### 1. Clone Repository
```bash
git clone https://github.com/RohitChintalapudi/Chatly.git
cd Chatly
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🌐 WebSocket Signaling Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client ➔ Server | `{ roomId, user }` | Joins a live audio room session |
| `room-users` | Server ➔ Client | `{ roomId, title, hostId, users }` | Returns active participants in room |
| `user-connected` | Server ➔ Broadcast | `{ socketId, userId, name, avatar }` | Notifies room peers of new participant |
| `offer` | Client ⇄ Client | `{ targetSocketId, offer }` | Relays WebRTC SDP Offer |
| `answer` | Client ⇄ Client | `{ targetSocketId, answer }` | Relays WebRTC SDP Answer |
| `ice-candidate` | Client ⇄ Client | `{ targetSocketId, candidate }` | Relays STUN network candidates |
| `toggle-mute` | Client ➔ Server | `{ roomId, isMuted }` | Broadcasts microphone mute status |
| `host-mute-all` | Host ➔ Room | `{ roomId }` | Force mutes all non-host participants |
| `host-toggle-lock`| Host ➔ Room | `{ roomId, isLocked }` | Locks/unlocks room from new joiners |
| `host-end-room` | Host ➔ Room | `{ roomId }` | Terminates live audio room session |

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 **Rohit Chintalapudi**

---

<div align="center">

**Built with passion by [Rohit Chintalapudi](https://github.com/RohitChintalapudi)**

</div>
