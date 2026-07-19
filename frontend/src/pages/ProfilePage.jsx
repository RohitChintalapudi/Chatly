import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Lock, Eye, EyeOff } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, changePassword } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    if (newPassword.length < 6) return;

    setIsChanging(true);
    await changePassword({ oldPassword, newPassword });
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChanging(false);
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  return (
    <div className="h-screen bg-[var(--surface)] flex items-center justify-center px-4 transition-colors relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-[var(--accent)] rounded-full filter blur-3xl opacity-15 animate-float" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[var(--accent)] rounded-full filter blur-3xl opacity-10 animate-float-slow" />
        <div className="absolute top-[60%] left-[50%] w-64 h-64 bg-[var(--accent)] rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[5%] right-[30%] w-48 h-48 bg-[var(--accent)] rounded-full filter blur-3xl opacity-8 animate-float-slow" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-[5%] left-[30%] w-56 h-56 bg-[var(--accent)] rounded-full filter blur-3xl opacity-8 animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row gap-5">
        {/* Profile Card */}
        <div className="profile-glow flex-1">
          <div className="relative bg-[var(--surface-muted)] rounded-3xl border-2 border-[var(--line)] p-6 shadow-[6px_6px_0px_0px_var(--line)] space-y-5 transition-all duration-300 hover:shadow-[8px_8px_0px_0px_var(--line),0_0_20px_rgba(255,255,255,0.08)] hover:-translate-y-1 h-full">
            <div className="text-center">
              <h1 className="text-xl font-extrabold text-[var(--primary-text)]">Profile</h1>
              <p className="text-xs text-[var(--secondary-text)] font-medium mt-1">Your profile information</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img src={selectedImg || authUser.profilePic || "/avatar.png"} alt="Profile" className="size-24 rounded-full object-cover border-4 border-white shadow-md" />
                <label htmlFor="avatar-upload" className={`absolute bottom-0 right-0 w-8 h-8 bg-[var(--accent)] border-2 border-[var(--line)] rounded-full flex items-center justify-center cursor-pointer hover:shadow-[2px_2px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}>
                  <Camera className="w-4 h-4 text-[var(--primary-text)]" />
                  <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUpdatingProfile} />
                </label>
              </div>
              <p className="text-xs text-[var(--secondary-text)] font-semibold">
                {isUpdatingProfile ? "Uploading..." : "Click camera to update photo"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs text-[var(--secondary-text)] font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </div>
                <p className="px-3 py-2 bg-[var(--surface-muted)] rounded-xl border-2 border-[var(--line)] text-[var(--primary-text)] font-medium text-sm transition-colors">{authUser?.fullName}</p>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-[var(--secondary-text)] font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </div>
                <p className="px-3 py-2 bg-[var(--surface-muted)] rounded-xl border-2 border-[var(--line)] text-[var(--primary-text)] font-medium text-sm transition-colors">{authUser?.email}</p>
              </div>
            </div>

            <div className="bg-[var(--surface-muted)] rounded-xl border-2 border-[var(--line)] p-4 transition-colors">
              <h2 className="text-sm font-extrabold text-[var(--primary-text)] mb-3">Account Information</h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--line)]/20">
                  <span className="font-semibold text-[var(--primary-text)]">Member Since</span>
                  <span className="font-bold text-[var(--primary-text)]">{authUser.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[var(--primary-text)]">Account Status</span>
                  <span className="text-green-500 font-bold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Card */}
        <div className="flex-1">
          <div className="relative bg-[var(--surface-muted)] rounded-3xl border-2 border-[var(--line)] p-6 shadow-[6px_6px_0px_0px_var(--line)] space-y-5 transition-all duration-300 hover:shadow-[8px_8px_0px_0px_var(--line),0_0_20px_rgba(255,255,255,0.08)] hover:-translate-y-1 h-full">
            <div className="text-center">
              <h1 className="text-xl font-extrabold text-[var(--primary-text)]">Change Password</h1>
              <p className="text-xs text-[var(--secondary-text)] font-medium mt-1">Update your account password</p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs text-[var(--secondary-text)] font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Current Password
                </div>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="w-full px-3 py-2 pr-10 bg-[var(--surface)] rounded-xl border-2 border-[var(--line)] text-[var(--primary-text)] font-medium text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--secondary-text)]/50"
                  />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--secondary-text)] hover:text-[var(--primary-text)] transition-colors cursor-pointer">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-[var(--secondary-text)] font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> New Password
                </div>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="w-full px-3 py-2 pr-10 bg-[var(--surface)] rounded-xl border-2 border-[var(--line)] text-[var(--primary-text)] font-medium text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--secondary-text)]/50"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--secondary-text)] hover:text-[var(--primary-text)] transition-colors cursor-pointer">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-[var(--secondary-text)] font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Confirm New Password
                </div>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 pr-10 bg-[var(--surface)] rounded-xl border-2 text-[var(--primary-text)] font-medium text-sm focus:outline-none transition-colors placeholder:text-[var(--secondary-text)]/50 ${
                      passwordsMatch
                        ? "border-green-500 focus:border-green-500"
                        : passwordsMismatch
                          ? "border-red-500 focus:border-red-500"
                          : "border-[var(--line)] focus:border-[var(--accent)]"
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--secondary-text)] hover:text-[var(--primary-text)] transition-colors cursor-pointer">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordsMatch && <p className="text-xs text-green-500 font-semibold">Passwords match</p>}
                {passwordsMismatch && <p className="text-xs text-red-500 font-semibold">Passwords do not match</p>}
              </div>

              <button
                type="submit"
                disabled={isChanging || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-[var(--primary-text)] font-extrabold text-sm border-2 border-[var(--line)] hover:shadow-[3px_3px_0px_0px_var(--line)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 cursor-pointer"
              >
                {isChanging ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
