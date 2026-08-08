import React, { useState, useRef, useEffect } from 'react';
import { AICoachMessage, Team, FormationPreset } from '../../types';
import { processAICoachPrompt } from '../../services/aiEngine';
import { Bot, Mic, MicOff, Send, Sparkles, X, Volume2 } from 'lucide-react';

interface AICoachModalProps {
  team: Team;
  currentFormation: FormationPreset;
  isOpen: boolean;
  onClose: () => void;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({ team, currentFormation, isOpen, onClose }) => {
  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `👋 **Hello Coach! I'm your AI Tactical Sidekick.**\n\nI'm set up with your **${team.name}** team (${team.format}, ${team.playingStyle === 'youth-buildout' ? 'Youth Development Style' : team.playingStyle}).\n\nHow can I help you prepare today's match or practice?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: AICoachMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');

    // Generate AI response
    setTimeout(() => {
      const aiMsg = processAICoachPrompt(text, team, currentFormation);
      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  // Speech Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser window. Try Chrome or Safari!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl h-[600px] rounded-2xl flex flex-col border border-emerald-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                AI Coach Assistant
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded font-bold">
                  AI Pro Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Context: {team.name} ({team.format})</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                    : 'glass-card text-slate-200 border border-slate-700/80 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <div className="text-[9px] opacity-60 text-right">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompt Chips */}
        <div className="p-2 bg-slate-900/80 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleSendMessage("Youth build-out tactics for today's match?")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg whitespace-nowrap border border-amber-500/20"
          >
            💡 Youth Build-Out Tactics
          </button>
          <button
            onClick={() => handleSendMessage("Generate equal minutes sub plan")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg whitespace-nowrap border border-emerald-500/20"
          >
            📋 Equal Sub Schedule
          </button>
          <button
            onClick={() => handleSendMessage("Suggest a passing drill")}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg whitespace-nowrap border border-blue-500/20"
          >
            🎯 Recommended Drill
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <button
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl transition ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Hands-free Voice Mode"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? "Listening on pitch..." : "Ask AI about lineups, Coach Rory tactics, drills..."}
            className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            onClick={() => handleSendMessage()}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
