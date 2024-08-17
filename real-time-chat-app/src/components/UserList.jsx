import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import Chat from "../assets/animations/chat.json";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs
        .map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.uid !== currentUser?.uid);

      setUsers(usersData);
    });

    const unsubscribeMessages = onSnapshot(
      collection(db, "chats"),
      (snapshot) => {
        const messagesData = {};
        snapshot.docs.forEach((chatDoc) => {
          const chatId = chatDoc.id;
          const chatData = chatDoc.data();

          // Check if the current user is a participant in the chat
          if (chatData.participants.includes(currentUser.uid)) {
            const messagesQuery = query(
              collection(db, `chats/${chatId}/messages`),
              orderBy("timestamp", "desc"),
              limit(1) // Limit to only the most recent message
            );

            onSnapshot(messagesQuery, (messagesSnapshot) => {
              const chatMessages = messagesSnapshot.docs.map((doc) => ({
                ...doc.data(),
                chatId,
              }));

              chatData.participants.forEach((participantId) => {
                // Only store messages for the current user
                if (participantId === currentUser.uid) {
                  messagesData[
                    chatData.participants.find((uid) => uid !== currentUser.uid)
                  ] = chatMessages;
                }
              });

              setMessages((prevMessages) => ({
                ...prevMessages,
                ...messagesData,
              }));
            });
          }
        });
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeMessages();
    };
  }, [currentUser?.uid]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const startPrivateChat = async (user1, user2) => {
    try {
      if (!user1.uid || !user2.uid) {
        throw new Error("User IDs are undefined or empty");
      }

      const chatQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user1.uid)
      );

      const chatSnapshot = await getDocs(chatQuery);
      let chatId = "";

      chatSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(user2.uid)) {
          chatId = doc.id;
        }
      });

      if (!chatId) {
        const chatRef = await addDoc(collection(db, "chats"), {
          participants: [user1.uid, user2.uid],
        });
        chatId = chatRef.id;
      }

      navigate(`/chat/${chatId}`);
      setIsUserListVisible(false);
    } catch (error) {
      console.error("Error starting private chat:", error);
    }
  };

  const toggleUserList = () => {
    setIsUserListVisible(!isUserListVisible);
  };

  // Filter and sort users by the latest unread message first and the latest message timestamp
  const filteredUsers = users
    .filter((user) =>
      user.userName
        ? user.userName.toLowerCase().includes(searchTerm.toLowerCase())
        : false
    )
    .sort((a, b) => {
      const aLastMessage = messages[a.uid]?.[0]?.timestamp || 0;
      const bLastMessage = messages[b.uid]?.[0]?.timestamp || 0;

      const aHasUnread = messages[a.uid]?.some(
        (msg) => msg.senderId !== currentUser.uid && msg.read === false
      );
      const bHasUnread = messages[b.uid]?.some(
        (msg) => msg.senderId !== currentUser.uid && msg.read === false
      );

      if (aHasUnread && !bHasUnread) return -1;
      if (!aHasUnread && bHasUnread) return 1;

      return bLastMessage - aLastMessage;
    });

  return (
    <>
      <div className="user-list-toggle">
        <span onClick={toggleUserList} class="material-symbols-outlined">arrow_drop_down_circle</span>
      </div>
      <div className={`user-list ${isUserListVisible ? "visible" : "hidden"}`}>
        <h2>Users</h2>
        <input
          type="text"
          placeholder="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredUsers.length === 0 ? (
            <li>User not found</li>
          ) : (
            filteredUsers.map((user) => (
              <li
                key={user.uid}
                onClick={() => startPrivateChat(currentUser, user)}
              >
                <img
                  src={user.profilePicture}
                  alt={`${user.userName}'s profile`}
                />
                <span>{user.userName}</span>
                {messages[user.uid]?.some(
                  (msg) =>
                    msg.senderId !== currentUser.uid && msg.read === false
                ) && <span className="new-message-indicator">New</span>}
                <ul className="msg-highlight">
                  {messages[user.uid] && messages[user.uid].length > 0 && (
                    <li
                      key={messages[user.uid][0].id}
                      style={{
                        fontWeight:
                          messages[user.uid][0].senderId !== currentUser.uid &&
                          messages[user.uid][0].read === false
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {messages[user.uid][0].content.length > 1
                        ? `${messages[user.uid][0].content.substring(0, 20)}...`
                        : messages[user.uid][0].content}
                    </li>
                  )}
                </ul>
                <Lottie
                  animationData={Chat}
                  loop={true}
                  autoplay={true}
                  style={{ width: 24, height: 24 }}
                />
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="user-list desk">
        <h2>Users</h2>
        <input
          type="text"
          placeholder="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredUsers.length === 0 ? (
            <li>User not found</li>
          ) : (
            filteredUsers.map((user) => (
              <li
                key={user.uid}
                onClick={() => startPrivateChat(currentUser, user)}
              >
                <img
                  src={user.profilePicture}
                  alt={`${user.userName}'s profile`}
                />
                <span>{user.userName}</span>
                {messages[user.uid]?.some(
                  (msg) =>
                    msg.senderId !== currentUser.uid && msg.read === false
                ) && <span className="new-message-indicator">New</span>}
                <ul className="msg-highlight">
                  {messages[user.uid] && messages[user.uid].length > 0 && (
                    <li
                      key={messages[user.uid][0].id}
                      style={{
                        fontWeight:
                          messages[user.uid][0].senderId !== currentUser.uid &&
                          messages[user.uid][0].read === false
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {messages[user.uid][0].content.length > 1
                        ? `${messages[user.uid][0].content.substring(0, 5)}...`
                        : messages[user.uid][0].content}
                    </li>
                  )}
                </ul>
                <Lottie
                  animationData={Chat}
                  loop={true}
                  autoplay={true}
                  style={{ width: 24, height: 24 }}
                />
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
};

export default UserList;
