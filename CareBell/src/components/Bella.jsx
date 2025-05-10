// src/components/Bella.jsx
import React, { useEffect, useState, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';
import bella_img from '../resources/Grafik3a.png';

export default function Bella() {
  const [callStatus, setCallStatus] = useState('ready');   // 'ready' | 'calling' | 'in-call'
  const [messages, setMessages]     = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const vapiRef = useRef(null);
  const chatRef = useRef(null);

  // Load persisted chat
  useEffect(() => {
    const saved = localStorage.getItem('bella_chat');
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Persist chat
  useEffect(() => {
    localStorage.setItem('bella_chat', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll on new messages or when opening
  useEffect(() => {
    if (chatRef.current && isChatOpen) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isChatOpen]);

  // SDK init & handlers
  useEffect(() => {
    const vapi = vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

    vapi.on('call-start', () => {
      setCallStatus('in-call');
      setIsChatOpen(true);
    });
    vapi.on('call-end', () => {
      setCallStatus('ready');
    });
    vapi.on('message', msg => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        const text = msg.transcript.trim();
        if (text) {
          const speaker = msg.role === 'assistant' ? 'assistant' : 'user';
          setMessages(prev => [...prev, { speaker, text }]);
        }
      }
    });
    vapi.on('error', err => console.error('Vapi error', err));

    return () => vapi.removeAllListeners();
  }, []);

  // Call controls
  const startCall = () => {
    setCallStatus('calling');                // ← show “Calling Bella…” immediately
    vapiRef.current.start(
      import.meta.env.VITE_VAPI_ASSISTANT_ID,
      { clientMessages: ['transcript'] }
    );
  };
  const endCall = () => vapiRef.current.stop();
  const toggleCall = () =>
    callStatus === 'ready' ? startCall() : endCall();

  // Determine button icon & label
  const Icon = callStatus === 'ready'
    ? FaPhone
    : FaPhoneSlash;

  let callLabel;
  if (callStatus === 'ready')     callLabel = 'Talk to Bella';
  else if (callStatus === 'calling') callLabel = 'Calling Bella…';
  else                             callLabel = 'Stop Call';

  // softer blue pill for chat toggles
  const chatBtnClass = `
    inline-flex items-center justify-center
    border-2 border-blue-700
    rounded-full
    py-1 px-4 text-sm
    bg-blue-700 text-white font-semibold
    hover:bg-blue-600
    focus:outline-none focus:ring-2 focus:ring-blue-300
    transition mb-4
  `;

  return (
    <div className="flex flex-col items-center w-full">
      {isChatOpen ? (
        <>
          {/* small avatar */}
          <div
            id="bella-img"
            className="rounded-full overflow-hidden border-[5px]
                       border-blue-800 mb-2 w-24 h-24"
          >
            <img
              src={bella_img}
              alt="Bella"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Close Chat */}
          <button
            onClick={() => setIsChatOpen(false)}
            className={chatBtnClass}
            aria-label="Close chat"
          >
            Close Chat
          </button>

          {/* chat panel */}
          <div
            ref={chatRef}
            className="w-full max-w-md p-4 bg-white rounded-lg shadow
                       overflow-y-auto mb-4 space-y-3"
            style={{ maxHeight: '300px' }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.speaker === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`
                    px-4 py-2 rounded-lg
                    ${m.speaker === 'assistant'
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-300 text-black'}
                  `}
                  style={{ fontSize: '18px', lineHeight: '1.4' }}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* big avatar */}
          <div
            id="bella-img"
            className="rounded-full overflow-hidden border-[5px]
                       border-blue-800 mb-4 w-48 h-48"
          >
            <img
              src={bella_img}
              alt="Bella"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Open Chat button below avatar */}
          {messages.length > 0 && (
            <button
              onClick={() => setIsChatOpen(true)}
              className={chatBtnClass}
              aria-label="Open chat"
            >
              Open Chat
            </button>
          )}
        </>
      )}

      {/* call toggle button */}
      <button
        onClick={toggleCall}
        className="
          inline-flex items-center justify-center
          border-2 border-blue-900
          rounded-xl py-2 px-4
          bg-blue-900 text-white font-semibold
          hover:bg-blue-800
          focus:outline-none focus:ring-2 focus:ring-white
          transition
        "
      >
        <Icon className="mr-2 text-xl" />
        {callLabel}
      </button>
    </div>
  );
}
