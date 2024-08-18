import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  doc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/navbar";
import UserList from "../components/UserList";
import Preloader from "../components/Preloader";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const { chatId } = useParams(); // Get chatId from URL
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatUser, setChatUser] = useState(null); // State to store the user data
  const { currentUser } = useAuth();
  const [loadingMessages, setLoadingMessages] = useState(false); // State to handle loading messages
  const [conversationStartDate, setConversationStartDate] = useState(null); // State to store conversation start date
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [uploadedImage, setUploadedImage] = useState(null); // State to store the uploaded image file

  useEffect(() => {
    document.body.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (currentUser && chatId) {
        setLoadingMessages(true);

        try {
          const messagesQuery = query(
            collection(db, `chats/${chatId}/messages`),
            orderBy("timestamp", "asc")
          );
          const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messagesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setMessages(messagesData);

            if (messagesData.length > 0) {
              setConversationStartDate(
                messagesData[messagesData.length - 1].timestamp
              ); // Get the timestamp of the first message
            }

            setLoadingMessages(false);
          });

          const fetchChatUser = async () => {
            const chatDoc = await getDoc(doc(db, "chats", chatId));
            const participants = chatDoc.data()?.participants || [];
            const otherUserId = participants.find(
              (id) => id !== currentUser.uid
            );

            if (otherUserId) {
              const userDoc = await getDoc(doc(db, "users", otherUserId));
              setChatUser(userDoc.data());
            }
          };

          await fetchChatUser();

          return () => unsubscribe();
        } catch (error) {
          console.error("Error fetching messages:", error);
          setLoadingMessages(false); // Ensure loading is turned off on error
        }
      }
    };

    fetchMessages();
  }, [chatId, currentUser]);

  useEffect(() => {
    const chatBox = document.querySelector(".messages");
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() || uploadedImage) {
      try {
        await addDoc(collection(db, `chats/${chatId}/messages`), {
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          senderProfilePicture: currentUser.photoURL,
          content: newMessage,
          imageUrl: uploadedImage?.type === "image" ? uploadedImage.url : null,
          fileUrl: uploadedImage?.type === "file" ? uploadedImage.url : null,
          fileName: uploadedImage?.name || null,
          timestamp: serverTimestamp(),
        });
        setNewMessage("");
        setUploadedImage(null);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (file.type.startsWith("image/")) {
          // Handle image files
          setUploadedImage({
            type: "image",
            url: reader.result, // Set as base64 data URL
            name: file.name,
          });
        } else {
          // Handle other files
          setUploadedImage({
            type: "file",
            url: URL.createObjectURL(file), // Create an object URL
            name: file.name,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="chat-container">
      <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <div className="chat-content">
        <UserList onSelectUser={() => setLoadingMessages(true)} />
        <div className="chat-box">
          {chatId ? (
            loadingMessages ? (
              <Preloader />
            ) : (
              <>
                {conversationStartDate && (
                  <div className="conversation-start-date">
                    Conversation started on{" "}
                    {new Date(
                      conversationStartDate.toDate()
                    ).toLocaleDateString()}
                  </div>
                )}

                <ul className="messages">
                  {messages.map((message) => (
                    <li
                      key={message.id}
                      className={`message ${
                        message.senderId === currentUser.uid
                          ? "current-user"
                          : ""
                      }`}
                    >
                      <div className="message-header">
                        <span className="timestamp">
                          {new Date(
                            message.timestamp?.toDate()
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="message-content">
                        {message.imageUrl && (
                          <div className="message-image">
                            <a
                              href={message.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={message.imageUrl}
                                alt="Message Attachment"
                              />
                            </a>
                          </div>
                        )}
                        {message.fileUrl && (
                          <div className="message-file">
                            <a
                              href={message.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {message.fileName}
                            </a>
                          </div>
                        )}
                        {message.content}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Display the uploaded image */}
                {uploadedImage && (
                  <div className="uploaded-image-preview">
                    {uploadedImage.type === "image" ? (
                      <div>
                        <img
                          src={uploadedImage.url}
                          alt="Uploaded Preview"
                        />
                        <button onClick={() => setUploadedImage(null)}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span>{uploadedImage.name}</span>
                        <button onClick={() => setUploadedImage(null)}>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="message-input">
                  <input
                    type="file"
                    id="file-upload"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="file-upload" className="file-upload-icon">
                    <span class="material-symbols-outlined">attachment</span>
                  </label>

                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    required
                  />

                  <button onClick={handleSendMessage}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 664 663"
                    >
                      <path
                        fill="none"
                        d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
                      ></path>
                      <path
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        stroke-width="33.67"
                        stroke="#6c6c6c"
                        d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
                      ></path>
                    </svg>
                  </button>
                </div>
              </>
            )
          ) : (
            <div className="welcome-message">
              <h2>Welcome, {currentUser?.displayName || "User"}!</h2>
              <p>
                Please click on the toggle left/above
                <span className="material-symbols-outlined">
                  arrow_drop_down_circle
                </span>
                to select a chat to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
