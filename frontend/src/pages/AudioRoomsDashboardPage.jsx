import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Radio, Plus, LogIn, Volume2, Users, Sparkles, Lock, ArrowRight, Shield } from "lucide-react";
import toast from "react-hot-toast";

const AudioRoomsDashboardPage = () => {
  const [createTitle, setCreateTitle] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [activeRooms, setActiveRooms] = useState([]);
  const navigate = useNavigate();
  const { socket, authUser } = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-active-rooms");

    const handleActiveRooms = (rooms) => {
      setActiveRooms(Array.isArray(rooms) ? rooms : []);
    };

    socket.on("active-rooms-list", handleActiveRooms);

    return () => {
      socket.off("active-rooms-list", handleActiveRooms);
    };
  }, [socket]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const title = createTitle.trim() || "Live Audio Lounge";
    const roomId = `audio-room-${Math.floor(1000 + Math.random() * 9000)}`;

    if (socket) {
      socket.emit("create-room", {
        title,
        roomId,
        user: authUser || { name: "Host" },
      });
    }

    toast.success("Room created!");
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinInput.trim()) {
      toast.error("Please enter a valid Room ID or Link");
      return;
    }

    let targetRoomId = joinInput.trim();
    // Extract room ID if user pasted full URL
    if (targetRoomId.includes("/room/")) {
      targetRoomId = targetRoomId.split("/room/")[1].split("?")[0].split("#")[0];
    }

    if (!targetRoomId) {
      toast.error("Invalid Room URL or ID format");
      return;
    }

    navigate(`/room/${targetRoomId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] pt-28 lg:pt-20 px-4 pb-12 transition-colors overflow-y-auto no-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero Title */}
        <div className="text-center space-y-2 max-w-2xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-blue-500 text-black text-xs font-black tracking-wide uppercase shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Radio size={14} className="animate-pulse text-blue-600" />
            <span className="text-black font-black">Drop-In WebRTC Audio Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--primary-text)] tracking-tight">
            Live Audio Rooms
          </h1>
          <p className="text-sm font-semibold text-[var(--secondary-text)]">
            Create your own live audio channel or join friends instantly with zero external APIs.
          </p>
        </div>

        {/* 2 Main Action Cards: Create Room & Join Room */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Create Audio Room */}
          <div className="bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-2xl p-6 shadow-[5px_5px_0px_0px_var(--line)] flex flex-col justify-between space-y-4 hover:border-[var(--accent)] transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center text-black font-black">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--primary-text)]">
                    Create New Room
                  </h3>
                  <p className="text-xs font-semibold text-[var(--secondary-text)]">
                    Start a channel and invite your audience
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-extrabold text-[var(--primary-text)] mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Developer Sync & Hangout"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-bold text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent-hover)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Sparkles size={18} />
                  <span>Create & Launch Room</span>
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Join Audio Room */}
          <div className="bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-2xl p-6 shadow-[5px_5px_0px_0px_var(--line)] flex flex-col justify-between space-y-4 hover:border-[var(--accent)] transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border-2 border-[var(--line)] flex items-center justify-center text-[var(--primary-text)] font-black">
                  <LogIn size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--primary-text)]">
                    Join Existing Room
                  </h3>
                  <p className="text-xs font-semibold text-[var(--secondary-text)]">
                    Enter a Room ID or paste a shareable link
                  </p>
                </div>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-extrabold text-[var(--primary-text)] mb-1">
                    Room ID or Link
                  </label>
                  <input
                    type="text"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value)}
                    placeholder="e.g. audio-room-8923 or http://..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-bold text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!joinInput.trim()}
                  className="w-full py-3 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent)]/15 hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-40"
                >
                  <ArrowRight size={18} />
                  <span>Join Room Channel</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Live Active Audio Channels Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="text-[var(--accent)] animate-pulse" size={20} />
              <h2 className="text-xl font-black text-[var(--primary-text)]">
                Active Audio Channels
              </h2>
            </div>
            <span className="px-3 py-1 bg-[var(--accent)]/15 border-2 border-[var(--accent)] text-[var(--primary-text)] text-xs font-black rounded-full">
              {activeRooms.length} Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRooms.map((room) => (
              <div
                key={room.roomId}
                className="p-5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface-muted)] hover:border-[var(--accent)] transition-all flex flex-col justify-between gap-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-base text-[var(--primary-text)] truncate">
                      {room.title}
                    </h3>
                    {room.isLocked && (
                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500 text-red-500 text-[10px] font-black rounded-md flex items-center gap-1">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-[var(--secondary-text)] flex items-center gap-2">
                    <span>ID: <code className="font-mono bg-[var(--surface)] px-1.5 py-0.5 rounded border">{room.roomId}</code></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t-2 border-[var(--line)]/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary-text)]">
                    <Users size={14} className="text-[var(--accent)]" />
                    <span>{room.participantCount || 1} Participant{room.participantCount === 1 ? "" : "s"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/room/${room.roomId}`)}
                    className="px-4 py-2 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black font-extrabold text-xs hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] transition-all cursor-pointer"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeRooms.length === 0 && (
            <div className="text-center py-12 px-4 bg-[var(--surface-muted)] border-2 border-[var(--line)] rounded-2xl space-y-3">
              <div className="w-14 h-14 rounded-full bg-[var(--accent)]/20 border-2 border-[var(--line)] flex items-center justify-center mx-auto text-[var(--accent)]">
                <Radio size={28} />
              </div>
              <div className="text-sm font-bold text-[var(--secondary-text)]">
                No active audio channels currently live. Create the first room above!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioRoomsDashboardPage;
