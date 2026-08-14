import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: (origin, callback) => {
      // Allow all origins dynamically to prevent CORS block issues in production/development
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}
// used to store active live audio rooms
const roomsMap = {}; // { roomId: { roomId, title, hostId, createdAt, participants: { [socketId]: { socketId, userId, name, avatar, isMuted } } } }
// used to store active P2P share codes
const shareCodesMap = {}; // { code: { senderId, socketId, transferId, metadata } }

function getActiveRoomsList() {
  return Object.values(roomsMap).map((room) => ({
    roomId: room.roomId,
    title: room.title,
    hostId: room.hostId,
    isLocked: !!room.isLocked,
    participantCount: Object.keys(room.participants || {}).length,
    participants: Object.values(room.participants || {}),
  }));
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") userSocketMap[userId] = socket.id;

  // Send online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  // Send active audio rooms list
  socket.emit("active-rooms-list", getActiveRoomsList());

  // Room creation
  socket.on("create-room", ({ title, roomId, user }) => {
    if (!roomId) return;
    if (!roomsMap[roomId]) {
      roomsMap[roomId] = {
        roomId,
        title: title || "Live Audio Room",
        hostId: user?._id || socket.id,
        isLocked: false,
        createdAt: new Date(),
        participants: {},
      };
    }
    io.emit("active-rooms-list", getActiveRoomsList());
  });

  // Fetch active rooms
  socket.on("get-active-rooms", () => {
    socket.emit("active-rooms-list", getActiveRoomsList());
  });

  // Join audio room
  socket.on("join-room", ({ roomId, user }) => {
    if (!roomId) return;

    // Check if room exists and is locked
    if (roomsMap[roomId] && roomsMap[roomId].isLocked) {
      const isHost = roomsMap[roomId].hostId === user?._id || roomsMap[roomId].hostId === socket.id;
      if (!isHost) {
        socket.emit("room-locked-error", { message: "This audio room is locked by the host." });
        return;
      }
    }

    socket.join(roomId);

    if (!roomsMap[roomId]) {
      roomsMap[roomId] = {
        roomId,
        title: "Live Audio Room",
        hostId: user?._id || socket.id,
        isLocked: false,
        createdAt: new Date(),
        participants: {},
      };
    }

    const participantInfo = {
      socketId: socket.id,
      userId: user?._id || socket.id,
      name: user?.fullName || user?.name || "Guest Participant",
      avatar: user?.profilePic || "/avatar.png",
      isMuted: false,
    };

    roomsMap[roomId].participants[socket.id] = participantInfo;

    // Send existing peers in room to newly joined user
    const existingParticipants = Object.values(roomsMap[roomId].participants).filter(
      (p) => p.socketId !== socket.id
    );
    socket.emit("room-users", {
      roomId,
      title: roomsMap[roomId].title,
      hostId: roomsMap[roomId].hostId,
      isLocked: roomsMap[roomId].isLocked,
      users: existingParticipants,
    });

    // Notify existing peers in room about new user
    socket.to(roomId).emit("user-connected", participantInfo);

    io.emit("active-rooms-list", getActiveRoomsList());
  });

  // WebRTC Signaling: relay SDP offer
  socket.on("offer", ({ targetSocketId, offer }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit("offer", {
        callerSocketId: socket.id,
        offer,
      });
    }
  });

  // WebRTC Signaling: relay SDP answer
  socket.on("answer", ({ targetSocketId, answer }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit("answer", {
        callerSocketId: socket.id,
        answer,
      });
    }
  });

  // WebRTC Signaling: relay ICE candidate
  socket.on("ice-candidate", ({ targetSocketId, candidate }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", {
        callerSocketId: socket.id,
        candidate,
      });
    }
  });

  // Toggle Mute event
  socket.on("toggle-mute", ({ roomId, isMuted }) => {
    if (roomId && roomsMap[roomId] && roomsMap[roomId].participants[socket.id]) {
      roomsMap[roomId].participants[socket.id].isMuted = isMuted;
      io.to(roomId).emit("user-mute-toggled", {
        socketId: socket.id,
        isMuted,
      });
      io.emit("active-rooms-list", getActiveRoomsList());
    }
  });

  // --- HOST CONTROLS ---

  // Host: Mute all non-host participants
  socket.on("host-mute-all", ({ roomId }) => {
    if (roomId && roomsMap[roomId]) {
      Object.keys(roomsMap[roomId].participants).forEach((peerSocketId) => {
        if (peerSocketId !== socket.id) {
          roomsMap[roomId].participants[peerSocketId].isMuted = true;
        }
      });
      io.to(roomId).emit("host-muted-all-peers");
      io.emit("active-rooms-list", getActiveRoomsList());
    }
  });

  // Host: Toggle Lock Room
  socket.on("host-toggle-lock", ({ roomId, isLocked }) => {
    if (roomId && roomsMap[roomId]) {
      roomsMap[roomId].isLocked = isLocked;
      io.to(roomId).emit("room-lock-toggled", { isLocked });
      io.emit("active-rooms-list", getActiveRoomsList());
    }
  });

  // Host: Rename Room Title
  socket.on("host-rename-room", ({ roomId, newTitle }) => {
    if (roomId && roomsMap[roomId] && newTitle.trim()) {
      roomsMap[roomId].title = newTitle.trim();
      io.to(roomId).emit("room-title-updated", { title: newTitle.trim() });
      io.emit("active-rooms-list", getActiveRoomsList());
    }
  });

  // Host: End Room Session for everyone
  socket.on("host-end-room", ({ roomId }) => {
    if (roomId && roomsMap[roomId]) {
      io.to(roomId).emit("room-ended", { message: "The host has ended the audio room." });
      delete roomsMap[roomId];
      io.emit("active-rooms-list", getActiveRoomsList());
    }
  });

  // Leave room event
  socket.on("leave-room", ({ roomId }) => {
    if (roomId && roomsMap[roomId]) {
      socket.leave(roomId);
      delete roomsMap[roomId].participants[socket.id];
      socket.to(roomId).emit("user-disconnected", { socketId: socket.id });

      if (Object.keys(roomsMap[roomId].participants).length === 0) {
        delete roomsMap[roomId];
      }
      io.emit("active-rooms-list", getActiveRoomsList());
    }
  });

  // WebRTC Peer-to-Peer File Transfer Signaling Relay
  socket.on("file-transfer-signal", ({ receiverId, signal }) => {
    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("file-transfer-signal", {
          senderId: userId,
          signal,
        });
      }
    }
  });

  // Share Code Handshake Registry
  socket.on("register-share-code", ({ code, transferId, metadata }) => {
    if (code && transferId && metadata) {
      shareCodesMap[code] = {
        senderId: userId,
        socketId: socket.id,
        transferId,
        metadata,
      };
      console.log(`P2P Registry: Registered code [${code}] for user [${userId}]`);
    }
  });

  socket.on("resolve-share-code", ({ code }) => {
    const entry = shareCodesMap[code];
    if (!entry) {
      socket.emit("share-code-error", { message: "Share code is invalid or has expired." });
      return;
    }

    console.log(`P2P Registry: Resolved code [${code}]. Connecting receiver [${userId}] to sender [${entry.senderId}]`);

    // Notify sender that a receiver matched the code
    io.to(entry.socketId).emit("share-code-matched", {
      receiverId: userId,
    });

    // Notify receiver with the file metadata and sender info
    socket.emit("share-code-resolved", {
      senderId: entry.senderId,
      transferId: entry.transferId,
      metadata: entry.metadata,
    });

    // Remove the code since it is successfully matched (single-use for security)
    delete shareCodesMap[code];
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Clean up active share codes associated with this socket
    Object.keys(shareCodesMap).forEach((code) => {
      if (shareCodesMap[code].socketId === socket.id) {
        console.log(`P2P Registry: Cleaned up orphaned code [${code}]`);
        delete shareCodesMap[code];
      }
    });

    // Cleanup audio rooms
    Object.keys(roomsMap).forEach((roomId) => {
      if (roomsMap[roomId].participants[socket.id]) {
        delete roomsMap[roomId].participants[socket.id];
        socket.to(roomId).emit("user-disconnected", { socketId: socket.id });

        if (Object.keys(roomsMap[roomId].participants).length === 0) {
          delete roomsMap[roomId];
        }
      }
    });
    io.emit("active-rooms-list", getActiveRoomsList());
  });
});

export { io, app, server };
