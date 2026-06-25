import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import RightSide from "./RightSide";
import LeftSide from "./LeftSide";

import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  getFriends,
  getMessage,
  seenMessage,
  updateMessage,
  getTheme,
} from "../store/actions/messengerAction";
import useSound from "use-sound";
import notificationSound from "../audio/notification.mp3";

const Messages = () => {
  const { userId } = useParams();

  const [notificationSPlay] = useSound(notificationSound);
  const { myInfo } = useSelector((state) => state.auth);
  const {
    friends,
    message,
    messageSendSuccess,
    message_get_success,
    themeMood,
    new_user_add,
  } = useSelector((state) => state.messenger);

  const [currentfriend, setCurrentFriend] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [socketMessage, setSocketMessage] = useState("");
  const [typingMessage, setTypingMessage] = useState("");

  const [activeUser, setActiveUser] = useState([]);

  const [showFirstDiv, setShowFirstDiv] = useState(true); // state to track which section is displayed on mobile width

  const scrollRef = useRef();
  const socket = useRef();

  useEffect(() => {
    // listening for socket event on the backend
    socket.current = io("/");
    socket.current.on("getMessage", (data) => {
      setSocketMessage(data);
    });
    socket.current.on("typingMessageGet", (data) => {
      setTypingMessage(data);
    });
    socket.current.on("msgSeenResponse", (msg) => {
      dispatch({
        type: "SEEN_MESSAGE",
        payload: {
          msgInfo: msg,
        },
      });
    });
    socket.current.on("msgDelivaredResponse", (msg) => {
      dispatch({
        type: "DELIVARED_MESSAGE",
        payload: {
          msgInfo: msg,
        },
      });
    });
    socket.current.on("seenSuccess", (data) => {
      dispatch({
        type: "SEEN_ALL",
        payload: data,
      });
    });
  }, []);
  useEffect(() => {
    socket.current.emit("addUser", myInfo.id, myInfo);
  }, []);

  useEffect(() => {
    socket.current.on("getUser", (users) => {
      const filterUser = users.filter((u) => u.userId !== myInfo.id);
      setActiveUser(filterUser);
    });
    socket.current.on("new_user_add", (data) => {
      dispatch({
        type: "NEW_USER_ADD",
        payload: {
          new_user_add: data,
        },
      });
    });
  }, []);

  useEffect(() => {
    if (socketMessage && currentfriend) {
      if (
        socketMessage.senderId === currentfriend._id &&
        socketMessage.reseverId === myInfo.id
      ) {
        dispatch({
          type: "SOCKET_MESSAGE",
          payload: {
            message: socketMessage,
          },
        });

        dispatch(seenMessage(socketMessage));
        socket.current.emit("messageSeen", socketMessage);
        dispatch({
          type: "UPDATE_FRIEND_MESSAGE",
          payload: {
            msgInfo: socketMessage,
            status: "seen",
          },
        });
      }
    }
    setSocketMessage("");
  }, [socketMessage]);

  useEffect(() => {
    if (
      socketMessage &&
      socketMessage.senderId !== currentfriend._id &&
      socketMessage.reseverId === myInfo.id
    ) {
      notificationSPlay();
      toast.success(`${socketMessage.senderName} send a new message`);
      dispatch(updateMessage(socketMessage));
      socket.current.emit("delivaredMessage", socketMessage);
      dispatch({
        type: "UPDATE_FRIEND_MESSAGE",
        payload: {
          msgInfo: socketMessage,
          status: "delivared",
        },
      });
    }
  }, [socketMessage]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (messageSendSuccess) {
      socket.current.emit("sendMessage", message[message.length - 1]);
      dispatch({
        type: "UPDATE_FRIEND_MESSAGE",
        payload: {
          msgInfo: message[message.length - 1],
        },
      });
      dispatch({ type: "MESSAGE_SEND_SUCCESS_CLEAR" });
    }
  }, [messageSendSuccess]);
  useEffect(() => {
    dispatch(getFriends());
    dispatch({ type: "NEW_USER_ADD_CLEAR" });
  }, [new_user_add]);

  useEffect(() => {
    if (friends && friends.length > 0) {
      //get friend info from friends list using thier userId
      const currfriend = friends.find((friend) => friend.fndInfo._id === userId );
      // set current friend to the current friend info
      setCurrentFriend(currfriend.fndInfo);
    }
  }, [friends, userId]);

  useEffect(() => {
    dispatch(getMessage(currentfriend._id));
  }, [currentfriend?._id]);

  useEffect(() => {
    if (message.length > 0) {
      if (
        message[message.length - 1].senderId !== myInfo.id &&
        message[message.length - 1].status !== "seen"
      ) {
        dispatch({
          type: "UPDATE",
          payload: {
            id: currentfriend._id,
          },
        });
        socket.current.emit("seen", {
          senderId: currentfriend._id,
          reseverId: myInfo.id,
        });
        dispatch(seenMessage({ _id: message[message.length - 1]._id }));
      }
    }
    dispatch({
      type: "MESSAGE_GET_SUCCESS_CLEAR",
    });
  }, [message_get_success]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  useEffect(() => {
    dispatch(getTheme());
  }, []);

  return (
    <div className={themeMood === "dark" ? "messenger theme" : "messenger"}>
      <Toaster
        position={"top-right"}
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: "18px",
          },
        }}
      />
      <div className="row">
        <LeftSide
          myInfo={myInfo}
          friends={friends}
          currentfriend={currentfriend}
          activeUser={activeUser}
          setCurrentFriend={setCurrentFriend}
          socket={socket}
          currentPage="MessagePage"
        />

        <RightSide
          currentfriend={currentfriend}
          activeUser={activeUser}
          newMessage={newMessage}
          setNewMessage
          message={message}
          scrollRef={scrollRef}
          typingMessage={typingMessage}
          myInfo={myInfo}
          socket={socket}
          currentPage="MessagePage"
        />
      </div>
    </div>
  );
};

export default Messages;
