import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; // Assuming Sidebar is in components
import { 
  Book, 
  BookCheck, 
  Loader2, 
  MessageSquare, 
  MessagesSquare,
  User,
  Mail,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';

/**
 * A reusable component for displaying individual analytics.
 * @param {object} props
 * @param {string} props.title - The title of the metric (e.g., "Total Books")
 * @param {string|number} props.value - The value of the metric (e.g., "12")
 * @param {React.ElementType} props.icon - The Lucide icon component
 * @param {string} [props.description] - Optional description text
 */
const AnalyticsCard = ({ title, value, icon: Icon, description }) => (
  <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</span>
      <div className="p-2 bg-[var(--color-accent-primary)]/10 rounded-lg">
        <Icon className="w-5 h-5 text-[var(--color-accent-primary)]" />
      </div>
    </div>
    <div className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{value}</div>
    {description && (
      <p className="text-xs text-[var(--color-text-tertiary)]">{description}</p>
    )}
  </div>
);

/**
 * A reusable component for displaying a piece of user info.
 * @param {object} props
 * @param {React.ElementType} props.icon - The Lucide icon component
 * @param {string} props.label - The label for the info (e.g., "Email")
 * @param {string} props.value - The value (e.g., "user@example.com")
 */
const UserInfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex-shrink-0 p-2.5 bg-[var(--color-surface-secondary)] rounded-full">
      <Icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
    </div>
    <div>
      <div className="text-xs text-[var(--color-text-tertiary)]">{label}</div>
      <div className="text-sm font-medium text-[var(--color-text-primary)]">{value}</div>
    </div>
  </div>
);


export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data on component mount
  useEffect(() => {
    const fetchData = () => {
      // --- SIMULATED API CALL ---
      // Replace this with your actual API fetching logic
      try {
        // 1. Fetch User Info (from your /auth/me or /users/me endpoint)
        const mockUser = {
          name: "Inam Ullah",
          email: "inam@example.com",
          role: "User",
          // dob: "2002-04-10" // (from your User model)
        };
        
        // 2. Fetch Analytics (from a new /analytics endpoint)
        // This data would be derived from your Book and ChatSession models
        const mockAnalytics = {
          totalBooks: 12,
          booksProcessing: 2,
          booksReady: 10,
          totalChats: 28,
          totalMessages: 452, // (Sum of all messages in all chats)
        };

        setUser(mockUser);
        setAnalytics(mockAnalytics);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Handle error state here
      } finally {
        setLoading(false);
      }
      // --- END SIMULATION ---
    };

    // Simulate network delay
    const timer = setTimeout(fetchData, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Header */}
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Dashboard
          </h1>

          {loading ? (
            // --- Loading State ---
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-12 h-12 text-[var(--color-accent-primary)] animate-spin" />
            </div>

          ) : (
            // --- Loaded Content ---
            <>
              {/* Welcome & User Info Card */}
              {user && (
                <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-primary)] rounded-2xl shadow-sm">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
                      Welcome back, {user.name}!
                    </h2>
                    <p className="text-base text-[var(--color-text-secondary)] mb-6">
                      Here's a summary of your activity on FastCite.
                    </p>
                    
                    {/* User Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      <UserInfoItem icon={User} label="Full Name" value={user.name} />
                      <UserInfoItem icon={Mail} label="Email Address" value={user.email} />
                      <UserInfoItem icon={ShieldCheck} label="Account Role" value={user.role} />
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Grid */}
              {analytics && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      Your Analytics
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <AnalyticsCard
                      title="Total Books Uploaded"
                      value={analytics.totalBooks}
                      icon={Book}
                      description="All documents you've uploaded."
                    />
                    <AnalyticsCard
                      title="Books Ready"
                      value={analytics.booksReady}
                      icon={BookCheck}
                      description="Documents that are fully processed."
                    />
                    <AnalyticsCard
                      title="Books Processing"
                      value={analytics.booksProcessing}
                      icon={Loader2} // Using Loader2 for "processing"
                      description="Documents currently being processed."
                    />
                    <AnalyticsCard
                      title="Total Chat Sessions"
                      value={analytics.totalChats}
                      icon={MessageSquare}
                      description="Total conversations started."
                    />
                    {/* You could add more, like total messages */}
                    {/* <AnalyticsCard
                      title="Total Messages"
                      value={analytics.totalMessages}
                      icon={MessagesSquare}
                      description="Total messages sent and received."
                    /> */}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}