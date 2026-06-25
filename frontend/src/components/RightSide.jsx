import React from "react";
import { BsCameraVideoFill } from "react-icons/bs";
import { IoCall } from "react-icons/io5";
import FriendInfo from "./FriendInfo";
import Message from "./Message";
import MessageSend from "./MessageSend";
import { useDispatch } from "react-redux";
import {
  messageSend,
  ImageMessageSend,
} from "../store/actions/messengerAction";
import useSound from "use-sound";
import sendingSound from "../audio/sending.mp3";

const RightSide = (props) => {
  const {
    currentfriend,
    newMessage,
    message,
    scrollRef,
    activeUser,
    typingMessage,
    setNewMessage,
    socket,
    myInfo,
    currentPage = "HomePage",
  } = props;

  const [sendingSPlay] = useSound(sendingSound);
  const dispatch = useDispatch();

  const handleInput = (e) => {
    setNewMessage(e.target.value);

    socket.current.emit("typingMessage", {
      senderId: myInfo.id,
      reseverId: currentfriend._id,
      msg: e.target.value,
    });
  };
  const sendMessage = (e) => {
    e.preventDefault();
    sendingSPlay();
    const data = {
      senderName: myInfo.userName,
      reseverId: currentfriend._id,
      message: newMessage ? newMessage : "❤️",
    };

    socket.current.emit("typingMessage", {
      senderId: myInfo.id,
      reseverId: currentfriend._id,
      msg: "",
    });
    dispatch(messageSend(data));
    setNewMessage("");
  };

  const emojiSend = (emu) => {
    setNewMessage(`${newMessage}` + emu);
    socket.current.emit("typingMessage", {
      senderId: myInfo.id,
      reseverId: currentfriend._id,
      msg: emu,
    });
  };

  const ImageSend = (e) => {
    if (e.target.files.length !== 0) {
      sendingSPlay();
      const imagename = e.target.files[0].name;
      const newImageName = Date.now() + imagename;

      const formData = new FormData();

      formData.append("senderName", myInfo.userName);
      formData.append("imageName", newImageName);
      formData.append("reseverId", currentfriend._id);
      formData.append("image", e.target.files[0]);

      dispatch(ImageMessageSend(formData));
    }
  };

  if (!currentfriend) {
    return (
      <div
        style={{
          width: "100%",
          display:
            window.innerWidth < 600
              ? currentPage === "MessagePage"
                ? "flex"
                : "none"
              : "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
        }}
      >
        Select a friend to chat with
      </div>
    );
  }

  return (
    <div
      className="col-9"
      style={{
        display:
          window.innerWidth < 600
            ? currentPage === "MessagePage"
              ? "block"
              : "none"
            : "block",
      }}
    >
      <div className="right-side">
        <input type="checkbox" id="dot" />
        <div className="row">
          <div className="col-8">
            <div className="message-send-show">
              <div className="header">
                <div className="image-name">
                  <div className="image">
                    <img src={`${currentfriend.image}`} alt="" />
                    {activeUser &&
                    activeUser.length > 0 &&
                    activeUser.some((u) => u.userId === currentfriend._id) ? (
                      <div className="active-icon"></div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="name">
                    <h3> {currentfriend.userName}</h3>
                  </div>
                </div>
                <div className="icons">
                  <div className="icon">
                    <IoCall />
                  </div>
                  <div className="icon">
                    <BsCameraVideoFill />
                  </div>
                </div>
              </div>
              <Message
                typingMessage={typingMessage}
                currentfriend={currentfriend}
                scrollRef={scrollRef}
                message={message}
              />
              <MessageSend
                ImageSend={ImageSend}
                emojiSend={emojiSend}
                sendMessage={sendMessage}
                inputHendle={handleInput}
                newMessage={newMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSide;
