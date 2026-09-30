import { LogOut, AlertTriangle } from "lucide-react";
import {
  CenterMorphModal,
  CenterMorphModalContent,
} from "./CenterMorphModal";

export function LogoutModal({ isOpen, onClose, onConfirm }) {
  return (
    <CenterMorphModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CenterMorphModalContent
        ariaLabel="Log Out Confirmation"
        showCloseButton={true}
        className="max-w-sm"
      >
        <div className="flex flex-col items-center text-center">
          {/* Danger Icon Badge */}
          <div className="relative mb-4">
            <div className="size-14 rounded-2xl bg-red-500/15 border-2 border-red-500 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(239,68,68,0.3)]">
              <LogOut className="size-7 text-red-500 stroke-[2.5]" />
            </div>
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 border-2 border-[var(--surface)] flex items-center justify-center">
              <AlertTriangle className="size-2 text-white" />
            </span>
          </div>

          <h3 className="text-xl font-black text-[var(--primary-text)] tracking-tight">
            Log out of Chatly?
          </h3>
          <p className="text-xs text-[var(--secondary-text)] font-semibold mt-2 leading-relaxed">
            Are you sure you want to end your session? You will need your credentials to sign back in.
          </p>

          <div className="flex w-full gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[var(--line)] bg-[var(--surface-muted)] text-[var(--primary-text)] font-extrabold text-sm hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-red-500 bg-red-500 text-white font-extrabold text-sm hover:shadow-[3px_3px_0px_0px_rgba(239,68,68,0.5)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </CenterMorphModalContent>
    </CenterMorphModal>
  );
}

export default LogoutModal;
