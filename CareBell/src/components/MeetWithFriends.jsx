import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";
import axios from "axios";
import { API } from "../config";
import { FaArrowLeft }     from "react-icons/fa";
import { useNavigate }     from "react-router-dom";


const SIGNALING_SERVER_URL = `${API}`;
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

function MeetWithFriends() {
  const [allUsers, setAllUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userSelected, setUserSelected] = useState(false);
  const [receivedSignal, setReceivedSignal] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef();
  const peerRef = useRef();
  const localStreamRef = useRef();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

   socketRef.current = io(SIGNALING_SERVER_URL, {
    transports: ["websocket"],
    secure: true, // Required for HTTPS
    reconnection: true,
    rejectUnauthorized: false // Temporarily for self-signed certs
  });

    socketRef.current.emit("register", currentUserId);

    socketRef.current.on("incoming-call", (callerId) => {
      setIncomingCall(callerId);
    });

    socketRef.current.on("signal", (data) => {
      if (incomingCall) {
        setReceivedSignal(data.signal);
      } else if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    });

    socketRef.current.on("call-rejected", () => {
      alert("Call was rejected");
      cleanupCall();
    });

    return () => {
      socketRef.current?.disconnect();
      cleanupCall();
    };
  }, [currentUserId]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/users`);
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API}/users/others?excludeId=${currentUserId}`);
      setContacts(response.data);
      console.log("Contacts:", response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (userId) => {
    setCurrentUserId(userId);
    setUserSelected(true);
    console.log("Selected user:", userId);
    fetchContacts();
    console.log("Contacts fetched:", contacts);
  };

  const initiateCall = async (targetUserId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;
      setInCall(true);

      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream,
        config: { iceServers: ICE_SERVERS },
      });

      peer.on("signal", (data) => {
        socketRef.current.emit("signal", { targetUserId, signal: data });
      });

      peer.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        cleanupCall();
      });

      peerRef.current = peer;
      socketRef.current.emit("call-user", targetUserId);
    } catch (err) {
      console.error("Error initiating call:", err);
      alert("Error starting call: " + err.message);
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;
      setInCall(true);

      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: stream,
        config: { iceServers: ICE_SERVERS },
      });

      peer.on("signal", (data) => {
        socketRef.current.emit("signal", {
          targetUserId: incomingCall,
          signal: data,
        });
      });

      peer.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        cleanupCall();
      });

      peerRef.current = peer;
      
      if (receivedSignal) {
        peer.signal(receivedSignal);
        setReceivedSignal(null);
      }

      socketRef.current.emit("accept-call", incomingCall);
      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);
      alert("Failed to accept call: " + err.message);
      cleanupCall();
    }
  };

  const rejectCall = () => {
    socketRef.current.emit("reject-call", incomingCall);
    cleanupCall();
    setIncomingCall(null);
  };

  const cleanupCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setInCall(false);
  };

  if (!userSelected) {
    return (
      <div className="w-[800px] h-[900px] bg-black relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-black/60 p-6 rounded-lg">
          <h2 className="text-white text-xl mb-4">Select your user</h2>
          {loading ? (
            <p className="text-white">Loading users...</p>
          ) : (
            <ul className="text-white max-h-[400px] overflow-y-auto">
              {allUsers.map(user => (
                <li key={user.id} className="mb-2">
                  <button 
                    onClick={() => selectUser(user.id)}
                    className="px-4 py-2 bg-white text-black rounded w-full text-left"
                  >
                    {user.fullName || user.id}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[800px] h-[900px] bg-black relative">
      {!inCall && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-black/60 p-6 rounded-lg">
          <h2 className="text-white text-xl mb-4">
            You are: {allUsers.find(u => u.id === currentUserId)?.fullName || currentUserId}
          </h2>
          <h3 className="text-white text-lg mb-4">Select a contact to call</h3>
          {loading ? (
            <p className="text-white">Loading contacts...</p>
          ) : (
            <ul className="text-white">
              {contacts.map(contact => (
                <li key={contact.id} className="mb-2">
                  <button 
                    onClick={() => initiateCall(contact.id)}
                    className="px-4 py-2 bg-white text-black rounded"
                  >
                    {contact.fullName || contact.id}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button 
            onClick={() => {
              setUserSelected(false);
              cleanupCall();
            }}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
          >
            Change User
          </button>
        </div>
      )}

      {incomingCall && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 p-6 rounded-lg">
          <p className="text-white mb-4">
            Incoming call from {allUsers.find(u => u.id === incomingCall)?.fullName || incomingCall}
          </p>
          <div className="flex gap-4">
            <button 
              onClick={acceptCall}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Accept
            </button>
            <button 
              onClick={rejectCall}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {inCall && (
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            playsInline
            autoPlay
            className="w-[80%] h-[80%] object-cover absolute top-0 left-0"
          />
          <video
            ref={localVideoRef}
            playsInline
            autoPlay
            muted
            className="w-[150px] object-cover border-4 border-white rounded-lg absolute bottom-5 right-5 z-10"
          />
          <button
            onClick={cleanupCall}
            className="absolute bottom-5 left-5 px-4 py-2 bg-red-500 text-white rounded"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
}

export default MeetWithFriends;