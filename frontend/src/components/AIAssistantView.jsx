import React, { useState } from 'react';
import { apiClient } from '../api.js';

const AIAssistantView = ({ caseId }) => {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim() || !caseId) return;
    
    const userMessage = { role: 'user', content: prompt };
    setChatHistory(prev => [...(prev || []), userMessage]);
    setPrompt("");
    setIsTyping(true);

    try {
      const response = await apiClient.chat(caseId, userMessage.content);
      setChatHistory(prev => [...(prev || []), { role: 'ai', content: response.response }]);
    } catch (error) {
      setChatHistory(prev => [...(prev || []), { role: 'ai', content: "System Error: Neural link offline." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 p-6 rounded-lg shadow-xl border border-gray-700 flex flex-col h-[600px]">
      <h3 className="text-xl font-bold mb-4 text-cyan-400 border-b border-gray-800 pb-2">S.P.A.R.K. Neural Link</h3>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {chatHistory?.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-900 border border-cyan-700 text-cyan-100' : 'bg-gray-800 border border-gray-700 text-gray-300'}`}>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 text-gray-400 p-3 rounded-lg text-sm italic animate-pulse">
              Querying vector database & Ollama...
            </div>
          </div>
        )}
        {(!chatHistory || chatHistory.length === 0) && (
          <div className="h-full flex items-center justify-center text-gray-500 italic">
            Awaiting query parameters...
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Query the case evidence..."
          className="flex-1 bg-gray-800 text-gray-200 border border-gray-600 rounded p-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={isTyping || !prompt.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded transition-colors"
        >
          Transmit
        </button>
      </div>
    </div>
  );
};

export default AIAssistantView;