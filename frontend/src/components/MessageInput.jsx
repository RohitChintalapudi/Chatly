import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText(""); setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) { console.error("Failed to send message:", error); }
  };

  return (
    <div className="p-4 w-full border-t-2 border-[var(--line)] bg-[var(--surface)] transition-colors">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-[var(--line)]" />
            <button onClick={removeImage} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--primary-text)] flex items-center justify-center cursor-pointer" type="button">
              <X className="size-3 text-[var(--surface)]" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input type="text" className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] font-medium placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          <button type="button" className={`w-10 h-10 rounded-xl border-2 border-[var(--line)] flex items-center justify-center transition-all cursor-pointer ${imagePreview ? "bg-[var(--accent)] text-[var(--primary-text)]" : "bg-[var(--surface)] text-[var(--secondary-text)] hover:bg-[var(--accent)]/10"}`} onClick={() => fileInputRef.current?.click()}>
            <Image size={18} />
          </button>
        </div>
        <button type="submit" className="w-10 h-10 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-hover)] hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" disabled={!text.trim() && !imagePreview}>
          <Send size={18} className="text-[var(--primary-text)]" />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
