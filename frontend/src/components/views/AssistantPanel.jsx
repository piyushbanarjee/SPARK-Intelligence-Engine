import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { apiClient } from '../../api.js';

const PRESET_QUERIES = [
  'Summarize all evidence',
  'Identify timeline conflicts',
  'Cross-reference entities',
  'Generate threat assessment',
];

const AssistantPanel = ({ caseId }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'S.P.A.R.K. Intelligence Assistant online. How can I support the investigation?' },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const prompt = text || input;
    if (!prompt.trim() || !caseId) return;

    const userMsg = { role: 'user', content: prompt.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await apiClient.chat(caseId, prompt.trim());
      // Assuming response has 'response' field or is just text
      const aiText = response.response || response.data || response;
      setMessages(prev => [...prev, { role: 'ai', content: typeof aiText === 'string' ? aiText : JSON.stringify(aiText) }]);
    } catch (err) {
      console.error("Chat failed:", err);
      setMessages(prev => [...prev, { role: 'ai', content: 'System Error: Intelligence engine offline or timed out.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Preset Chips */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800/50 overflow-x-auto">
        {PRESET_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="shrink-0 text-[10px] font-mono px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-900/50 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-blue-600' : 'bg-zinc-900 border border-zinc-800'
            }`}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-zinc-500" />}
            </div>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-xl text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-black border border-zinc-800 text-zinc-300 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800">
              <Bot size={14} className="text-zinc-500" />
            </div>
            <div className="bg-black border border-zinc-800 rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask the intelligence engine..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 font-mono"
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantPanel;
