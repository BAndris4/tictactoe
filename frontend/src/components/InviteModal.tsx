import { useState } from "react";
import { useGame } from "../context/GameContext";

export default function InviteModal() {
  const { gameId, status } = useGame();
  const [copied, setCopied] = useState(false);

  if (status !== "waiting" || !gameId) return null;

  const inviteLink = `${window.location.origin}/game/${gameId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeScaleIn">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-white text-center">
        <h2 className="text-2xl font-bold font-paytone text-deepblue mb-4">
          Invite a Friend
        </h2>
        <p className="text-gray-500 mb-6">
          Share this link to start the game
        </p>

        <div className="flex items-center gap-2 mb-6">
          <input
            readOnly
            value={inviteLink}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="bg-deepblue text-white p-3 rounded-xl hover:bg-opacity-90 transition-all active:scale-95"
          >
            {copied ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
               </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-sunshine opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sunshine"></span>
            <span className="text-sm font-medium text-deepblue ml-2">Waiting for opponent...</span>
        </div>
      </div>
    </div>
  );
}
