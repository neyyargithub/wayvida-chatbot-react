import { Switch } from "@heroui/react";
import React, { useEffect, useRef, useState } from "react";
import { resolveSocketApiBaseUrl } from "../resoveApiBaseUrl";
import Ai from "./assets/chat/ai.svg";
import BgChat from "./assets/chat/bgchat.jpg";
import Preparing from "./assets/chat/preparing.gif";
import Thinking from "./assets/chat/thinking.gif";
import CloseMobile from "./assets/chat/closemobile.svg";
import ChatButton from "./ChatButton";
import "./noscroll.css";
import Markdown from "react-markdown";

function ChatPopup({ message, setMessage, handleChatPopup }) {
  const [popupHeight, setPopupHeight] = useState(window.innerHeight - 200);
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);
  const chatBoxRef = useRef(null);
  const audioElement = useRef(null);
  const [botTyping, setBotTyping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isAudioProcessing, setIsAudioProcessing] = useState(false);

  // Refs to hold the in-progress streaming message and debouncing timer
  const streamingMessageRef = useRef(null);
  const flushTimerRef = useRef(null);
  const audioEnabledRef = useRef(false);
  let session_id = localStorage.getItem("session_id") || generateSessionId();
  localStorage.setItem("session_id", session_id);
  function generateSessionId() {
    return crypto.randomUUID();
  }
  useEffect(() => {
    audioEnabledRef.current = audioEnabled; // Update ref without triggering re-render
  }, [audioEnabled]);

  const handleAudioMode = (state) => {
    if (audioElement.current) {
      audioElement.current.pause();
    }
    setAudioEnabled(state);
    localStorage.setItem("isAudioEnabled", state);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "inherit";
    const isAudioEnabled = localStorage.getItem("isAudioEnabled");

    if (isAudioEnabled) {
      setAudioEnabled(isAudioEnabled === "false" ? false : true);
    }
    socket.current = new WebSocket(
      `${resolveSocketApiBaseUrl()}/wordpress/chat?session_id=${session_id}`
    );

    socket.current.onopen = () => {
      console.log("Connected to WebSocket");
      // addMessage("Bot", "Hi there! How can I assist you today?");
      socket.current.send(
        JSON.stringify({ type: "text", content: "Hi", voice: "shimmer" })
      );
      setIsConnecting(false);
    };

    socket.current.onmessage = (event) => {
      const data = event.data;
      requestAnimationFrame(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTo({
            top: chatBoxRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      });
      if (data === "[TYPING]") {
        // Show typing indicator and reset any in-progress streaming message.
        setBotTyping(true);
        streamingMessageRef.current = null;
        return;
      } else if (data.startsWith("[USER_SAID]")) {
        // Process a voice message from the user.
        setIsAudioProcessing(false);
        setBotTyping(false);
        const userSpeech = data.replace("[USER_SAID]", "").trim();

        addMessage(
          "You(speech)",
          `<span style='display:flex;align-items:center; gap:4px;'>
          ${userSpeech} <svg
            width="15px"
            height="15px"
            viewBox="0 0 16 16"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
          >
            <path
              fill="#404448"
              d="M8 10v0c-1.7 0-3-1.3-3-3v-4c0-1.6 1.3-3 3-3v0c1.6 0 3 1.3 3 3v4c0 1.6-1.4 3-3 3z"
            />
            <path
              fill="#404448"
              d="M12 5v2.5c0 1.9-1.8 3.5-3.8 3.5h-0.4c-2 0-3.8-1.6-3.8-3.5v-2.5c-0.6 0-1 0.4-1 1v1.5c0 2.2 1.8 4.1 4 4.4v2.1c-3 0-2.5 2-2.5 2h7c0 0 0.5-2-2.5-2v-2.1c2.2-0.4 4-2.2 4-4.4v-1.5c0-0.6-0.4-1-1-1z"
            />
          </svg>

        </span>`
        );
        return;
      } else if (data.startsWith("[AUDIO]")) {
        // Process an audio message.
        setBotTyping(false);
        const audioBase64 = data.replace("[AUDIO]", "").trim();
        if (audioEnabledRef.current) {
          playAudio(audioBase64);
        }
        return;
      } else if (data === "[REMOVE_TYPING]") {
        // Remove any in-progress typing content.
        setBotTyping(false);
        if (streamingMessageRef.current) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...streamingMessageRef.current,
            };
            return newMessages;
          });
          streamingMessageRef.current = null;
        }
        return;
      } else {
        setBotTyping(false);

        // Immediately push the message update without debounce
        setMessages((prev) => [...prev, { sender: "Bot", content: data }]);

        streamingMessageRef.current = { sender: "Bot", content: data };

        if (flushTimerRef.current) {
          clearTimeout(flushTimerRef.current);
        }

        flushTimerRef.current = setTimeout(() => {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...streamingMessageRef.current,
            };
            return newMessages;
          });
          flushTimerRef.current = null;
        }, 50); // Reduce debounce time for faster updates
      }
    };

    socket.current.onclose = () => {
      console.log("WebSocket disconnected");
      // addMessage("System", "Disconnected from chat.");
    };

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      socket.current.close();
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setPopupHeight(window.innerHeight - 200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function addMessage(sender, content) {
    if (!content?.trim()) return;
    setMessages((prev) => [...prev, { sender, content }]);
    requestAnimationFrame(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }

  function sendMessage() {
    if (!message.trim()) return;
    addMessage("You", message);
    socket.current.send(
      JSON.stringify({ type: "text", content: message, voice: "shimmer" })
    );
    setMessage("");
  }

  function playAudio(base64Audio, mimeType = "audio/mp3") {
    // if (audioElement.current) {
    //   audioElement.current.pause();
    // }
    // audioElement.current = new Audio(base64Audio);
    // audioElement.current.play();
    if (audioElement.current) {
      audioElement.current.pause();
    }

    // Convert Base64 to Blob
    const binaryString = atob(base64Audio.split(",")[1]); // Remove data URL prefix if present
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    // Play Audio
    audioElement.current = new Audio(blobUrl);
    audioElement.current
      .play()
      .catch((error) => console.log("Playback error:", error));
  }

  return (
    <div
      style={{
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        height: `${popupHeight}px`,
      }}
      className="fixed z-[100] bottom-[0rem] sm:bottom-[calc(4rem+5rem)] right-0 sm:mr-4 bg-white rounded-lg border border-[#e5e7eb] w-full sm:w-[440px]"
    >
      <div className="relative h-full w-full">
        <div className="flex flex-col space-y-2 relative">
          <img
            src={BgChat}
            alt="bg"
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
          />
          <div className="relative z-10 p-4 pb-5 sm:block flex items-start justify-between ">
            <span className="text-white text-2xl font-medium">
              Hi there 👋
              <br />
              How can we help?
            </span>
            <img
              src={CloseMobile}
              alt="close"
              onClick={handleChatPopup}
              className="sm:hidden block h-7 w-7 cursor-pointer [pointer-events:all]"
            />
          </div>
          <div className="flex items-center gap-2 justify-end absolute -bottom-8 right-0 z-10 bg-white p-1 !pr-5 w-full">
            <span className="text-[#707d95] text-xs font-medium ">
              Audio mode
            </span>
            <Switch
              size="sm"
              color="secondary"
              isSelected={audioEnabled}
              onValueChange={(checked) => handleAudioMode(checked)}
            />
          </div>
        </div>
        {!isConnecting ? (
          <>
            <div
              className="px-5 pt-8 pb-11 overflow-y-scroll min-w-full flex flex-col w-full gap-4 no-scrollbar"
              style={{ height: `${popupHeight - 125}px` }}
              ref={chatBoxRef}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-1 text-sm  ${
                    msg.sender === "You" || msg.sender === "You(speech)"
                      ? "justify-end"
                      : ""
                  }`}
                >
                  <div
                    key={index}
                    className={`flex gap-1 text-sm  max-w-[85%]`}
                  >
                    {msg.sender !== "You" && msg.sender !== "You(speech)" && (
                      <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                        <img src={Ai} alt="bot" />
                      </span>
                    )}
                    <div
                      className={`p-2.5 rounded-xl ${
                        msg.sender === "You" || msg.sender === "You(speech)"
                          ? "bg-[#fbefe7]"
                          : "bg-[#eaf4ff]"
                      }`}
                    >
                      {/* Using dangerouslySetInnerHTML to render potential HTML content */}
                      {msg.sender === "You(speech)" ? (
                        <span
                          className="text-[#1c1e21] text-xs font-medium"
                          dangerouslySetInnerHTML={{ __html: msg.content }}
                        />
                      ) : (
                        <span className="text-[#1c1e21] text-xs font-medium">
                          <Markdown>{msg.content}</Markdown>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Single typing indicator */}
              {botTyping && (
                <div className="flex gap-1 text-sm">
                  <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                    <img src={Ai} alt="bot" />
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#eaf4ff]">
                    <img src={Thinking} alt="thinking" loading="eager" />
                  </div>
                </div>
              )}
              {isAudioProcessing && (
                <div className={`flex gap-1 text-sm  justify-end`}>
                  <div className={`p-2.5 rounded-xl bg-[#fbefe7]`}>
                    <img src={Thinking} alt="thinking" loading="eager" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center absolute bottom-0 w-full">
              <ChatButton
                message={message}
                onSendMessage={sendMessage}
                setMessage={setMessage}
                socket={socket.current}
                addMessage={addMessage}
                setIsAudioProcessing={setIsAudioProcessing}
              />
            </div>
          </>
        ) : (
          <div
            className="relative flex  w-full flex-col items-center justify-center gap-2"
            style={{ height: `${popupHeight - 110}px` }}
          >
            <img src={Preparing} alt="preparing" loading="eager" />
            <span className=" text-center text-xs font-medium text-[#61728d]">
              Preparing assistant!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPopup;
