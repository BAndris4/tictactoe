import { useState, useRef, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../hooks/useAuth";
import { getGameEvaluation } from "../../api/game";
import type { EvaluationNode } from "../../api/game";

interface ChatPanelProps {
  className?: string;
}

import UserAvatar from "../common/UserAvatar";

export default function ChatPanel({ className = "" }: ChatPanelProps) {
  const { chatMessages, sendChatMessage, status, players, gameId } = useGame();
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [analysisData, setAnalysisData] = useState<EvaluationNode[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, analysisData]);

  // Fetch analysis if game is finished
  useEffect(() => {
    if (status === 'finished' && gameId) {
        getGameEvaluation(gameId)
            .then(data => setAnalysisData(data))
            .catch(err => console.error("Failed to load analysis", err));
    }
  }, [gameId, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendChatMessage(inputText.trim());
      setInputText("");
    }
  };

  // Helper to determine if we should show avatar (last message from same sender)
  const shouldShowAvatar = (index: number, filteredMessages: any[]) => {
    const currentMsg = filteredMessages[index];
    const nextMsg = filteredMessages[index + 1];
    
    if (!nextMsg) return true;
    return nextMsg.sender !== currentMsg.sender;
  };

  // Determine Evaluation Content
  const getEvaluationContent = () => {
      if (!analysisData || analysisData.length === 0) return null;
      
      const { currentHistoryIndex, moves } = useGame();
      let node: EvaluationNode | undefined;
      let label = "";
      let subLabel = "";
      let colorClass = "bg-gray-100 border-gray-300 text-gray-600"; // Default
      
      if (currentHistoryIndex === -1) {
          label = "Game Start";
          subLabel = "Good luck!";
          colorClass = "bg-white/40 border-white/50 text-deepblue";
      } else if (currentHistoryIndex !== null && currentHistoryIndex >= 0 && currentHistoryIndex < moves.length) {
          const moveNo = moves[currentHistoryIndex].move_no;
          node = analysisData.find(n => n.move_no === moveNo);
          
          if (node) {
              const c = node.classification;
              if (c === 'brilliant') {
                  label = "Brilliant Move";
                  colorClass = "bg-teal-400 border-teal-500 text-white shadow-[0_0_20px_rgba(45,212,191,0.6)] animate-pulse";
                  subLabel = "A game-changing find!";
              } else if (c === 'best') {
                  label = "Amazing Move";
                  colorClass = "bg-emerald-400 border-emerald-500 text-white shadow-[0_0_15px_rgba(52,211,153,0.5)]";
                  subLabel = "Best possible move!";
              } else if (c === 'good') {
                  label = "Good Move";
                  colorClass = "bg-blue-400 border-blue-500 text-white shadow-[0_0_10px_rgba(96,165,250,0.5)]";
                  subLabel = "Solid and reliable.";
              } else if (c === 'inaccuracy') {
                  label = "Inaccuracy";
                  colorClass = "bg-yellow-400 border-yellow-500 text-white shadow-[0_0_10px_rgba(250,204,21,0.5)]";
                  subLabel = node.feedback;
              } else if (c === 'mistake') {
                  label = "Mistake";
                  colorClass = "bg-orange-400 border-orange-500 text-white shadow-[0_0_10px_rgba(251,146,60,0.5)]";
                  // refutation is handled below
              } else if (c === 'blunder') {
                  label = "Blunder";
                  colorClass = "bg-red-500 border-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]";
              } else if (c === 'forced') {
                  label = "Forced";
                  colorClass = "bg-gray-400 border-gray-500 text-white";
                  subLabel = "Only one legal move.";
              }
              
              // Use feedback as subLabel unless overridden above (checked good/best/brilliant)
              if (['inaccuracy', 'mistake', 'blunder'].includes(c)) {
                  subLabel = node.feedback; 
              }
          }
      } else {
          // Live or just finished but not reviewing history
          if (status === 'active') {
             label = "Live Game";
             colorClass = "bg-white/40 border-white/50 text-deepblue";
          } else {
             label = "Game Over";
             colorClass = "bg-deepblue text-white";
          }
      }
      
      return { label, subLabel, colorClass, node };
  };

  const evalContent = getEvaluationContent();

  return (
    <div className={`flex flex-col h-full bg-white/40 backdrop-blur-md rounded-[2.5rem] border-2 border-white shadow-xl shadow-deepblue/5 overflow-hidden ${className}`}>
      
      {/* EVALUATION HEADER (Top ~10-15%) */}
      {analysisData && evalContent && (
          <div className={`
            flex flex-col justify-center items-center py-3 px-4 transition-all duration-300 border-b-2 relative overflow-hidden
            ${evalContent.colorClass}
          `} style={{ minHeight: '12%' }}>
              <h2 className="text-2xl font-paytone uppercase tracking-wide drop-shadow-sm animate-bounce-in z-10 relative text-center leading-none">
                  {evalContent.label}
              </h2>
              {evalContent.subLabel && (
                  <p className="text-xs font-bold opacity-90 uppercase tracking-widest font-inter mt-1 text-center z-10 relative whitespace-pre-line">
                      {evalContent.subLabel}
                  </p>
              )}
          </div>
      )}

      {/* HEADER (Only if no analysis) */}
      {!analysisData && (
        <div className="flex border-b border-deepblue/5 bg-white/30 backdrop-blur-xl z-10 py-4 px-6 justify-between items-center">
            <span className="font-paytone text-lg text-deepblue tracking-tight">Chat</span>
            {status === 'active' && (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                    <span className="text-xs font-bold text-mint uppercase tracking-wider">Live</span>
                </div>
            )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col">
        {chatMessages.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center opacity-30">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2 text-deepblue">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
               </svg>
               <span className="text-xs font-bold text-deepblue font-inter">No messages yet</span>
           </div>
        ) : (
            <div className="flex flex-col">
            {chatMessages.filter(m => !m.message_type || m.message_type === 'chat').map((msg, index, arr) => {
                const isMe = user ? (String(msg.sender) === String(user.id)) : false;
                const showAvatar = shouldShowAvatar(index, arr);
                
                 // Determine Avatar Config
                let avatarConfig = null;
                if (isMe) {
                     if (String(players.x) === String(user?.id)) avatarConfig = players.xAvatar;
                     else avatarConfig = players.oAvatar;
                } else {
                    if (String(msg.sender) === String(players.x)) avatarConfig = players.xAvatar;
                    else if (String(msg.sender) === String(players.o)) avatarConfig = players.oAvatar;
                    else if (msg.is_bot) {
                        if (user && String(players.x) === String(user.id)) avatarConfig = players.oAvatar;
                        else avatarConfig = players.xAvatar;
                    }
                }

                return (
                    <div key={msg.id} className={`flex w-full items-end ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mb-4' : 'mb-1'}`}>
                      {!isMe && (
                          <div className={`flex-shrink-0 w-10 h-10 mr-3 -mb-1`}> 
                              {showAvatar ? (
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/50 border border-white shadow-sm ring-2 ring-white/50">
                                      <UserAvatar avatarConfig={avatarConfig} size="100%" />
                                  </div>
                              ) : <div className="w-10 h-10" />}
                          </div>
                      )}
                      <div className={`
                          relative max-w-[75%] px-6 py-4 text-base font-medium font-inter break-words shadow-sm transition-all
                          ${isMe 
                            ? `bg-deepblue/10 text-deepblue ${showAvatar ? 'rounded-3xl rounded-br-sm' : 'rounded-3xl rounded-r-lg'} mr-3` 
                            : `bg-white text-deepblue ${showAvatar ? 'rounded-3xl rounded-bl-sm' : 'rounded-3xl rounded-l-lg'} border border-deepblue/5`
                          }
                      `}>
                          {msg.content}
                      </div>
                       {isMe && (
                          <div className={`flex-shrink-0 w-10 h-10 -mb-1`}> 
                              {showAvatar ? (
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-deepblue/5 border border-white/50 shadow-sm ring-2 ring-white/50">
                                      <UserAvatar avatarConfig={avatarConfig} size="100%" />
                                  </div>
                              ) : <div className="w-10 h-10" />}
                          </div>
                      )}
                    </div>
                );
            })}
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Always visible unless read-only) */}
      {(status === 'finished' || status === 'aborted') ? (
          <div className="p-4 border-t border-deepblue/5 flex justify-center bg-white/20 backdrop-blur-md">
              <span className="text-xs font-bold text-deepblue/40 uppercase tracking-widest flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  Read Only
              </span>
          </div>
      ) : (
        <div className="p-3 border-t border-deepblue/5 bg-white/20 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-white/60 border border-white rounded-full px-4 py-2 text-sm font-semibold text-deepblue placeholder:text-deepblue/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-deepblue/5 transition-all font-inter"
                />
                <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-9 h-9 flex items-center justify-center bg-deepblue text-white rounded-full hover:bg-deepblue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </form>
        </div>
      )}
    </div>
  );
}
