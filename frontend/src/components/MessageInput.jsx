import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Mic, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDuration } from "../lib/utils";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const { sendMessage } = useChatStore();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("Microphone access denied or not supported");
    }
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const sendVoiceNote = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    mediaRecorder.onstop = async () => {
      const mimeType = mediaRecorder.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      if (audioBlob.size < 100) {
        toast.error("Voice note is too short");
        cancelRecording();
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        try {
          await sendMessage({ audio: base64Audio });
          toast.success("Voice note sent!");
        } catch (error) {
          console.error("Failed to send voice note:", error);
        }
      };
      reader.readAsDataURL(audioBlob);

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
      setRecordingTime(0);
      audioChunksRef.current = [];
    };

    if (mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full border-t-2 border-[var(--line)] bg-[var(--surface)] transition-colors">
      {imagePreview && !isRecording && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-xl border-2 border-[var(--line)]"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--primary-text)] flex items-center justify-center cursor-pointer"
              type="button"
            >
              <X className="size-3 text-[var(--surface)]" />
            </button>
          </div>
        </div>
      )}

      {isRecording ? (
        /* Active Recording Panel */
        <div className="flex items-center gap-3 bg-red-500/10 border-2 border-red-500/30 rounded-xl p-2.5 transition-all">
          <div className="flex items-center gap-2 px-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="font-extrabold text-red-500 text-sm tracking-wide">
              {formatDuration(recordingTime)}
            </span>
          </div>

          <div className="flex-1 text-xs font-semibold text-[var(--secondary-text)] truncate hidden sm:block">
            Recording voice note...
          </div>

          <div className="flex items-center gap-2">
            {/* Trash / Cancel button */}
            <button
              type="button"
              onClick={cancelRecording}
              className="w-10 h-10 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Cancel recording"
            >
              <Trash2 size={18} />
            </button>

            {/* Send voice note button */}
            <button
              type="button"
              onClick={sendVoiceNote}
              className="w-10 h-10 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] transition-all cursor-pointer flex items-center justify-center font-bold"
              title="Send voice note"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* Standard Chat Input Form */
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button
              type="button"
              className={`w-10 h-10 rounded-xl border-2 border-[var(--line)] flex items-center justify-center transition-all cursor-pointer ${
                imagePreview
                  ? "bg-[var(--accent)] text-[var(--primary-text)]"
                  : "bg-[var(--surface)] text-[var(--secondary-text)] hover:bg-[var(--accent)]/10"
              }`}
              onClick={() => fileInputRef.current?.click()}
              title="Attach Image"
            >
              <Image size={18} />
            </button>

            {/* Mic Record Button */}
            <button
              type="button"
              onClick={startRecording}
              className="w-10 h-10 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--secondary-text)] hover:text-red-500 hover:border-red-400 hover:bg-red-500/10 transition-all cursor-pointer flex items-center justify-center"
              title="Record Voice Note"
            >
              <Mic size={18} />
            </button>
          </div>

          <button
            type="submit"
            className="w-10 h-10 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={18} className="text-[var(--primary-text)]" />
          </button>
        </form>
      )}
    </div>
  );
};

export default MessageInput;
