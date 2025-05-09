import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";

const SIGNALING_SERVER_URL = "https://localhost:4000";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

function MeetWithFriends() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef();
  const peerRef = useRef();
  const localStreamRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    setJoined(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      socketRef.current = io(SIGNALING_SERVER_URL, {
        transports: ["websocket"],
        secure: true,
      });

      socketRef.current.emit("join", roomId);

      socketRef.current.on("initiate-peer", () => {
        peerRef.current = createPeer(true);
      });

      socketRef.current.on("signal", (data) => {
        if (!peerRef.current) {
          peerRef.current = createPeer(false);
        }
        peerRef.current.signal(data);
      });
    } catch (err) {
      console.error("getUserMedia error:", err);
      alert("Error accessing camera/mic: " + err.message);
    }
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

  return (
    <div className="w-[800px] h-[900px] bg-black relative">
      {!joined && (
        <form
          onSubmit={handleSubmit}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-black/60 p-6 rounded-lg"
        >
          <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
            className="text-black px-3 py-2 rounded w-44"
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-white text-black rounded"
          >
            Join Room
          </button>
        </form>
      )}

      {joined && (
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
