import React from 'react';
import { 
  LayoutDashboard, 
  PlusSquare, 
  FileUp, 
  Library, 
  Sparkles,
  User,
  LogOut
} from 'lucide-react';
import logo from "../assets/logo.png"; // Assuming logo is in src/assets/

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

// Reusable NavLink component for styling
const NavLink = ({ href, icon: Icon, children, isPrimary = false }) => {
  const baseStyle = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150";
  const primaryStyle = "bg-[var(--color-accent-primary)] text-white font-semibold hover:bg-[var(--color-accent-hover)]";
  const secondaryStyle = "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]";

  return (
    <a
      href={href}
      className={`${baseStyle} ${isPrimary ? primaryStyle : secondaryStyle}`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </a>
  );
};

// Reusable ChatLink component for styling
const ChatLink = ({ href, title }) => (
  <a
    href={href}
    className="block truncate px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
  >
    {title}
  </a>
);

export default function Sidebar() {
  // Fallback for logo
  const logoUrl = "https://placehold.co/64x64/6366f1/ffffff?text=FC&font=sans";

  return (
    <div className="h-screen w-72 flex flex-col bg-[var(--color-surface-primary)] border-r border-[var(--color-border-primary)]">
      
      {/* Custom CSS for a dark, minimal scrollbar.
        This <style> tag is placed here to keep everything in one file.
        In a real app, this would ideally go in your global index.css file.
      */}
      <style>
        {`
          /* For Webkit browsers (Chrome, Safari, Edge) */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px; /* Width of the scrollbar */
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--color-surface-primary); /* Track background, same as sidebar */
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a4a4a; /* A dark, minimal color for the thumb */
            border-radius: 10px;
            /* Add a border to create a "padding" effect so thumb doesn't touch the edge */
            border: 2px solid var(--color-surface-primary);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555; /* Slightly lighter on hover */
          }
          
          /* For Firefox */
          .custom-scrollbar {
            scrollbar-width: thin; /* "thin" or "auto" */
            scrollbar-color: #4a4a4a var(--color-surface-primary); /* thumb and track color */
          }
        `}
      </style>

      {/* 1. Top Section (Logo & Nav) - Fixed */}
      <div className="flex-shrink-0">
        {/* Logo and App Name */}
        <div className="flex items-center gap-2 sm:gap-3 p-6">
          <img 
            src={logo} // Original path
            alt="FastCite Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain"
            onError={(e) => {
              // Fallback to a placeholder if the logo fails to load
              e.target.onerror = null; // prevent infinite loop
              e.target.src = logoUrl;
            }}
          />
          <span className="text-xl font-bold text-[var(--color-text-primary)]">FastCite</span>
        </div>

        {/* Main Navigation */}
        <nav className="px-4 pb-4">
          <div className="space-y-2">
            <NavLink href="/new-chat" icon={PlusSquare} isPrimary>
              New Chat
            </NavLink>
            <NavLink href="/dashboard" icon={LayoutDashboard}>
              Dashboard
            </NavLink>
            <NavLink href="/upload" icon={FileUp}>
              Upload Document
            </NavLink>
            <NavLink href="/manage" icon={Library}>
              Manage Uploads
            </NavLink>
          </div>
        </nav>
      </div>

      {/* 2. Middle Section (Chat History) - Scrollable */}
      {/* We add the 'custom-scrollbar' class here */}
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
              href={`/chat/${chat.id}`} 
              title={chat.title} 
            />
          ))}
        </div>
      </div>

      {/* 3. Bottom Section (User Profile) - Fixed */}
      <div className="flex-shrink-0 p-4 border-t border-[var(--color-border-primary)]">
        <div className="space-y-2">
          <NavLink href="/profile" icon={User}>
            My Profile
          </NavLink>
          <NavLink href="/logout" icon={LogOut}>
            Log Out
          </NavLink>
        </div>
      </div>

    </div>
  );
}
