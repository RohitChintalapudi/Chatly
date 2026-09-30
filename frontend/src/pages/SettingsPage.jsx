import { useState } from "react";
import { Send, Check } from "lucide-react";
import { useThemeStore, ACCENT_COLORS, CHAT_FONT_WEIGHTS } from "../store/useThemeStore";
import { ColorSelector, ColorSelectorList, ColorSelectorItem } from "../components/ColorSelector";
import toast from "react-hot-toast";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { accentKey, setAccentColor, chatFontWeight, setChatFontWeight } = useThemeStore();
  const [tempAccent, setTempAccent] = useState(accentKey);
  const [tempFontWeight, setTempFontWeight] = useState(chatFontWeight);
  const hasChanges = tempAccent !== accentKey || tempFontWeight !== chatFontWeight;

  const handleSave = () => {
    setAccentColor(tempAccent);
    setChatFontWeight(tempFontWeight);
    toast.success("Settings saved!", {
      icon: <Check className="w-4 h-4" />,
      style: {
        borderRadius: "12px",
        border: "2px solid var(--line)",
        background: "var(--surface)",
        color: "var(--primary-text)",
        fontWeight: 700,
        fontSize: "13px",
      },
    });
  };

  const previewAccent = ACCENT_COLORS.find((c) => c.name.toLowerCase() === tempAccent) || ACCENT_COLORS[0];

  return (
    <div className="min-h-screen bg-[var(--surface)] container mx-auto px-4 pt-32 xl:pt-24 pb-8 max-w-5xl overflow-y-auto no-scrollbar transition-colors">
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-extrabold text-[var(--primary-text)]">Settings</h2>
          <p className="text-sm text-[var(--secondary-text)] font-medium">Customize your chat experience</p>
        </div>

        {/* Accent Color Picker */}
        <div>
          <h3 className="text-base font-extrabold text-[var(--primary-text)] mb-1">Accent Color</h3>
          <p className="text-xs text-[var(--secondary-text)] font-medium mb-4">Choose a color theme, then save to apply</p>
          <ColorSelector
            value={tempAccent}
            onValueChange={(val) => setTempAccent(val)}
            name="chat-accent-picker"
          >
            <ColorSelectorList>
              {ACCENT_COLORS.map((color) => {
                const colorValue = color.name.toLowerCase();
                const isSaved = accentKey === colorValue;
                return (
                  <ColorSelectorItem
                    key={color.name}
                    value={colorValue}
                    color={color.accent}
                    label={color.name}
                    isSaved={isSaved}
                  />
                );
              })}
            </ColorSelectorList>
          </ColorSelector>

          {/* Save Button */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-6 py-2.5 rounded-xl border-2 border-[var(--line)] font-extrabold text-sm transition-all cursor-pointer ${
                hasChanges
                  ? "bg-[var(--accent)] text-[var(--primary-text)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5"
                  : "bg-[var(--surface-muted)] text-[var(--secondary-text)] opacity-50 cursor-not-allowed"
              }`}
            >
              Save Changes
            </button>
            {hasChanges && (
              <button
                onClick={() => { setTempAccent(accentKey); setTempFontWeight(chatFontWeight); }}
                className="px-4 py-2.5 rounded-xl border-2 border-[var(--line)]/30 text-[var(--secondary-text)] font-bold text-sm hover:border-[var(--line)] transition-all cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Chat Font Weight */}
        <div>
          <h3 className="text-base font-extrabold text-[var(--primary-text)] mb-1">Chat Text Weight</h3>
          <p className="text-xs text-[var(--secondary-text)] font-medium mb-4">Choose how bold your chat messages appear</p>
          <div className="flex flex-wrap gap-2">
            {CHAT_FONT_WEIGHTS.map((fw) => {
              const isActive = tempFontWeight === fw.value;
              return (
                <button
                  key={fw.value}
                  onClick={() => setTempFontWeight(fw.value)}
                  className={`px-5 py-2.5 rounded-xl border-2 text-sm transition-all cursor-pointer ${
                    isActive
                      ? "border-[var(--line)] bg-[var(--accent)] text-[var(--primary-text)] shadow-[3px_3px_0px_0px_var(--line)] -translate-y-0.5"
                      : "border-[var(--line)]/20 bg-[var(--surface-muted)] text-[var(--primary-text)] hover:border-[var(--line)]/60 hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5"
                  }`}
                  style={{ fontWeight: fw.value }}
                >
                  {fw.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Preview */}
        <div>
          <h3 className="text-base font-extrabold text-[var(--primary-text)] mb-1">Chat Preview</h3>
          <p className="text-xs text-[var(--secondary-text)] font-medium mb-4">See how your selected accent looks in a real chat</p>
          <div
            className="rounded-2xl border-2 border-[var(--line)] overflow-hidden bg-[var(--surface)] shadow-[4px_4px_0px_0px_var(--line)] transition-colors"
            style={{ "--accent": previewAccent.accent, "--accent-hover": previewAccent.hover }}
          >
            <div className="p-4 bg-[var(--surface-muted)]">
              <div className="max-w-lg mx-auto">
                <div className="bg-[var(--surface)] rounded-2xl border-2 border-[var(--line)] overflow-hidden transition-colors">
                  <div className="px-4 py-3 border-b-2 border-[var(--line)] bg-[var(--surface)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)] border-2 border-[var(--line)] flex items-center justify-center text-[var(--primary-text)] font-extrabold text-sm">J</div>
                      <div>
                        <h3 className="font-extrabold text-[var(--primary-text)] text-sm">John Doe</h3>
                        <p className="text-xs text-[var(--secondary-text)] font-semibold">Online</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-[var(--surface)]">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 border-2 border-[var(--line)] text-sm ${message.isSent ? "bg-[var(--accent)] text-black rounded-br-md" : "bg-[var(--surface-muted)] text-[var(--primary-text)] rounded-bl-md"}`} style={{ fontWeight: tempFontWeight }}>
                          <p>{message.content}</p>
                          <p className="text-[10px] mt-1.5 text-[var(--secondary-text)] font-semibold">12:00 PM</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t-2 border-[var(--line)] bg-[var(--surface)]">
                    <div className="flex gap-2">
                      <input type="text" className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--primary-text)] text-sm font-bold placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--accent)]" placeholder="Type a message..." value="This is a preview" readOnly />
                      <button className="w-10 h-10 rounded-xl border-2 border-[var(--line)] bg-[var(--accent)] flex items-center justify-center hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all">
                        <Send size={18} className="text-[var(--primary-text)]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
