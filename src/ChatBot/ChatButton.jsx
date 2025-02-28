import { addToast } from "@heroui/react";
import { useRef, useState } from "react";
import Listening from "./assets/chat/listening.gif";
import CloseWhite from "./assets/chat/closewhite.svg";
import SendWhite from "./assets/chat/sendwhite.svg";
import Send from "./assets/chat/send.svg";
import Mic from "./assets/chat/mic.svg";

const ChatButton = ({
  message,
  onSendMessage,
  setMessage,
  socket,
  addMessage,
}) => {
  const [isRecording, setIsRecording] = useState(false);

  // Use refs to store the recorder and audio chunks across renders.
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect data as it becomes available.
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);

      addToast({
        title: "Please allow microphone access.",
      });
    }
  }

  async function stopRecording(send = true) {
    if (mediaRecorderRef.current) {
      // Set up the onstop handler before stopping the recorder.
      if (send) {
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            // Send the base64 audio via the socket.
            
            socket.send(
              JSON.stringify({
                type: "audio",
                content: reader.result,
                voice: "shimmer",
              })
            );
          };
        };
      }

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  return (
    <>
      <div
        className={`flex items-center justify-center w-full space-x-2 border-t-[1px] ${
          isRecording
            ? "bg-gradient-to-r from-[#3A3C3E] to-[#6D808C]"
            : "border-[#f3f3f3] bg-white"
        } rounded-b-lg`}
      >
        {isRecording ? (
          <div className="flex items-center px-4 py-4 w-full justify-between">
            <button
              type="button"
              className="h-6 w-6 hover:!bg-transparent focus:!bg-transparent rounded-full p-1 inline-flex items-center  text-white"
              onClick={() => stopRecording(false)}
            >
              <img src={CloseWhite} alt="close" />
            </button>
            <div className="flex items-center gap-2">
              <img src={Listening} alt="listening" className="h-5" />
            </div>
            <button
              type="button"
              className="h-7 w-7 rounded-full p-1 hover:!bg-transparent focus:!bg-transparent inline-flex items-center  text-white"
              onClick={() => stopRecording(true)}
            >
              <img src={SendWhite} alt="close" />
            </button>
          </div>
        ) : (
          <>
            <input
              className="flex h-10 w-full rounded-md px-3 py-3 focus:outline-none text-sm placeholder-[#a5aebd] placeholder:text-xs disabled:cursor-not-allowed disabled:opacity-50 text-[#030712]"
              placeholder="Type your message"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              onKeyDown={(e) => {
                if (e.key === "Enter" && message?.length > 0) {
                  onSendMessage(message);
                }
              }}
            />
            <button
              className="inline-flex hover:!bg-transparent focus:!bg-transparent items-center justify-center bg-white rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 h-10 w-10"
              onClick={
                message?.length > 0
                  ? () => onSendMessage(message)
                  : startRecording
              }
            >
              {message?.length > 0 ? (
                <img src={Send} alt="send" className="w-7" />
              ) : (
                <img
                  src={Mic}
                  alt="mic"
                  className={isRecording ? "animate-pulse" : ""}
                />
              )}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ChatButton;
