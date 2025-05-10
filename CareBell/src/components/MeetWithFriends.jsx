import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";
import axios from "axios";

const SIGNALING_SERVER_URL = "http://51.20.94.199:4000";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

function MeetWithFriends() {
  const [allUsers, setAllUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userSelected, setUserSelected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef();
  const peerRef = useRef();
  const localStreamRef = useRef();

  useEffect(() => {
    // Fetch all available users when component mounts
    fetchAllUsers();
  }, []);

  // Connect to socket and set up listeners only after a user is selected
  useEffect(() => {
    if (!currentUserId) return;

    socketRef.current = io(SIGNALING_SERVER_URL, {
      transports: ["websocket"],
      secure: true,
    });

    // Register the user before any calls happen
    socketRef.current.emit("register", currentUserId);

    socketRef.current.on("incoming-call", ({ callerId }) => {
      setIncomingCall(callerId);
    });

    socketRef.current.on("call-accepted", ({ roomId }) => {
      console.log("Call accepted, room:", roomId);
      startCall();
    });

    socketRef.current.on("call-connected", ({ roomId }) => {
      console.log("Call connected, room:", roomId);
      startCall();
    });

    socketRef.current.on("call-rejected", () => {
      alert("Call was rejected");
    });

    socketRef.current.on("call-failed", ({ reason }) => {
      alert(`Call failed: ${reason}`);
    });

    socketRef.current.on("initiate-peer", () => {
      peerRef.current = createPeer(true);
    });

    socketRef.current.on("signal", (data) => {
      if (!peerRef.current) {
        peerRef.current = createPeer(false);
      }
      peerRef.current.signal(data);
    });

    // Fetch contacts after user selection
    fetchContacts();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentUserId]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://51.20.94.199:4000/users`);
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
      const response = await axios.get(`http://51.20.94.199:4000/users/others?excludeId=${currentUserId}`);
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (userId) => {
    setCurrentUserId(userId);
    setUserSelected(true);
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setInCall(true);
    } catch (err) {
      console.error("getUserMedia error:", err);
      alert("Error accessing camera/mic: " + err.message);
    }
  };

  const initiateCall = (targetUserId) => {
    socketRef.current.emit("call-user", targetUserId);
    alert(`Calling user ${targetUserId}...`);
  };

  const acceptCall = () => {
    socketRef.current.emit("accept-call");
    setIncomingCall(null);
  };

  const rejectCall = () => {
    socketRef.current.emit("reject-call");
    setIncomingCall(null);
  };

  const createPeer = (initiator) => {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: localStreamRef.current,
      config: { iceServers: ICE_SERVERS },
    });

    peer.on("signal", (data) => {
      socketRef.current.emit("signal", data);
    });

    peer.on("stream", (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    return peer;
  };

  // User selection screen
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
            onClick={() => setUserSelected(false)}
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
        </div>
      )}
    </div>
  );
}

export default MeetWithFriends;