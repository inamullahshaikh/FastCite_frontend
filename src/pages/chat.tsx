import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Send,
  Loader2,
  X,
  ChevronDown,
  AlertCircle,
  FileText,
  ExternalLink,
  Maximize2,
  Minimize2,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import ReactMarkdown from "react-markdown";

// PDF Modal Viewer Component
const PDFModal = ({ file, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-[var(--color-surface-primary)] rounded-lg shadow-2xl flex flex-col transition-all ${
          isFullscreen ? "w-full h-full" : "w-[90%] h-[90%] max-w-6xl"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-primary)]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded bg-[var(--color-accent-primary)] bg-opacity-10 flex items-center justify-center shrink-0">
              <FileText
                size={20}
                className="text-[var(--color-accent-primary)]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--color-text-primary)] text-sm line-clamp-1">
                {file.path?.split("/").pop() || file.name || "Document"}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                PDF Document
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2
                  size={20}
                  className="text-[var(--color-text-secondary)]"
                />
              ) : (
                <Maximize2
                  size={20}
                  className="text-[var(--color-text-secondary)]"
                />
              )}
            </button>
            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink
                  size={20}
                  className="text-[var(--color-text-secondary)]"
                />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {file.url ? (
            <iframe
              src={file.url}
              className="w-full h-full border-0"
              title={file.name || "PDF Document"}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
              PDF preview not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to get initials from book title
const getBookInitials = (title) => {
  if (!title) return "?";
  const words = title.trim().split(" ");
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Book Selector Dropdown
const BookSelector = ({
  selectedBook,
  onSelectBook,
  books,
  isLoadingBooks,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (book.author_name &&
        book.author_name.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectBook = (book) => {
    onSelectBook(book);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoadingBooks}
        className="flex items-center gap-3 px-4 py-2 bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-hover)] rounded-lg border border-[var(--color-border-primary)] transition-colors min-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoadingBooks ? (
          <>
            <Loader2
              size={20}
              className="animate-spin text-[var(--color-text-secondary)]"
            />
            <span className="flex-1 text-left text-[var(--color-text-secondary)]">
              Loading books...
            </span>
          </>
        ) : selectedBook ? (
          <>
            <div className="w-8 h-8 rounded bg-[var(--color-accent-primary)] flex items-center justify-center text-white text-sm font-semibold">
              {getBookInitials(selectedBook.title)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium text-[var(--color-text-primary)] text-sm line-clamp-1">
                {selectedBook.title}
              </div>
              <div className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                {selectedBook.author_name || "Unknown Author"}
              </div>
            </div>
          </>
        ) : (
          <>
            <BookOpen
              size={20}
              className="text-[var(--color-text-secondary)]"
            />
            <span className="flex-1 text-left text-[var(--color-text-secondary)]">
              Select a book
            </span>
          </>
        )}
        <ChevronDown
          size={18}
          className={`text-[var(--color-text-secondary)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[400px] bg-[var(--color-surface-primary)] rounded-lg border border-[var(--color-border-primary)] shadow-lg z-50 animate-fade-in">
          <div className="p-3 border-b border-[var(--color-border-primary)]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                size={16}
              />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-primary w-full pl-9 py-2 text-sm"
                autoFocus
              />
            </div>
          </div>

          <div
            className="max-h-[400px] overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
            }}
          >
            {filteredBooks.length > 0 ? (
              <div className="p-2">
                {filteredBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-left ${
                      selectedBook?.id === book.id
                        ? "bg-[var(--color-surface-hover)]"
                        : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded bg-[var(--color-accent-primary)] flex items-center justify-center text-white font-semibold shrink-0">
                      {getBookInitials(book.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--color-text-primary)] text-sm line-clamp-1">
                        {book.title}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                        {book.author_name || "Unknown Author"}{" "}
                        {book.pages && `• ${book.pages} pages`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm">
                No books uploaded yet
              </div>
            ) : (
              <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm">
                No books found matching "{debouncedSearch}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Chat History Component
const ChatHistoryPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [chatTitle, setChatTitle] = useState("");
  const [viewingFile, setViewingFile] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchBooks();
    fetchChatHistory();
  }, [chatId]);

  const fetchBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("No access token found");
        setIsLoadingBooks(false);
        return;
      }

      const response = await fetch("http://localhost:8000/books/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }

      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const fetchChatHistory = async () => {
    setIsLoadingChat(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await fetch(`http://localhost:8000/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Chat not found");
        } else if (response.status === 403) {
          throw new Error("Access denied");
        }
        throw new Error(`Failed to fetch chat: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Chat data:", data);

      setChatTitle(data.title || "Chat History");

      // Convert chat messages to the format expected by the UI
      const formattedMessages = [];
      if (data.messages && Array.isArray(data.messages)) {
        data.messages.forEach((msg) => {
          // Add user question
          if (msg.question) {
            formattedMessages.push({
              role: "user",
              content: msg.question,
            });
          }

          // Add assistant answer
          if (msg.answer) {
            formattedMessages.push({
              role: "assistant",
              content: msg.answer,
              downloaded_files: msg.downloaded_files || [],
            });
          }
        });
      }

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setError(error.message);
    } finally {
      setIsLoadingChat(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendQuery = async () => {
    if (!query.trim() || !selectedBook) return;

    const userMessage = { role: "user", content: query };
    const currentQuery = query;
    setMessages([...messages, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await fetch("http://localhost:8000/rag/query", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentQuery,
          book_id: selectedBook.id,
          top_k: 3,
          chat_session_id: chatId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (errorData && errorData.error) {
          const errorMsg = errorData.error.message || errorData.error;
          if (errorMsg.includes("overloaded") || errorMsg.includes("503")) {
            throw new Error("SERVICE_OVERLOADED");
          }
        }

        throw new Error(`Failed to query: ${response.statusText}`);
      }

      const data = await response.json();
      const ERROR_MESSAGE =
        "Error: 503 UNAVAILABLE. {'error': {'code': 503, 'message': 'The model is overloaded. Please try again later.', 'status': 'UNAVAILABLE'}}";

      if (data.answer === ERROR_MESSAGE) {
        data.answer =
          "⚠️ **Service Temporarily Unavailable**\n\nThe AI model is currently experiencing high demand. Please wait a moment and try again.";
      }

      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        reasoning: data.reasoning,
        contexts_count: data.contexts_count,
        downloaded_files: data.downloaded_files || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending query:", error);
      setIsLoading(false);

      let errorContent =
        "⚠️ **Something went wrong**\n\nAn unexpected error occurred. Please try again.";

      if (error.message === "SERVICE_OVERLOADED") {
        errorContent =
          "⚠️ **Service Temporarily Unavailable**\n\nThe AI model is currently experiencing high demand. Please wait a moment and try again.";
      } else if (
        error.message.includes("503") ||
        error.message.includes("UNAVAILABLE")
      ) {
        errorContent =
          "⚠️ **Service Temporarily Unavailable**\n\nThe service is currently overloaded. Please try again in a few moments.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorContent =
          "⚠️ **Connection Error**\n\nUnable to connect to the server. Please check your internet connection and try again.";
      }

      const errorMessage = {
        role: "assistant",
        content: errorContent,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  const resetChat = () => {
    navigate("/new-chat");
  };

  if (error) {
    return (
      <div className="flex h-screen bg-[var(--color-bg-primary)]">
        <Sidebar onNewChat={resetChat} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              {error === "Chat not found"
                ? "Chat Not Found"
                : "Error Loading Chat"}
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
              {error === "Chat not found"
                ? "The chat you are looking for does not exist or has been deleted."
                : error === "Access denied"
                ? "You do not have permission to view this chat."
                : "An error occurred while loading the chat."}
            </p>
            <button
              onClick={() => navigate("/new-chat")}
              className="btn-primary px-6 py-2"
            >
              Start New Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      <Sidebar onNewChat={resetChat} />

      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-[var(--color-border-primary)] flex items-center justify-between px-6 bg-[var(--color-surface-primary)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/new-chat")}
              className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
              title="Back to chats"
            >
              <ArrowLeft
                size={20}
                className="text-[var(--color-text-secondary)]"
              />
            </button>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {isLoadingChat ? "Loading..." : chatTitle}
            </h1>
          </div>
          <BookSelector
            selectedBook={selectedBook}
            onSelectBook={setSelectedBook}
            books={books}
            isLoadingBooks={isLoadingBooks}
          />
        </div>

        {isLoadingChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2
                size={48}
                className="mx-auto mb-4 animate-spin text-[var(--color-accent-primary)]"
              />
              <p className="text-[var(--color-text-secondary)]">
                Loading chat history...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              className="flex-1 overflow-y-auto p-6"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
              }}
            >
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen
                      size={64}
                      className="mx-auto mb-4 text-[var(--color-text-tertiary)]"
                    />
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                      No messages in this chat
                    </h3>
                    <p className="text-[var(--color-text-secondary)]">
                      Select a book and start asking questions
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`animate-fade-in ${
                        msg.role === "user" ? "flex justify-end" : "w-full"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <div className="max-w-[70%] bg-[var(--color-accent-primary)] text-white rounded-2xl px-5 py-3 shadow-sm">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      ) : (
                        <div className="w-full">
                          {msg.isError ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                              <AlertCircle
                                className="text-red-500 shrink-0 mt-0.5"
                                size={20}
                              />
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown
                                  components={{
                                    h1: ({ node, ...props }) => (
                                      <h1
                                        className="text-2xl font-bold mt-4 mb-2 text-[var(--color-text-primary)]"
                                        {...props}
                                      />
                                    ),
                                    h2: ({ node, ...props }) => (
                                      <h2
                                        className="text-xl font-bold mt-3 mb-2 text-[var(--color-text-primary)]"
                                        {...props}
                                      />
                                    ),
                                    h3: ({ node, ...props }) => (
                                      <h3
                                        className="text-lg font-semibold mt-3 mb-1 text-[var(--color-text-primary)]"
                                        {...props}
                                      />
                                    ),
                                    p: ({ node, ...props }) => (
                                      <p
                                        className="mb-2 text-[var(--color-text-primary)] leading-relaxed"
                                        {...props}
                                      />
                                    ),
                                    ul: ({ node, ...props }) => (
                                      <ul
                                        className="list-disc list-inside mb-2 space-y-1 text-[var(--color-text-primary)]"
                                        {...props}
                                      />
                                    ),
                                    ol: ({ node, ...props }) => (
                                      <ol
                                        className="list-decimal list-inside mb-2 space-y-1 text-[var(--color-text-primary)]"
                                        {...props}
                                      />
                                    ),
                                    li: ({ node, ...props }) => (
                                      <li
                                        className="ml-4 text-[var(--color-text-primary)]"
                                        {...props}
                                      />
                                    ),
                                    strong: ({ node, ...props }) => (
                                      <strong
                                        className="font-semibold text-[var(--color-text-primary)]"
                                        {...props}
                                      />
                                    ),
                                    em: ({ node, ...props }) => (
                                      <em
                                        className="italic text-[var(--color-text-primary)]"
                                        {...props}
                                      />
                                    ),
                                    code: ({ node, inline, ...props }) =>
                                      inline ? (
                                        <code
                                          className="bg-[var(--color-surface-hover)] px-1 py-0.5 rounded text-sm font-mono text-[var(--color-accent-primary)]"
                                          {...props}
                                        />
                                      ) : (
                                        <code
                                          className="block bg-[var(--color-surface-hover)] p-3 rounded-lg text-sm font-mono overflow-x-auto mb-2"
                                          {...props}
                                        />
                                      ),
                                    blockquote: ({ node, ...props }) => (
                                      <blockquote
                                        className="border-l-4 border-[var(--color-accent-primary)] pl-4 italic my-2 text-[var(--color-text-secondary)]"
                                        {...props}
                                      />
                                    ),
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                              {msg.downloaded_files &&
                                msg.downloaded_files.length > 0 && (
                                  <div className="mt-4 p-4 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border-primary)]">
                                    <div className="flex items-center gap-2 mb-3">
                                      <FileText
                                        size={18}
                                        className="text-[var(--color-accent-primary)]"
                                      />
                                      <h4 className="font-semibold text-[var(--color-text-primary)] text-sm">
                                        Source Documents (
                                        {msg.downloaded_files.length})
                                      </h4>
                                    </div>
                                    <div className="space-y-2">
                                      {msg.downloaded_files.map(
                                        (file, fileIdx) => (
                                          <button
                                            key={fileIdx}
                                            onClick={() => setViewingFile(file)}
                                            className="w-full flex items-center gap-3 p-3 bg-[var(--color-surface-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg border border-[var(--color-border-primary)] transition-colors group"
                                          >
                                            <div className="w-10 h-10 rounded bg-[var(--color-accent-primary)] bg-opacity-10 flex items-center justify-center shrink-0">
                                              <FileText
                                                size={20}
                                                className="text-[var(--color-accent-primary)]"
                                              />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                              <div className="font-medium text-[var(--color-text-primary)] text-sm line-clamp-1">
                                                {file.name || "Document"}
                                              </div>
                                              <div className="text-xs text-[var(--color-text-secondary)]">
                                                Click to view PDF
                                              </div>
                                            </div>
                                            <ExternalLink
                                              size={16}
                                              className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-primary)] transition-colors shrink-0"
                                            />
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="w-full animate-fade-in">
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <Loader2
                        size={16}
                        className="animate-spin text-[var(--color-accent-primary)]"
                      />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-[var(--color-border-primary)] p-4 bg-[var(--color-surface-primary)]">
              <div className="max-w-4xl mx-auto">
                {!selectedBook ? (
                  <div className="text-center py-4 text-[var(--color-text-secondary)] text-sm">
                    Select a book to continue the conversation
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3 items-end">
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about the book..."
                        className="input-primary flex-1 min-h-[56px] max-h-[200px] resize-none"
                        rows={1}
                        style={{
                          height: "auto",
                          minHeight: "56px",
                        }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.min(e.target.scrollHeight, 200) + "px";
                        }}
                      />
                      <button
                        onClick={handleSendQuery}
                        disabled={!query.trim() || isLoading}
                        className="btn-primary h-[56px] px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send size={18} />
                        Send
                      </button>
                    </div>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                      Press Enter to send, Shift + Enter for new line
                    </p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {viewingFile && (
        <PDFModal file={viewingFile} onClose={() => setViewingFile(null)} />
      )}
    </div>
  );
};

export default ChatHistoryPage;
