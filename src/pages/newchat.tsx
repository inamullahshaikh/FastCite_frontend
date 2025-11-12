import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, Send, Loader2, X, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ReactMarkdown from 'react-markdown';

// Typing Animation Component
const TypingMessage = ({ content, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    if (!content) return;
    
    let currentIndex = 0;
    const typingSpeed = 10; // milliseconds per character
    
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, typingSpeed);
    
    return () => clearInterval(interval);
  }, [content, onComplete]);
  
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2 text-[var(--color-text-primary)]" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2 text-[var(--color-text-primary)]" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-3 mb-1 text-[var(--color-text-primary)]" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 text-[var(--color-text-primary)] leading-relaxed" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1 text-[var(--color-text-primary)]" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1 text-[var(--color-text-primary)]" {...props} />,
          li: ({node, ...props}) => <li className="ml-4 text-[var(--color-text-primary)]" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-[var(--color-text-primary)]" {...props} />,
          em: ({node, ...props}) => <em className="italic text-[var(--color-text-primary)]" {...props} />,
          code: ({node, inline, ...props}) => 
            inline ? (
              <code className="bg-[var(--color-surface-hover)] px-1 py-0.5 rounded text-sm font-mono text-[var(--color-accent-primary)]" {...props} />
            ) : (
              <code className="block bg-[var(--color-surface-hover)] p-3 rounded-lg text-sm font-mono overflow-x-auto mb-2" {...props} />
            ),
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-[var(--color-accent-primary)] pl-4 italic my-2 text-[var(--color-text-secondary)]" {...props} />
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      {isTyping && (
        <span className="inline-block w-2 h-4 bg-[var(--color-accent-primary)] animate-pulse ml-1"></span>
      )}
    </div>
  );
};

