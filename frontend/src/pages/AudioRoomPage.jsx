import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import HostSettingsModal from "../components/HostSettingsModal";
import { Mic, MicOff, Share2, LogOut, Copy, Check, Users, Sparkles, Volume2, Settings, Crown, Lock } from "lucide-react";
import toast from "react-hot-toast";

const STUN_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const AudioRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { authUser, socket } = useAuthStore();

  // Guest name state if unauthenticated
  const [guestName, setGuestName] = useState("");
  const [isGuestSubmitted, setIsGuestSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Room & Audio states
  const [roomTitle, setRoomTitle] = useState("Live Audio Room");
  const [roomHostId, setRoomHostId] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [participants, setParticipants] = useState([]); // Array of { socketId, userId, name, avatar, isMuted, isSpeaking }
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

  // WebRTC & Audio refs
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { [socketId]: RTCPeerConnection }
  const remoteAudioRefs = useRef({}); // { [socketId]: HTMLAudioElement }
  const audioContextRef = useRef(null);
  const analysersRef = useRef({}); // { [socketIdOrLocal]: AnalyserNode }
  const animationFrameRef = useRef(null);

  // Set user profile (auth user or guest)
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
      setIsGuestSubmitted(true);
    }
  }, [authUser]);

  // Voice frequency spectrum analyzer (AudioContext & AnalyserNode)
  const setupAudioAnalyzer = useCallback((stream, id) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      analysersRef.current[id] = analyser;
    } catch (err) {
      console.error("AudioContext setup error:", err);
    }
  }, []);

  // Continuous volume loop for speaking aura visualization
  const monitorSpeakingVolume = useCallback(() => {
    const dataArray = new Uint8Array(32);

    setParticipants((prevParticipants) =>
      prevParticipants.map((participant) => {
        const key = participant.socketId;
        const analyser = analysersRef.current[key];
        let isSpeaking = false;

        if (analyser && !participant.isMuted) {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const averageVolume = sum / dataArray.length;
          isSpeaking = averageVolume > 15; // Threshold for active voice
        }

        return { ...participant, isSpeaking };
      })
    );

    animationFrameRef.current = requestAnimationFrame(monitorSpeakingVolume);
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(monitorSpeakingVolume);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [monitorSpeakingVolume]);

  // Cleanup helper
  const leaveRoom = useCallback(() => {
    // Stop local media stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close all RTCPeerConnections
    Object.keys(peerConnectionsRef.current).forEach((socketId) => {
      if (peerConnectionsRef.current[socketId]) {
        peerConnectionsRef.current[socketId].close();
      }
    });
    peerConnectionsRef.current = {};

    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analysersRef.current = {};

    // Notify socket server
    if (socket) {
      socket.emit("leave-room", { roomId });
    }

    navigate("/audio-rooms");
  }, [navigate, roomId, socket]);

  // Initialize WebRTC Peer Connection for target socket ID
  const createPeerConnection = useCallback(
    (targetSocketId) => {
      if (peerConnectionsRef.current[targetSocketId]) {
        return peerConnectionsRef.current[targetSocketId];
      }

      const pc = new RTCPeerConnection(STUN_SERVERS);
      peerConnectionsRef.current[targetSocketId] = pc;

      // Add local audio tracks to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Send ICE candidates to target peer
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("ice-candidate", {
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Handle incoming remote stream tracks
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (remoteStream) {
          // Attach to dynamic HTML5 <audio> element
          if (!remoteAudioRefs.current[targetSocketId]) {
            const audioElem = document.createElement("audio");
            audioElem.autoplay = true;
            audioElem.srcObject = remoteStream;
            remoteAudioRefs.current[targetSocketId] = audioElem;
          } else {
            remoteAudioRefs.current[targetSocketId].srcObject = remoteStream;
          }

          // Attach audio analyzer for remote speaker
          setupAudioAnalyzer(remoteStream, targetSocketId);
        }
      };

      return pc;
    },
    [socket, setupAudioAnalyzer]
  );

  // WebRTC Signaling & Socket Event Handlers
  useEffect(() => {
    if (!isGuestSubmitted || !currentUser || !socket) return;

    let isSubscribed = true;

    const initAudioRoom = async () => {
      try {
        // 1. Capture local audio stream
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isSubscribed) return;
        localStreamRef.current = localStream;

        // Add local user to participants state
        const localParticipant = {
          socketId: socket.id,
          userId: currentUser._id || socket.id,
          name: currentUser.fullName || currentUser.name || "You",
          avatar: currentUser.profilePic || "/avatar.png",
          isMuted: false,
          isSpeaking: false,
          isSelf: true,
        };

        setParticipants([localParticipant]);

        // Attach audio analyzer for local user stream
        setupAudioAnalyzer(localStream, socket.id);

        // 2. Join audio room via WebSocket
        socket.emit("join-room", {
          roomId,
          user: currentUser,
        });

        // Handle error if room is locked
        socket.on("room-locked-error", ({ message }) => {
          toast.error(message || "Room is locked by host");
          leaveRoom();
        });

        // 3. Receive list of existing peers in room
        socket.on("room-users", async ({ title, hostId, isLocked: roomIsLocked, users }) => {
          if (title) setRoomTitle(title);
          if (hostId) setRoomHostId(hostId);
          setIsLocked(!!roomIsLocked);

          const mappedPeers = (users || []).map((u) => ({
            ...u,
            isSpeaking: false,
            isSelf: false,
          }));

          setParticipants([localParticipant, ...mappedPeers]);

          // Create WebRTC Offer for each existing peer
          for (const peer of mappedPeers) {
            const pc = createPeerConnection(peer.socketId);
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit("offer", {
                targetSocketId: peer.socketId,
                offer,
              });
            } catch (err) {
              console.error("Error creating offer:", err);
            }
          }
        });

        // 4. Handle new peer connected
        socket.on("user-connected", (newPeer) => {
          toast.success(`${newPeer.name} joined the room`);
          setParticipants((prev) => [
            ...prev.filter((p) => p.socketId !== newPeer.socketId),
            { ...newPeer, isSpeaking: false, isSelf: false },
          ]);
        });

        // 5. Handle SDP Offer from another peer
        socket.on("offer", async ({ callerSocketId, offer }) => {
          const pc = createPeerConnection(callerSocketId);
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("answer", {
              targetSocketId: callerSocketId,
              answer,
            });
          } catch (err) {
            console.error("Error handling offer:", err);
          }
        });

        // 6. Handle SDP Answer from another peer
        socket.on("answer", async ({ callerSocketId, answer }) => {
          const pc = peerConnectionsRef.current[callerSocketId];
          if (pc) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (err) {
              console.error("Error setting remote description:", err);
            }
          }
        });

        // 7. Handle ICE Candidate
        socket.on("ice-candidate", async ({ callerSocketId, candidate }) => {
          const pc = peerConnectionsRef.current[callerSocketId];
          if (pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error("Error adding ICE candidate:", err);
            }
          }
        });

        // 8. Handle peer mute toggle
        socket.on("user-mute-toggled", ({ socketId, isMuted }) => {
          setParticipants((prev) =>
            prev.map((p) => (p.socketId === socketId ? { ...p, isMuted } : p))
          );
        });

        // Host Control Handlers
        socket.on("host-muted-all-peers", () => {
          if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            const isHostUser = roomHostId === currentUser?._id || roomHostId === socket.id;

            if (!isHostUser && audioTrack) {
              audioTrack.enabled = false;
              setIsMuted(true);
              toast("The host muted all participants", { icon: "🔇" });

              setParticipants((prev) =>
                prev.map((p) => (p.isSelf ? { ...p, isMuted: true } : p))
              );
            }
          }
        });

        socket.on("room-lock-toggled", ({ isLocked: newLockState }) => {
          setIsLocked(newLockState);
          toast(newLockState ? "Room locked by host" : "Room unlocked by host", { icon: newLockState ? "🔒" : "🔓" });
        });

        socket.on("room-title-updated", ({ title: newTitle }) => {
          setRoomTitle(newTitle);
          toast.success(`Room renamed to "${newTitle}"`);
        });

        socket.on("room-ended", ({ message }) => {
          toast.error(message || "The host ended this audio room session");
          leaveRoom();
        });

        // 9. Handle peer disconnected
        socket.on("user-disconnected", ({ socketId }) => {
          if (peerConnectionsRef.current[socketId]) {
            peerConnectionsRef.current[socketId].close();
            delete peerConnectionsRef.current[socketId];
          }
          if (remoteAudioRefs.current[socketId]) {
            remoteAudioRefs.current[socketId].srcObject = null;
            delete remoteAudioRefs.current[socketId];
          }
          delete analysersRef.current[socketId];

          setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
        });
      } catch (err) {
        console.error("Audio room initialization error:", err);
        toast.error("Failed to access microphone for audio room");
      }
    };

    initAudioRoom();

    return () => {
      isSubscribed = false;
      if (socket) {
        socket.off("room-locked-error");
        socket.off("room-users");
        socket.off("user-connected");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
        socket.off("user-mute-toggled");
        socket.off("host-muted-all-peers");
        socket.off("room-lock-toggled");
        socket.off("room-title-updated");
        socket.off("room-ended");
        socket.off("user-disconnected");
      }
    };
  }, [isGuestSubmitted, currentUser, socket, roomId, createPeerConnection, setupAudioAnalyzer, leaveRoom, roomHostId]);

  // Toggle local microphone mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMuteState = !audioTrack.enabled;
        setIsMuted(newMuteState);

        setParticipants((prev) =>
          prev.map((p) => (p.isSelf ? { ...p, isMuted: newMuteState } : p))
        );

        if (socket) {
          socket.emit("toggle-mute", { roomId, isMuted: newMuteState });
        }
      }
    }
  };

  // Check if current user is the Host / Creator
  const isHost = socket && (roomHostId === currentUser?._id || roomHostId === socket.id);

  // Host Action Triggers
  const handleHostMuteAll = () => {
    if (socket && isHost) {
      socket.emit("host-mute-all", { roomId });
    }
  };

  const handleHostToggleLock = (newLockState) => {
    if (socket && isHost) {
      socket.emit("host-toggle-lock", { roomId, isLocked: newLockState });
    }
  };

  const handleHostRenameRoom = (newTitle) => {
    if (socket && isHost) {
      socket.emit("host-rename-room", { roomId, newTitle });
    }
  };

  const handleHostEndRoom = () => {
    if (socket && isHost) {
      socket.emit("host-end-room", { roomId });
    }
  };

  // Copy room link
  const copyInviteLink = () => {
    const inviteUrl = window.location.href;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success("Room link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Unauthenticated Guest Prompt Modal
  if (!isGuestSubmitted) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center p-4">
        <div className="bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-2xl w-full max-w-md p-6 shadow-[6px_6px_0px_0px_var(--line)] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center mx-auto text-black">
            <Volume2 size={32} />
          </div>

          <div>
            <h2 className="text-xl font-black text-[var(--primary-text)]">
              Join Live Audio Room
            </h2>
            <p className="text-xs font-bold text-[var(--secondary-text)] mt-1">
              Enter your name to jump straight into room #{roomId}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!guestName.trim()) return;
              setCurrentUser({ name: guestName.trim() });
              setIsGuestSubmitted(true);
            }}
            className="space-y-4 pt-2"
          >
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your Display Name (e.g. Alex)"
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-bold text-center focus:outline-none focus:border-[var(--accent)] text-sm"
              autoFocus
            />

            <button
              type="submit"
              disabled={!guestName.trim()}
              className="w-full py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold text-sm hover:bg-[var(--accent-hover)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-40"
            >
              Connect to Audio Channel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--primary-text)] flex flex-col justify-between transition-colors relative overflow-hidden">
      {/* Dynamic Background Aura Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-[var(--accent)] rounded-full filter blur-[140px] opacity-15" />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-[var(--accent)] rounded-full filter blur-[140px] opacity-10" />
      </div>

      {/* Top Header Controls Bar */}
      <header className="relative z-10 p-4 border-b-2 border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center text-black font-black">
            <Volume2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[var(--primary-text)] truncate max-w-[200px] sm:max-w-xs">
                {roomTitle}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                LIVE
              </span>
              {isLocked && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-500/15 border border-red-500 text-red-500 flex items-center gap-1">
                  <Lock size={10} /> Locked
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--secondary-text)] font-extrabold flex items-center gap-2">
              <span>Room ID: {roomId}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {participants.length} Participant{participants.length === 1 ? "" : "s"}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyInviteLink}
            className="px-3 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] hover:bg-[var(--accent)]/10 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedLink ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            <span className="hidden sm:inline">{copiedLink ? "Link Copied" : "Copy Invite Link"}</span>
          </button>
        </div>
      </header>

      {/* Main Clubhouse / Discord Style User Grid */}
      <main className="relative z-10 flex-1 p-6 overflow-y-auto no-scrollbar max-w-6xl w-full mx-auto flex items-center justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full py-4">
          {participants.map((participant) => {
            const isParticipantHost =
              roomHostId && (participant.userId === roomHostId || participant.socketId === roomHostId);

            return (
              <div
                key={participant.socketId}
                className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] transition-all duration-300 ${
                  participant.isSpeaking
                    ? "ring-4 ring-[var(--accent)] shadow-[0_0_25px_rgba(255,107,0,0.7)] scale-105 bg-[var(--accent)]/10"
                    : "hover:border-[var(--accent)]/50"
                }`}
              >
                {/* Host Crown Badge */}
                {isParticipantHost && (
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500 text-amber-500 text-[10px] font-black flex items-center gap-1 shadow-sm"
                    title="Room Host"
                  >
                    <Crown size={12} className="fill-amber-500 text-amber-500" />
                    <span>Host</span>
                  </div>
                )}

                {/* Avatar Container with Glowing Aura */}
                <div className="relative mb-3 mt-1">
                  <img
                    src={participant.avatar || "/avatar.png"}
                    alt={participant.name}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 object-cover transition-all ${
                      participant.isSpeaking
                        ? "border-[var(--accent)] animate-pulse"
                        : "border-[var(--surface)] shadow-md"
                    }`}
                  />

                  {/* Speaker Pulsing Ring Indicator */}
                  {participant.isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--accent)] border-2 border-white flex items-center justify-center animate-bounce">
                      <Sparkles size={12} className="text-black" />
                    </span>
                  )}

                  {/* Mute Badge Overlay */}
                  {participant.isMuted && (
                    <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-red-500 border-2 border-[var(--surface)] text-white flex items-center justify-center shadow-md">
                      <MicOff size={14} />
                    </span>
                  )}
                </div>

                {/* User Display Name */}
                <div className="flex items-center gap-1 max-w-[130px] justify-center">
                  <span className="font-extrabold text-sm text-[var(--primary-text)] truncate">
                    {participant.name}
                  </span>
                  {participant.isSelf && (
                    <span className="text-[11px] font-bold text-[var(--secondary-text)] flex-shrink-0">
                      (You)
                    </span>
                  )}
                </div>

                {/* Status Subtitle */}
                <span className="text-[11px] font-bold text-[var(--secondary-text)] mt-0.5">
                  {participant.isMuted
                    ? "Muted"
                    : participant.isSpeaking
                    ? "Speaking..."
                    : "Listening"}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Control Bar */}
      <footer className="relative z-20 p-4 border-t-2 border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          {/* Mute / Unmute Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`w-12 h-12 rounded-2xl border-2 border-[var(--line)] flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isMuted
                ? "bg-red-500 text-white hover:bg-red-600 border-red-600"
                : "bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]"
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Host Controls Settings Button (Host Only) */}
          {isHost && (
            <button
              type="button"
              onClick={() => setIsHostModalOpen(true)}
              className="w-12 h-12 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] hover:bg-[var(--accent)]/20 transition-all cursor-pointer flex items-center justify-center shadow-md relative"
              title="Room Host Settings"
            >
              <Settings size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-white flex items-center justify-center">
                <Crown size={9} className="text-black fill-black" />
              </span>
            </button>
          )}

          {/* Share Link Button */}
          <button
            type="button"
            onClick={copyInviteLink}
            className="w-12 h-12 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] hover:bg-[var(--accent)]/20 transition-all cursor-pointer flex items-center justify-center shadow-md"
            title="Share Room Link"
          >
            <Share2 size={22} />
          </button>

          {/* Leave Room Button */}
          <button
            type="button"
            onClick={leaveRoom}
            className="px-5 h-12 rounded-2xl border-2 border-red-500 bg-red-500/10 text-red-500 font-extrabold hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-md"
            title="Leave Audio Room"
          >
            <LogOut size={20} />
            <span>Leave Room</span>
          </button>
        </div>
      </footer>

      {/* Host Settings Modal */}
      {isHost && (
        <HostSettingsModal
          isOpen={isHostModalOpen}
          onClose={() => setIsHostModalOpen(false)}
          currentTitle={roomTitle}
          isLocked={isLocked}
          onRenameRoom={handleHostRenameRoom}
          onToggleLock={handleHostToggleLock}
          onMuteAllPeers={handleHostMuteAll}
          onEndRoom={handleHostEndRoom}
        />
      )}
    </div>
  );
};

export default AudioRoomPage;
