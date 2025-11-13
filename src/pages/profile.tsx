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
} from "lucide-react";
import Sidebar from "../components/Sidebar";

// Types
interface UserProfile {
  id: string;
  username: string;
  name: string;
  dob: string | null;
  email: string;
  role: "user" | "admin";
}

const ProfilePage: React.FC = () => {
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

  useEffect(() => {
    fetchProfile();
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
      const accessToken = localStorage.getItem("accessToken");

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

      await fetchProfile();
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
        <Sidebar onNewChat={() => {}} />
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
        <Sidebar onNewChat={() => {}} />
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
      <Sidebar onNewChat={() => {}} />

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
          {/* Alerts */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500" />
              <p className="text-green-500 text-sm">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg flex items-center gap-3">
              <X size={20} className="text-red-500" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {profile && (
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar Nav */}
              <div className="col-span-3">
                <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-lg p-2">
                  <button className="w-full text-left px-4 py-2.5 rounded bg-[var(--color-accent-primary)] text-white font-medium text-sm">
                    Profile
                  </button>
                  <button className="w-full text-left px-4 py-2.5 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] font-medium text-sm mt-1">
                    Security
                  </button>
                  <button className="w-full text-left px-4 py-2.5 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] font-medium text-sm mt-1">
                    Preferences
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="col-span-9 space-y-6">
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
                    {/* Username */}
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

                    {/* Full Name */}
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

                    {/* Date of Birth */}
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

                    {/* Email */}
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

                    {/* Role */}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
