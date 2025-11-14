import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlusSquare,
  FileUp,
  Library,
  User,
  LogOut,
  Trash2,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "../context/themetoggle";
// API Base URL - update this to match your backend
const API_BASE_URL = "http://localhost:8000";

// Reusable NavLink component for styling with navigation
const NavLink = ({
  path,
  icon: Icon,
  children,
  isPrimary = false,
  isActive = false,
  onClick,
}) => {
  const navigate = useNavigate();

  const baseStyle =
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer";
  const primaryStyle =
    "bg-[var(--color-accent-primary)] text-white font-semibold hover:bg-[var(--color-accent-hover)]";
  const activeStyle =
    "bg-[var(--color-surface-secondary)] text-[var(--color-accent-primary)] font-semibold";
  const secondaryStyle =
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]";

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    } else {
      navigate(path);
      window.location.reload(); // ✅ force full reload after navigation
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${baseStyle} ${
        isPrimary ? primaryStyle : isActive ? activeStyle : secondaryStyle
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </div>
  );
};

// Reusable ChatLink component with delete functionality
const ChatLink = ({ chatId, title, isActive, onDelete }) => {
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = (e) => {
    // Don't navigate if clicking the delete button
    if (e.target.closest(".delete-btn")) return;
    navigate(`/chat/${chatId}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;

    if (window.confirm("Are you sure you want to delete this chat?")) {
      setIsDeleting(true);
      try {
        await onDelete(chatId);
      } catch (error) {
        console.error("Failed to delete chat:", error);
        alert("Failed to delete chat. Please try again.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 cursor-pointer ${
        isActive
          ? "bg-[var(--color-surface-secondary)] text-[var(--color-accent-primary)] font-medium"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      <span className="truncate pr-2">{title}</span>
      {showDelete && (
        <button
          className="delete-btn flex-shrink-0 p-1.5 rounded-md hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch chats from API
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chats/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();

      // Sort by updated_at in descending order (newest first)
      const sortedChats = data.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );

      setChats(sortedChats);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete chat handler
  const handleDeleteChat = async (chatId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      // Remove chat from local state
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      // If we're currently viewing this chat, redirect to dashboard
      if (location.pathname === `/chat/${chatId}`) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
      throw err;
    }
  };

  // Logout handler
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  // Helper function to check if a path is active
  const isPathActive = (path) => {
    return location.pathname === path;
  };

  // Helper function to check if a chat is active
  const isChatActive = (chatId) => {
    return location.pathname === `/chat/${chatId}`;
  };

  // Fallback for logo
  const logoUrl = "https://placehold.co/64x64/6366f1/ffffff?text=FC&font=sans";

  return (
    <div className="h-screen w-72 flex flex-col bg-[var(--color-surface-primary)] border-r border-[var(--color-border-primary)]">
      {/* Custom CSS for a dark, minimal scrollbar */}
      <style>
        {`
          /* For Webkit browsers (Chrome, Safari, Edge) */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--color-surface-primary);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a4a4a;
            border-radius: 10px;
            border: 2px solid var(--color-surface-primary);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          
          /* For Firefox */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #4a4a4a var(--color-surface-primary);
          }
        `}
      </style>

      {/* 1. Top Section (Logo & Nav) - Fixed */}
      <div className="flex-shrink-0">
        {/* Logo and App Name */}
        <div className="flex items-center gap-2 sm:gap-3 p-6">
          <img
            src={logo}
            alt="FastCite Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = logoUrl;
            }}
          />
          <span className="text-xl font-bold text-[var(--color-text-primary)]">
            FastCite
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="px-4 pb-4">
          <div className="space-y-2">
            <NavLink path="/new-chat" icon={PlusSquare} isPrimary={true}>
              New Chat
            </NavLink>
            <NavLink
              path="/dashboard"
              icon={LayoutDashboard}
              isActive={isPathActive("/dashboard")}
            >
              Dashboard
            </NavLink>
            <NavLink
              path="/upload"
              icon={FileUp}
              isActive={isPathActive("/upload")}
            >
              Upload Document
            </NavLink>
            <NavLink
              path="/manage"
              icon={Library}
              isActive={isPathActive("/manage")}
            >
              Manage Uploads
            </NavLink>
          </div>
        </nav>
      </div>

      {/* 2. Middle Section (Chat History) - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        {/* Header for chat list */}
        <div className="h-10 flex items-center sticky top-0 bg-[var(--color-surface-primary)] z-10">
          <span className="text-xs font-medium uppercase text-[var(--color-text-tertiary)] tracking-wider">
            Previous Chats
          </span>
        </div>

        {/* Chat List */}
        <div className="space-y-1 pb-4">
          {isLoading ? (
            <div className="text-center py-4 text-[var(--color-text-tertiary)] text-sm">
              Loading chats...
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500 text-sm">
              Failed to load chats
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-4 text-[var(--color-text-tertiary)] text-sm">
              No chats yet. Start a new chat!
            </div>
          ) : (
            chats.map((chat) => (
              <ChatLink
                key={chat.id}
                chatId={chat.id}
                title={chat.title || "Untitled Chat"}
                isActive={isChatActive(chat.id)}
                onDelete={handleDeleteChat}
              />
            ))
          )}
        </div>
      </div>

      {/* 3. Bottom Section (User Profile) - Fixed */}
      <div className="flex-shrink-0 p-4 border-t border-[var(--color-border-primary)]">
        <div className="space-y-2">
          <NavLink
            path="/setting"
            icon={User}
            isActive={isPathActive("/setting")}
          >
            Settings
          </NavLink>
          <NavLink path="/login" icon={LogOut} onClick={handleLogout}>
            Log Out
          </NavLink>
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-[var(--color-border-primary)]">
        <ThemeToggle />
      </div>
    </div>
  );
}
