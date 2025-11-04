import React from 'react';
import { 
  LayoutDashboard, 
  PlusSquare, 
  FileUp, 
  Library, 
  User,
  LogOut
} from 'lucide-react';
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";

// Mock data for previous chats - replace this with your actual data
const mockChats = [
  { id: 1, title: 'History of Roman Empire' },
  { id: 2, title: 'Introduction to Quantum Physics' },
  { id: 3, title: 'Shakespearean Sonnets Analysis' },
  { id: 4, title: 'React Hooks vs. Class Components' },
  { id: 5, title: 'Sustainable Energy Sources' },
  { id: 6, title: 'French Revolution Key Events' },
  { id: 7, title: 'AI in Modern Medicine' },
  { id: 8, title: 'Deep Sea Exploration Tech' },
  { id: 9, title: 'The Future of Urban Planning' },
  { id: 10, title: 'Understanding Macroeconomics' },
  { id: 11, title: 'Cold War Politics Summary' },
  { id: 12, title: 'Impressionist Art Movement' },
  { id: 13, title: 'How do LLMs work?' },
  { id: 14, title: 'Business Plan for a Startup' },
  { id: 15, title: 'Benefits of Mindfulness' },
];

// Reusable NavLink component for styling with navigation
const NavLink = ({ path, icon: Icon, children, isPrimary = false, isActive = false, onClick }) => {
  const navigate = useNavigate();
  
  const baseStyle = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer";
  const primaryStyle = "bg-[var(--color-accent-primary)] text-white font-semibold hover:bg-[var(--color-accent-hover)]";
  const activeStyle = "bg-[var(--color-surface-secondary)] text-[var(--color-accent-primary)] font-semibold";
  const secondaryStyle = "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]";

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    } else {
      navigate(path);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${baseStyle} ${isPrimary ? primaryStyle : isActive ? activeStyle : secondaryStyle}`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </div>
  );
};

// Reusable ChatLink component for styling with navigation
const ChatLink = ({ chatId, title, isActive }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`block truncate px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 cursor-pointer ${
        isActive 
          ? 'bg-[var(--color-surface-secondary)] text-[var(--color-accent-primary)] font-medium' 
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {title}
    </div>
  );
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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
          <span className="text-xl font-bold text-[var(--color-text-primary)]">FastCite</span>
        </div>

        {/* Main Navigation */}
        <nav className="px-4 pb-4">
          <div className="space-y-2">
            <NavLink 
              path="/new-chat" 
              icon={PlusSquare} 
              isPrimary={true}
            >
              New Chat
            </NavLink>
            <NavLink 
              path="/dashboard" 
              icon={LayoutDashboard}
              isActive={isPathActive('/dashboard')}
            >
              Dashboard
            </NavLink>
            <NavLink 
              path="/upload" 
              icon={FileUp}
              isActive={isPathActive('/upload')}
            >
              Upload Document
            </NavLink>
            <NavLink 
              path="/manage" 
              icon={Library}
              isActive={isPathActive('/manage')}
            >
              Manage Uploads
            </NavLink>
          </div>
        </nav>
      </div>

      {/* 2. Middle Section (Chat History) - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        {/* Header for chat list */}
        <div className="h-10 flex items-center sticky top-0 bg-[var(--color-surface-primary)]">
          <span className="text-xs font-medium uppercase text-[var(--color-text-tertiary)] tracking-wider">
            Previous Chats
          </span>
        </div>
        
        {/* Chat List */}
        <div className="space-y-1 pb-4">
          {mockChats.map(chat => (
            <ChatLink 
              key={chat.id}
              chatId={chat.id}
              title={chat.title}
              isActive={isChatActive(chat.id)}
            />
          ))}
        </div>
      </div>

      {/* 3. Bottom Section (User Profile) - Fixed */}
      <div className="flex-shrink-0 p-4 border-t border-[var(--color-border-primary)]">
        <div className="space-y-2">
          <NavLink 
            path="/profile" 
            icon={User}
            isActive={isPathActive('/profile')}
          >
            My Profile
          </NavLink>
          <NavLink 
            path="/login" 
            icon={LogOut}
            onClick={handleLogout}
          >
            Log Out
          </NavLink>
        </div>
      </div>

    </div>
  );
}