import React, { useEffect, useState, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';
import bella_img from '../resources/Grafik3a.png';

export default function Bella() {
  const [callStatus, setCallStatus] = useState('ready');
  const vapiRef = useRef(null);

  useEffect(() => {
    const vapi = vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

    vapi.on('call-start',   () => setCallStatus('in-call'));
    vapi.on('speech-start', () => setCallStatus('assistant-talking'));
    vapi.on('speech-end',   () => setCallStatus('waiting'));
    vapi.on('call-end',     () => setCallStatus('ready'));
    vapi.on('error',        err => console.error('Vapi error', err));

    return () => vapi.removeAllListeners();
  }, []);

  const startCall = () =>
    vapiRef.current.start(import.meta.env.VITE_VAPI_ASSISTANT_ID);

  const endCall = () =>
    vapiRef.current.stop();

  const handleClick = () => {
    if (callStatus === 'ready') startCall();
    else endCall();
  };

  let label = 'Talk to Bella';
  if (callStatus === 'assistant-talking')      label = 'Bella is talking';
  else if (callStatus === 'in-call' || callStatus === 'waiting')
    label = 'Speak to Bella';

  return (
    <div className="flex flex-col items-center">
      {/* Image container */}
      <div
        id="bella-img"
        className="rounded-full overflow-hidden border-[5px] border-blue-800 mb-8"
      >
        <img
          src={bella_img}
          alt="Bella"
          className="w-48 h-48 object-cover"
        />
      </div>

      {/* Talk/Hang-up button */}
      <button
        onClick={handleClick}
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
        {callStatus === 'ready'
          ? <FaPhone className="mr-2 text-xl" />
          : <FaPhoneSlash className="mr-2 text-xl" />
        }
        {label}
      </button>
    </div>
  );
}
