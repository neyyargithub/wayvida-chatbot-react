import { Tooltip } from "@heroui/react";
import React, { useEffect, useState } from "react";
import ChatPopup from "./ChatPopup";
import Close from "./assets/chat/close.svg";
import Down from "./assets/chat/down.svg";
import Messa from "./assets/chat/message.svg";
function Chat() {
  const [openTooltip, setOpenTooltip] = useState(true);
  const [openChat, setOpenChat] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const isWelcomeToastChat = localStorage.getItem("isWelcomeToastChat");

    if (isWelcomeToastChat) {
      setOpenTooltip(isWelcomeToastChat === "false" ? false : true);
    }

    return () => {};
  }, []);
  const handleToolTip = (state) => {
    setOpenTooltip(state);
    localStorage.setItem("isWelcomeToastChat", state);
  };
  const handleChatPopup = () => {
    setOpenChat((prev) => !prev);
    handleToolTip(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (openTooltip) {
        setOpenTooltip(false); // Close tooltip when scrolling
      }
    };
    const handleScrollEnd = () => {
      const isWelcomeToastChat = localStorage.getItem("isWelcomeToastChat");

      setOpenTooltip(isWelcomeToastChat === "false" ? false : true);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("scrollend", handleScrollEnd);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [openTooltip]);

  return (
    <div>
      <Tooltip
        id="chatbottooltip"
        content={
          <div className="relative px-2 py-2 ">
            <button
              type="button"
              className="absolute -left-4 -top-4 inline-flex h-6 w-6 items-center rounded-full border bg-white p-1 text-center"
              onClick={() => {
                handleToolTip(false);
              }}
            >
              <img src={Close} alt="close" />
            </button>
            <span className="text-sm font-normal text-[#575757]">
              Welcome to Wayvida Ai
              <br /> Experts are available to
              <br /> answer your questions
            </span>
          </div>
        }
        isOpen={openTooltip}
        color={"foreground"}
        placement="left-end"
        showArrow={true}
        classNames={{ content: "bg-white" }}
      >
        <button
          type="button"
          className={`h-12 w-12 border-none rounded-full  flex items-center justify-center p-2.5 text-center bg-gradient-to-b ${openChat?'from-[#6D808C] to-[#3A3C3E]':'from-[#E35981] to-[#436CE5]'} fixed bottom-20 right-6`}
          onClick={handleChatPopup}
        >
          <img src={openChat ? Down : Messa} alt={openChat ? "close" : "msg"} />
        </button>
      </Tooltip>
      {openChat && <ChatPopup message={message} setMessage={setMessage} />}
    </div>
  );
}

export default Chat;
