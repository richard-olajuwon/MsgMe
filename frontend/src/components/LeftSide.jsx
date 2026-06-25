import { useState } from "react";
import { useDispatch } from "react-redux";
import { BiSearch } from "react-icons/bi";
import { BsThreeDots } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { themeSet } from "../store/actions/messengerAction";
import Friends from "./Friends";
import { userLogout } from "../store/actions/authAction";

const LeftSide = ({
  myInfo,
  friends,
  currentfriend,
  activeUser,
  setCurrentFriend,
  socket,
  currentPage="HomePage",
}) => {
  const dispatch = useDispatch();

  const [hide, setHide] = useState(true);

  const search = (e) => {
    const getFriendClass = document.getElementsByClassName("hover-friend");
    const frienNameClass = document.getElementsByClassName("Fd_name");
    for (var i = 0; i < getFriendClass.length, i < frienNameClass.length; i++) {
      let text = frienNameClass[i].innerText.toLowerCase();
      if (text.indexOf(e.target.value.toLowerCase()) > -1) {
        getFriendClass[i].style.display = "";
      } else {
        getFriendClass[i].style.display = "none";
      }
    }
  };

  const logout = () => {
    dispatch(userLogout());
    socket.current.emit("logout", myInfo.id);
  };

  return (
    <div
      className="col-3"
      style={{
        display:
          window.innerWidth < 600 ? (currentPage === "HomePage" ? "block" : "none") : "block",
      }}
    >
      <div className="left-side">
        <div className="top">
          <div className="image-name">
            <div className="image">
              <img src={`${myInfo.image}`} alt="" />
            </div>
            <div className="name">
              <h3>{myInfo.userName}</h3>
            </div>
          </div>
          <div className="icons">
            <div onClick={() => setHide(!hide)} className="icon">
              <BsThreeDots />
            </div>
            <div className="icon">
              <FaEdit />
            </div>
            <div className={hide ? "theme_logout" : "theme_logout show"}>
              <h3>Dark Mode</h3>
              <div className="on">
                <label htmlFor="dark">ON</label>
                <input
                  onChange={(e) => dispatch(themeSet(e.target.value))}
                  value="dark"
                  type="radio"
                  name="theme"
                  id="dark"
                />
              </div>

              <div className="of">
                <label htmlFor="white">OFF</label>
                <input
                  onChange={(e) => dispatch(themeSet(e.target.value))}
                  value="white"
                  type="radio"
                  name="theme"
                  id="white"
                />
              </div>
              <div onClick={logout} className="logout">
                <IoLogOutOutline />
                Logout
              </div>
            </div>
          </div>
        </div>
        <div className="friend-search">
          <div className="search">
            <button>
              <BiSearch />
            </button>
            <input
              onChange={search}
              type="text"
              placeholder="search"
              className="form-control"
            />
          </div>
        </div>

        <div className="friends">
          {friends && friends.length > 0
            ? friends.map((fd, index) => (
                <div
                  key={index}
                  className={
                    currentfriend._id === fd.fndInfo._id
                      ? "hover-friend active"
                      : "hover-friend"
                  }
                >
                  <Friends
                    activeUser={activeUser}
                    myId={myInfo.id}
                    friend={fd}
                  />
                </div>
              ))
            : "no friend"}
        </div>
      </div>
    </div>
  );
};

export default LeftSide;