// Helper to get initials from book title
const getBookInitials = (title) => {
  if (!title) return '?';
  const words = title.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Book Selector Dropdown
const BookSelector = ({ selectedBook, onSelectBook, books, isLoadingBooks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const dropdownRef = useRef(null);

  // Debounced search with 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter books based on search
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (book.author_name && book.author_name.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBook = (book) => {
    onSelectBook(book);
    setIsOpen(false);
    setSearchQuery('');
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
            <Loader2 size={20} className="animate-spin text-[var(--color-text-secondary)]" />
            <span className="flex-1 text-left text-[var(--color-text-secondary)]">Loading books...</span>
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
                {selectedBook.author_name || 'Unknown Author'}
              </div>
            </div>
          </>
        ) : (
          <>
            <BookOpen size={20} className="text-[var(--color-text-secondary)]" />
            <span className="flex-1 text-left text-[var(--color-text-secondary)]">Select a book</span>
          </>
        )}
        <ChevronDown size={18} className={`text-[var(--color-text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[400px] bg-[var(--color-surface-primary)] rounded-lg border border-[var(--color-border-primary)] shadow-lg z-50 animate-fade-in">
          {/* Search */}
          <div className="p-3 border-b border-[var(--color-border-primary)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
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

          {/* Books List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {filteredBooks.length > 0 ? (
              <div className="p-2">
                {filteredBooks.map(book => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-left ${
                      selectedBook?.id === book.id ? 'bg-[var(--color-surface-hover)]' : ''
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
                        {book.author_name || 'Unknown Author'} {book.pages && `• ${book.pages} pages`}
                      </div>
                      {book.status === 'processing' && (
                        <div className="text-xs text-[var(--color-warning)] mt-1">Processing...</div>
                      )}
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

// Main Component
const NewChatPage = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [chatTitle, setChatTitle] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch user's books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('No access token found');
        setIsLoadingBooks(false);
        return;
      }

      const response = await fetch('http://localhost:8000/books/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }

      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  // Generate chat title from the first prompt
  const generateChatTitle = (prompt) => {
    const maxLength = 50;
    let title = prompt.trim();
    
    // Remove question marks and extra punctuation at the end
    title = title.replace(/[?!.]+$/, '');
    
    // Truncate if too long
    if (title.length > maxLength) {
      title = title.substring(0, maxLength).trim() + '...';
    }
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    return title;
  };

  // Create chat session
  const createChatSession = async (firstQuestion, title) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const chatSession = {
        title: title,
      };

      const response = await fetch('http://localhost:8000/chats/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chatSession)
      });

      if (!response.ok) {
        throw new Error(`Failed to create chat: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Chat session created:', data);
      
      // If the API doesn't return the ID directly, fetch the user's chats to get the latest one
      if (!data.id && !data._id && !data.chat_id) {
        console.log('No ID in response, fetching latest chat...');
        
        // Fetch user's chats to get the most recent one
        const chatsResponse = await fetch('http://localhost:8000/chats/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!chatsResponse.ok) {
          throw new Error('Failed to fetch chats after creation');
        }
        
        const chats = await chatsResponse.json();
        
        // Get the most recent chat (assuming it's sorted by creation date or is the last one)
        if (chats && chats.length > 0) {
          const latestChat = chats[chats.length - 1];
          console.log('Found latest chat:', latestChat);
          return latestChat;
        }
        
        throw new Error('Could not find created chat session');
      }
      
      // Return the data if it has an id field
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendQuery = async () => {
    if (!query.trim() || !selectedBook) return;

    const userMessage = { role: 'user', content: query };
    const currentQuery = query;
    setMessages([...messages, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // If this is the first message, create a chat session
      let sessionId = chatId;
      if (!chatId && messages.length === 0) {
        const title = generateChatTitle(currentQuery);
        setChatTitle(title);
        
        const chatSession = await createChatSession(currentQuery, title);
        sessionId = chatSession.id;
        setChatId(sessionId);
        
        console.log('Created chat session with ID:', sessionId);
      }

      console.log('Using session ID:', sessionId);
      console.log(JSON.stringify({
          prompt: currentQuery,
          book_id: selectedBook.id,
          top_k: 3,
          chat_session_id: sessionId
        }));

      // Call the RAG API
      const response = await fetch('http://localhost:8000/rag/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: currentQuery,
          book_id: selectedBook.id,
          top_k: 3,
          chat_session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to query: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add assistant's response to messages
      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        reasoning: data.reasoning,
        contexts_count: data.contexts_count,
        downloaded_files: data.downloaded_files,
        isTyping: true
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setTypingMessageIndex(messages.length + 1); // +1 because we already added user message
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending query:', error);
      setIsLoading(false);
      
      // Show error message to user
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  const resetChat = () => {
    setSelectedBook(null);
    setMessages([]);
    setQuery('');
    setChatId(null);
    setChatTitle(null);
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      {/* Sidebar */}
      <Sidebar onNewChat={resetChat} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Book Selector */}
        <div className="h-16 border-b border-[var(--color-border-primary)] flex items-center justify-between px-6 bg-[var(--color-surface-primary)]">
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {chatTitle || 'New Chat'}
          </h1>
          <BookSelector 
            selectedBook={selectedBook} 
            onSelectBook={setSelectedBook}
            books={books}
            isLoadingBooks={isLoadingBooks}
          />
        </div>

        {/* Content Area */}
        {!selectedBook ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen size={64} className="mx-auto mb-4 text-[var(--color-text-tertiary)]" />
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                Select a book to start chatting
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Choose a book from the dropdown above to begin your conversation
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {getBookInitials(selectedBook.title)}
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                      Start a conversation about {selectedBook.title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)]">
                      Ask questions, explore themes, or discuss characters
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`animate-fade-in ${
                        msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          msg.role === 'user' ? 'message-user' : 'message-assistant'
                        } ${msg.isError ? 'border-red-500 bg-red-50' : ''}`}
                      >
                        {msg.role === 'user' ? (
                          <p className="text-[var(--color-text-primary)] whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        ) : msg.isTyping && idx === typingMessageIndex ? (
                          <TypingMessage 
                            content={msg.content}
                            onComplete={() => {
                              setTypingMessageIndex(null);
                              // Mark message as no longer typing
                              setMessages(prev => prev.map((m, i) => 
                                i === idx ? {...m, isTyping: false} : m
                              ));
                            }}
                          />
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2 text-[var(--color-text-primary)]" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2 text-[var(--color-text-primary)]" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-3 mb-1 text-[var(--color-text-primary)]" {...props} />,
                                p: ({node, ...props}) => <p className="mb-2 text-[var(--color-text-primary)] leading-relaxed" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1 text-[var(--color-text-primary)]" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1 text-[var(--color-text-primary)]" {...props} />,
                                li: ({node, ...props}) => <li className="ml-4 text-[var(--color-text-primary)]" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-semibold text-[var(--color-text-primary)]" {...props} />,
                                em: ({node, ...props}) => <em className="italic text-[var(--color-text-primary)]" {...props} />,
                                code: ({node, inline, ...props}) => 
                                  inline ? (
                                    <code className="bg-[var(--color-surface-hover)] px-1 py-0.5 rounded text-sm font-mono text-[var(--color-accent-primary)]" {...props} />
                                  ) : (
                                    <code className="block bg-[var(--color-surface-hover)] p-3 rounded-lg text-sm font-mono overflow-x-auto mb-2" {...props} />
                                  ),
                                blockquote: ({node, ...props}) => (
                                  <blockquote className="border-l-4 border-[var(--color-accent-primary)] pl-4 italic my-2 text-[var(--color-text-secondary)]" {...props} />
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        {msg.contexts_count > 0 && !msg.isTyping && (
                          <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                            Referenced {msg.contexts_count} context{msg.contexts_count > 1 ? 's' : ''} from the book
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="message-assistant">
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-[var(--color-accent-primary)]" />
                        <span className="text-[var(--color-text-secondary)]">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-[var(--color-border-primary)] p-4 bg-[var(--color-surface-primary)]">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3 items-end">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question about the book..."
                    className="input-primary flex-1 min-h-[56px] max-h-[200px] resize-none"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '56px'
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
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
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewChatPage;