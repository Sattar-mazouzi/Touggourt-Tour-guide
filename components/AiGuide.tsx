
import React, { useState } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { askAiGuide } from '../services/gemini';
import { Language } from '../types';
import { translations } from '../i18n';

interface Props {
  lang: Language;
}

const AiGuide: React.FC<Props> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const botResponse = await askAiGuide(userMsg, lang);
    setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 p-4 bg-orange-500 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all z-40 border-4 border-white"
      >
        <Bot size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col h-[70vh] shadow-2xl">
            <div className="p-4 bg-orange-500 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h3 className="font-bold">{translations.aiAssistant[lang]}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 mt-8">
                  <Bot size={48} className="mx-auto mb-2 opacity-20" />
                  <p>{translations.askAi[lang]}</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-orange-500 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={translations.askAi[lang]}
                  className="flex-1 px-4 py-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="p-3 bg-orange-500 text-white rounded-xl active:scale-95 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiGuide;
