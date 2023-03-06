import React, { useState, useEffect } from "react";

import "./App.css";

import io from "socket.io-client";
import SimplePeer from "simple-peer";

function App() {
  const [isConnected, setIsConnected] = useState(null);
  const [socket, setSocket] = useState(null); // [socket, setSocket;
  const [lastPong, setLastPong] = useState(null);

  useEffect(() => {
    console.log("init");

    if (socket) {
      socket.on("connect", () => {
        console.log("connected");
        setIsConnected(true);

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const audio = document.querySelector("audio");
          audio.srcObject = stream;
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(stream);
          const destination = audioContext.createMediaStreamDestination();
          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: destination.stream,
          });
          source.connect(destination);
          peer.on("signal", (data) => {
            console.log("ses geliyor", data);
            socket.emit("stream", JSON.stringify(data));
          });
          socket.on("stream", (data) => {
            console.log(data);
            peer.signal(JSON.parse(data));
          });
          peer.on("stream", (stream) => {
            const audio = document.querySelector("audio");
            audio.srcObject = stream;
          });
        });
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("pong", () => {
        console.log("pong is here");
        setLastPong(new Date().toISOString());
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("pong");
      };
    }
  }, [socket]);

  const sendPing = () => {
    socket.emit("ping", "X-Files");
  };

  const changeSocketHost = () => {
    setSocket(io("http://8c45-78-183-128-13.ngrok.io"));
  };
  const changeSocketHostLocal = () => {
    setSocket(io("http://localhost:3000"));
  };

  return (
    <div>
      <p>Connected: {"" + isConnected}</p>
      <p>Last pong: {lastPong || "-"}</p>
      <audio controls />
      <button onClick={sendPing}>Send ping</button>
      <button onClick={changeSocketHost}>Change host</button>
      <button onClick={changeSocketHostLocal}>Change host LOCAL</button>
    </div>
  );
}

export default App;
