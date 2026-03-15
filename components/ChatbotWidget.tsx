import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import http from '../services/http';

// Define message type
interface Message {
  role: 'user' | 'bot';
  content: string;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Halo Trivers! Saya asisten virtual AI Trivgoo. Ada yang bisa saya bantu untuk rencana perjalanan Anda hari ini?'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide the chatbot on auth and specific pages
  const hiddenRoutes = [
    '/login',
    '/register',
    '/register/agent',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputVal.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInputVal('');
    setIsLoading(true);

    try {
      // API call to the backend using axios instance
      const response = await http.post('/chat', { messages: newMessages });

      if (response.data && !response.data.error) {
        setMessages([...newMessages, { role: 'bot', content: response.data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'bot', content: 'Maaf, terjadi kesalahan pada asisten kami: ' + (response.data.message || 'Error API') }]);
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Maaf, saya tidak dapat terhubung ke server saat ini.';
      setMessages([...newMessages, { role: 'bot', content: 'Maaf, terjadi kesalahan pada asisten kami: ' + errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100 flex flex-col h-[520px] animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="bg-primary-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Trivgoo AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-xs text-primary-100 font-medium">Online | Powered by Gemini</p>
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto overscroll-contain bg-gray-50/50 flex flex-col gap-4 no-scrollbar">

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 items-end ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'bot' && (
                  <div className="bg-primary-100 p-2 rounded-full flex-shrink-0">
                    <Bot size={16} className="text-primary-700" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl shadow-sm text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Bot Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2 items-end opacity-70">
                <div className="bg-primary-100 p-2 rounded-full flex-shrink-0">
                  <Bot size={16} className="text-primary-700" />
                </div>
                <div className="bg-white px-4 py-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 p-1 pl-4 focus-within:border-primary-300 focus-within:bg-white transition-colors">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ketik pesan Anda..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center shadow-sm"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400">Powered by Gemini AI</span>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleChat}
        className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-soft transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-100 mt-4"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default ChatbotWidget;
