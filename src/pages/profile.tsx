import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
  Loader2,
  CheckCircle,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Palette,
  Bell,
  Globe,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

// Add keyframe animation styles
const styles = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }
`;

// Types
interface UserProfile {
  id: string;
  username: string;
  name: string;
  dob: string | null;
  email: string;
  role: "user" | "admin";
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type ActiveSection = "profile" | "security" | "preferences";

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    username: "",
    name: "",
    dob: "",
  });

  // Password change states
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preferences states
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    fetchProfile();
    loadPreferences();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        "http://localhost:8000/users/getmyprofile/me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data: UserProfile = await response.json();
      setProfile(data);

      setEditForm({
        username: data.username,
        name: data.name,
        dob: data.dob || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = () => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "dark";
    const savedNotifications = localStorage.getItem("notifications");
    const savedLanguage = localStorage.getItem("language") || "en";

    setTheme(savedTheme);
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    setLanguage(savedLanguage);
  };

  const handleEditClick = () => {
    if (profile) {
      setEditForm({
        username: profile.username,
        name: profile.name,
        dob: profile.dob || "",
      });
    }
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
    if (profile) {
      setEditForm({
        username: profile.username,
        name: profile.name,
        dob: profile.dob || "",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const updates: Record<string, string> = {};

      if (editForm.username !== profile.username) {
        updates.username = editForm.username;
      }
      if (editForm.name !== profile.name) {
        updates.name = editForm.name;
      }
      if (editForm.dob !== (profile.dob || "")) {
        updates.dob = editForm.dob;
      }

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await fetch(
        `http://localhost:8000/users/${profile.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail ||
            `Failed to update profile: ${response.statusText}`
        );
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      accessToken = data.access_token;
      setProfile(data.user);

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("All password fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        "http://localhost:8000/users/changepassword",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            old_password: passwordForm.oldPassword,
            new_password: passwordForm.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Failed to change password: ${response.statusText}`
        );
      }

      setSuccessMessage("Password changed successfully!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setError((error as Error).message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    setSuccessMessage("Theme updated successfully!");
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    setSuccessMessage("Language updated successfully!");
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string): string => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[var(--color-bg-primary)]">
        <div className="flex-1 flex items-center justify-center">
          <Loader2
            size={48}
            className="animate-spin text-[var(--color-accent-primary)]"
          />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex h-screen bg-[var(--color-bg-primary)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
            <button onClick={fetchProfile} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      <Sidebar/>
      <style>{styles}</style>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[var(--color-border-primary)] bg-[var(--color-surface-primary)]">
          <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Settings
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-8">
          {/* Toast Notifications */}
          {successMessage && (
            <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
              <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px]">
                <div className="w-8 h-8 rounded-full bg-green-500 bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={18} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{successMessage}</p>
                </div>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
              <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[320px]">
                <div className="w-8 h-8 rounded-full bg-red-500 bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {profile && (
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar Nav */}
              <div className="col-span-3">
                <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg p-2">
                  <button
                    onClick={() => setActiveSection("profile")}
                    className={`w-full text-left px-4 py-2.5 rounded font-medium text-sm flex items-center gap-3 ${
                      activeSection === "profile"
                        ? "bg-[var(--color-accent-primary)] text-white"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveSection("security")}
                    className={`w-full text-left px-4 py-2.5 rounded font-medium text-sm mt-1 flex items-center gap-3 ${
                      activeSection === "security"
                        ? "bg-[var(--color-accent-primary)] text-white"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <Shield size={16} />
                    Security
                  </button>
                  <button
                    onClick={() => setActiveSection("preferences")}
                    className={`w-full text-left px-4 py-2.5 rounded font-medium text-sm mt-1 flex items-center gap-3 ${
                      activeSection === "preferences"
                        ? "bg-[var(--color-accent-primary)] text-white"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <Palette size={16} />
                    Preferences
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="col-span-9 space-y-6">
                {/* PROFILE SECTION */}
                {activeSection === "profile" && (
                  <>
                    {/* Profile Header */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center text-white text-2xl font-bold">
                            {getInitials(profile.name)}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                              {profile.name}
                            </h2>
                            <p className="text-[var(--color-text-secondary)] text-sm">
                              @{profile.username}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-1 bg-[var(--color-accent-primary)] bg-opacity-10 text-[var(--color-accent-primary)] text-xs font-semibold rounded uppercase">
                                {profile.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isEditing ? (
                          <button
                            onClick={handleEditClick}
                            className="btn-secondary flex items-center gap-2"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] rounded-lg text-sm font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveChanges}
                              disabled={isSaving}
                              className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Save size={16} />
                              )}
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Information */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg">
                      <div className="p-6 border-b border-[var(--color-border-primary)]">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          Profile Information
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          Update your personal details
                        </p>
                      </div>

                      <div className="p-6 space-y-5">
                        <div className="grid grid-cols-3 gap-4 items-start">
                          <label className="text-sm font-medium text-[var(--color-text-primary)] pt-2">
                            Username
                          </label>
                          <div className="col-span-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.username}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    username: e.target.value,
                                  })
                                }
                                className="input-primary w-full"
                              />
                            ) : (
                              <p className="text-[var(--color-text-primary)] py-2">
                                {profile.username}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 items-start">
                          <label className="text-sm font-medium text-[var(--color-text-primary)] pt-2">
                            Full Name
                          </label>
                          <div className="col-span-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, name: e.target.value })
                                }
                                className="input-primary w-full"
                              />
                            ) : (
                              <p className="text-[var(--color-text-primary)] py-2">
                                {profile.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 items-start">
                          <label className="text-sm font-medium text-[var(--color-text-primary)] pt-2">
                            Date of Birth
                          </label>
                          <div className="col-span-2">
                            {isEditing ? (
                              <input
                                type="date"
                                value={editForm.dob}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, dob: e.target.value })
                                }
                                className="input-primary w-full"
                              />
                            ) : (
                              <p className="text-[var(--color-text-primary)] py-2">
                                {formatDate(profile.dob)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 items-start">
                          <label className="text-sm font-medium text-[var(--color-text-primary)] pt-2">
                            Email
                          </label>
                          <div className="col-span-2">
                            <p className="text-[var(--color-text-primary)] py-2">
                              {profile.email}
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1 mt-1">
                              <Lock size={12} />
                              Email cannot be changed
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 items-start">
                          <label className="text-sm font-medium text-[var(--color-text-primary)] pt-2">
                            Role
                          </label>
                          <div className="col-span-2">
                            <p className="text-[var(--color-text-primary)] py-2 capitalize">
                              {profile.role}
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1 mt-1">
                              <Lock size={12} />
                              Role cannot be changed
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg">
                      <div className="p-6 border-b border-[var(--color-border-primary)]">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          Account Details
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          View your account information
                        </p>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-4">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            Account ID
                          </span>
                          <p className="col-span-2 text-sm text-[var(--color-text-secondary)] font-mono break-all">
                            {profile.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* SECURITY SECTION */}
                {activeSection === "security" && (
                  <>
                    {/* Change Password */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg">
                      <div className="p-6 border-b border-[var(--color-border-primary)]">
                        <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                          <Lock size={18} />
                          Change Password
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          Update your password to keep your account secure
                        </p>
                      </div>

                      <div className="p-6 space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.old ? "text" : "password"}
                              value={passwordForm.oldPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  oldPassword: e.target.value,
                                })
                              }
                              className="input-primary w-full pr-10"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords({ ...showPasswords, old: !showPasswords.old })
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                            >
                              {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  newPassword: e.target.value,
                                })
                              }
                              className="input-primary w-full pr-10"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                            >
                              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                            Must be at least 8 characters long
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="input-primary w-full pr-10"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                            >
                              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleChangePassword}
                          disabled={isChangingPassword}
                          className="btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                          {isChangingPassword ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Shield size={16} />
                          )}
                          {isChangingPassword ? "Changing..." : "Change Password"}
                        </button>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg">
                      <div className="p-6 border-b border-[var(--color-border-primary)]">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          Security Settings
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          Manage your account security preferences
                        </p>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between pb-4 border-b border-[var(--color-border-primary)]">
                          <div className="flex items-start gap-3">
                            <Smartphone size={20} className="text-[var(--color-text-secondary)] mt-1" />
                            <div>
                              <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                                Two-Factor Authentication
                              </h4>
                              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                          </div>
                          <button className="btn-secondary text-sm">
                            Enable
                          </button>
                        </div>

                        <div className="flex items-start justify-between pb-4 border-b border-[var(--color-border-primary)]">
                          <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-[var(--color-text-secondary)] mt-1" />
                            <div>
                              <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                                Active Sessions
                              </h4>
                              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                Manage devices where you're currently logged in
                              </p>
                            </div>
                          </div>
                          <button className="btn-secondary text-sm">
                            View
                          </button>
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <LogOut size={20} className="text-red-500 mt-1" />
                            <div>
                              <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                                Sign Out All Devices
                              </h4>
                              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                Sign out from all devices except this one
                              </p>
                            </div>
                          </div>
                          <button className="px-4 py-2 text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-lg text-sm font-medium border border-red-500">
                            Sign Out All
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Account Security */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg">
                      <div className="p-6 border-b border-[var(--color-border-primary)]">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          Account Security
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          Review your account security status
                        </p>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            Last Password Change
                          </span>
                          <p className="col-span-2 text-sm text-[var(--color-text-secondary)]">
                            Never changed
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            Last Login
                          </span>
                          <p className="col-span-2 text-sm text-[var(--color-text-secondary)]">
                            Just now
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* PREFERENCES SECTION */}
                {activeSection === "preferences" && (
                  <>
                    {/* Appearance */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg">
                      <div className="p-6 border-b border-[var(--color-border-primary)]">
                        <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                          <Palette size={18} />
                          Appearance
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          Customize how the interface looks
                        </p>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                            Theme
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => handleThemeChange("light")}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                theme === "light"
                                  ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] bg-opacity-5"
                                  : "border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)]"
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded bg-white border border-gray-300 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-gray-100 rounded"></div>
                                </div>
                                <span className="font-medium text-[var(--color-text-primary)]">
                                  Light
                                </span>
                              </div>
                              <p className="text-xs text-[var(--color-text-secondary)] text-left">
                                Clean and bright interface
                              </p>
                            </button>

                            <button
                              onClick={() => handleThemeChange("dark")}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                theme === "dark"
                                  ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] bg-opacity-5"
                                  : "border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)]"
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded bg-gray-900 border border-gray-700 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-gray-800 rounded"></div>
                                </div>
                                <span className="font-medium text-[var(--color-text-primary)]">
                                  Dark
                                </span>
                              </div>
                              <p className="text-xs text-[var(--color-text-secondary)] text-left">
                                Easy on the eyes
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg">
                      <div className="p-6 border-b border-[var(--color-border-primary)]">
                        <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                          <Bell size={18} />
                          Notifications
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          Manage how you receive notifications
                        </p>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-primary)]">
                          <div>
                            <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                              Email Notifications
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                              Receive notifications via email
                            </p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange("email")}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notifications.email
                                ? "bg-[var(--color-accent-primary)]"
                                : "bg-[var(--color-border-secondary)]"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                notifications.email ? "translate-x-6" : ""
                              }`}
                            ></span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-primary)]">
                          <div>
                            <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                              Push Notifications
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                              Receive push notifications on your device
                            </p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange("push")}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notifications.push
                                ? "bg-[var(--color-accent-primary)]"
                                : "bg-[var(--color-border-secondary)]"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                notifications.push ? "translate-x-6" : ""
                              }`}
                            ></span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                              Product Updates
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                              Receive updates about new features
                            </p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange("updates")}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notifications.updates
                                ? "bg-[var(--color-accent-primary)]"
                                : "bg-[var(--color-border-secondary)]"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                notifications.updates ? "translate-x-6" : ""
                              }`}
                            ></span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Language & Region */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg">
                      <div className="p-6 border-b border-[var(--color-border-primary)]">
                        <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                          <Globe size={18} />
                          Language & Region
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          Set your preferred language and region
                        </p>
                      </div>

                      <div className="p-6 space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Language
                          </label>
                          <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="input-primary w-full"
                          >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="zh">中文</option>
                            <option value="ja">日本語</option>
                            <option value="ur">اردو</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Timezone
                          </label>
                          <select className="input-primary w-full">
                            <option>(UTC+05:00) Islamabad, Karachi</option>
                            <option>(UTC+00:00) London</option>
                            <option>(UTC-05:00) New York</option>
                            <option>(UTC+01:00) Paris</option>
                            <option>(UTC+09:00) Tokyo</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Date Format
                          </label>
                          <select className="input-primary w-full">
                            <option>MM/DD/YYYY</option>
                            <option>DD/MM/YYYY</option>
                            <option>YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Data & Privacy */}
                    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg">
                      <div className="p-6 border-b border-[var(--color-border-primary)]">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          Data & Privacy
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                          Control your data and privacy settings
                        </p>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between pb-4 border-b border-[var(--color-border-primary)]">
                          <div>
                            <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                              Download Your Data
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                              Download a copy of your account data
                            </p>
                          </div>
                          <button className="btn-secondary text-sm">
                            Download
                          </button>
                        </div>

                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-red-500">
                              Delete Account
                            </h4>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                              Permanently delete your account and data
                            </p>
                          </div>
                          <button className="px-4 py-2 text-red-500 hover:bg-red-500 hover:bg-opacity-10 rounded-lg text-sm font-medium border border-red-500">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;