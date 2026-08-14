import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFileTransferStore } from "../hooks/useFileTransfer";
import Sidebar from "../components/Sidebar";
import ChatDashboard from "../components/ChatDashboard";
import ChatContainer from "../components/ChatContainer";
import { FileTransferModal } from "../components/FileTransferModal";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const socket = useAuthStore((s) => s.socket);
  const initializeSocketListeners = useFileTransferStore((s) => s.initializeSocketListeners);

  useEffect(() => {
    if (socket) {
      initializeSocketListeners();
    }
  }, [socket, initializeSocketListeners]);

  return (
    <div className="h-screen bg-[var(--surface)] relative overflow-hidden transition-colors">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-[var(--accent)] rounded-full filter blur-3xl opacity-15 animate-float" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[var(--accent)] rounded-full filter blur-3xl opacity-10 animate-float-slow" />
        <div className="absolute top-[60%] left-[50%] w-64 h-64 bg-[var(--accent)] rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[5%] right-[30%] w-48 h-48 bg-[var(--accent)] rounded-full filter blur-3xl opacity-8 animate-float-slow" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-[5%] left-[30%] w-56 h-56 bg-[var(--accent)] rounded-full filter blur-3xl opacity-8 animate-float" style={{ animationDelay: "1s" }} />
      </div>
      <div className="relative z-10 flex items-center justify-center pt-20 px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[500px] h-[350px] bg-[var(--accent)] rounded-full filter blur-[120px] opacity-15 pointer-events-none" />
        <div className="bg-[var(--surface-muted)] rounded-2xl border-2 border-[var(--line)] w-full max-w-6xl h-[calc(100vh-8rem)] overflow-hidden shadow-[4px_4px_0px_0px_var(--line)] transition-colors relative">
          <div className="flex h-full rounded-2xl overflow-hidden">
            <Sidebar />
            {!selectedUser ? <ChatDashboard /> : <ChatContainer />}
          </div>
        </div>
      </div>
      <FileTransferModal />
    </div>
  );
};
export default HomePage;
