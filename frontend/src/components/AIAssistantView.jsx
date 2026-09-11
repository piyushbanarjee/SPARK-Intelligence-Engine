import React, { useState } from 'react';
import { Send, Cpu, User, ShieldAlert } from 'lucide-react';
import { chatWithAI } from '../api/client';

const AIAssistantView = ({ caseId }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Agent, how can I assist your investigation today?', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !caseId) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, sender: 'user' }]);
    setIsTyping(true);
    setIsOffline(false);

    try {
      const response = await chatWithAI(caseId, userMsg);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: response.message || response.reply || "Acknowledge.", 
        sender: 'ai' 
      }]);
    } catch (err) {
      if (err.response?.status === 404) {
        setIsOffline(true);
        // Remove the user's message since it failed to send to an offline module
        setMessages(prev => prev.filter(m => m.text !== userMsg));
      } else {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "System Error: Unable to reach Llama 3.2 cortex. Neural link disrupted.", 
          sender: 'ai' 
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  if (isOffline) {
    return (
      <div className="flex-1 flex flex-col pt-24 pb-32 h-screen overflow-hidden items-center justify-center">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500 shadow-xl max-w-lg mx-4">
          <ShieldAlert className="w-12 h-12 text-blue-500 mb-4 opacity-80 mx-auto" />
          <h3 className="text-lg font-bold text-white mb-2">Cortex Offline</h3>
          <p>The Llama 3.2 RAG AI integration is pending initialization on the backend. Awaiting Python endpoint integration.</p>
          <button 
            onClick={() => setIsOffline(false)}
            className="mt-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm"
          >
            Return to Interface
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-24 pb-32 h-screen overflow-hidden">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full px-6">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-purple-500" />
            <span>Llama 3.2 RAG Cortex</span>
          </h2>
          <p className="text-neutral-400">Direct interface to the investigative AI assistant.</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide flex flex-col">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-900/50 border border-blue-500/50 ml-3' : 'bg-purple-900/50 border border-purple-500/50 mr-3'}`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4 text-blue-400" /> : <Cpu className="w-4 h-4 text-purple-400" />}
                </div>
                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)] rounded-tr-sm' 
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-300 shadow-[0_0_15px_rgba(168,85,247,0.1)] rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex w-full justify-start">
               <div className="flex max-w-[80%] flex-row items-center">
                 <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/50 mr-3 flex items-center justify-center">
                   <Cpu className="w-4 h-4 text-purple-400" />
                 </div>
                 <div className="px-5 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-sm">
                   <span className="text-neutral-500 text-sm animate-pulse">Processing context...</span>
                 </div>
               </div>
             </div>
          )}
        </div>

        <div className="pt-4 pb-4">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI about the case..."
              className="w-full pl-6 pr-14 py-4 bg-neutral-900/90 border border-neutral-800 rounded-full text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-xl"
            />
            <button 
              type="submit"
              disabled={isTyping || !input.trim()}
              className="absolute right-2 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 text-white flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AIAssistantView;
