import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import Payment from "./payment";
import ZoomMeeting from "./meeting";
function App() {
  const [messages, setMessages] = useState("");
  const [Roomid, setRoomid] = useState("");
  const [socketid, setSocketid] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(true);
  useEffect(() => {
    const token = Cookies.get("token");
    console.log(token);
    if (!token) {
      setIsAuthorized(false);
    }
  }, []);
  const handlesubmit = (e) => {
    e.preventDefault();
    const messageData = { messages, Roomid, senderid: socketid };
    setMessagesList((messagesList) => [
      ...messagesList,
      { messages, senderid: socketid },
    ]);
    socket.emit("messages", messageData);
    setMessages("");
  };

  const socket = useMemo(
    () => io("http://localhost:3000", { withCredentials: true }),
    []
  );

  useEffect(() => {
    if (!isAuthorized) return;
    socket.on("connect", () => {
      setSocketid(socket.id);
    });

    socket.on("recieve-messages", ({ Roomid, messages, senderid }) => {
      setMessagesList((messagesList) => [
        ...messagesList,
        { messages, senderid },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthorized]);
  // if (!isAuthorized) {
  //   return (
  //     <div className="container">
  //       <h2>Unauthorized: Please log in</h2>
  //     </div>
  //   );
  // }
  return (
    <div className="container">
      <div className="header">
        <h2>MR...N...MRS..CHATIX</h2>
        <p>Socket ID: {socketid}</p>
      </div>
      <div className="messages">
        {messagesList.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.senderid === socketid ? "you" : "other"
            }`}
          >
            <span>
              {message.senderid === socketid ? "You" : message.senderid}:
            </span>
            {message.messages}
          </div>
        ))}
      </div>
      <form className="message-input" onSubmit={handlesubmit}>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={Roomid}
          onChange={(e) => setRoomid(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter your message"
          value={messages}
          onChange={(e) => setMessages(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <Payment />
      <ZoomMeeting />
    </div>
  );
}

export default App;
