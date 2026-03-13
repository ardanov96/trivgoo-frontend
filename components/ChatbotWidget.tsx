import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide the chatbot on auth and specific pages
  const hiddenRoutes = [
    '/login',
    '/register',
    '/register/agent',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100 flex flex-col h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="bg-primary-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Trivgoo Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-xs text-primary-100 font-medium">Online | Siap membantu</p>
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
            {/* Bot Message */}
            <div className="flex gap-2 items-end">
              <div className="bg-primary-100 p-2 rounded-full flex-shrink-0">
                <Bot size={16} className="text-primary-700" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-sm shadow-sm text-sm text-gray-700 border border-gray-100 max-w-[80%] leading-relaxed">
                Halo! Selamat datang di Trivgoo. Ada yang bisa saya bantu untuk rencana perjalanan Anda hari ini?
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-2 items-end justify-end">
              <div className="bg-primary-600 text-white p-3 rounded-2xl rounded-br-sm shadow-sm text-sm max-w-[80%] leading-relaxed">
                Saya sedang mencari paket wisata ke Bali untuk 3 hari 2 malam.
              </div>
            </div>

            {/* Bot Message */}
            <div className="flex gap-2 items-end">
              <div className="bg-primary-100 p-2 rounded-full flex-shrink-0">
                <Bot size={16} className="text-primary-700" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-sm shadow-sm text-sm text-gray-700 border border-gray-100 max-w-[80%] leading-relaxed">
                Tentu! Kami memiliki beberapa pilihan paket menarik untuk Bali. Apakah Anda lebih suka wisata pantai, budaya, atau petualangan?
              </div>
            </div>
            
             {/* Bot Typing Indicator (Dummy) */}
             <div className="flex gap-2 items-end opacity-50">
              <div className="bg-primary-100 p-2 rounded-full flex-shrink-0">
                <Bot size={16} className="text-primary-700" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 p-1 pl-4 focus-within:border-primary-300 focus-within:bg-white transition-colors">
              <input 
                type="text" 
                placeholder="Ketik pesan Anda..." 
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <button className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full transition-transform hover:scale-105 flex items-center justify-center shadow-sm">
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-400">Powered by Trivgoo AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={toggleChat}
        className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-soft transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-100"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default ChatbotWidget;
