import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/navbar";
import UserList from "../components/UserList";
import Preloader from "../components/Preloader";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatUser, setChatUser] = useState(null);
  const { currentUser } = useAuth();
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [conversationStartDate, setConversationStartDate] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [uploadedImage, setUploadedImage] = useState(null);
  const [replyTo, setReplyTo] = useState(null); // State to handle replying to a message
  const [editMessageId, setEditMessageId] = useState(null); // State to handle editing a message

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
              );
            }

            setLoadingMessages(false);
          });

          return () => unsubscribe();
        } catch (error) {
          console.error("Error fetching messages:", error);
          setLoadingMessages(false);
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
        if (editMessageId) {
          // Handle editing an existing message
          await updateDoc(doc(db, `chats/${chatId}/messages`, editMessageId), {
            content: newMessage,
            imageUrl:
              uploadedImage?.type === "image" ? uploadedImage.url : null,
            fileUrl: uploadedImage?.type === "file" ? uploadedImage.url : null,
            fileName: uploadedImage?.name || null,
            edited: true,
          });
          setEditMessageId(null);
        } else {
          // Handle sending a new message
          await addDoc(collection(db, `chats/${chatId}/messages`), {
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            senderProfilePicture: currentUser.photoURL,
            content: newMessage,
            imageUrl:
              uploadedImage?.type === "image" ? uploadedImage.url : null,
            fileUrl: uploadedImage?.type === "file" ? uploadedImage.url : null,
            fileName: uploadedImage?.name || null,
            replyTo: replyTo ? replyTo.id : null, // Include the ID of the message being replied to
            replyToContent: replyTo ? replyTo.content : null, // Include the content of the message being replied to
            timestamp: serverTimestamp(),
          });
        }

        setNewMessage("");
        setUploadedImage(null);
        setReplyTo(null); // Clear the replyTo state after sending a message
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (file.type.startsWith("image/")) {
          setUploadedImage({
            type: "image",
            url: reader.result,
            name: file.name,
          });
        } else {
          setUploadedImage({
            type: "file",
            url: URL.createObjectURL(file),
            name: file.name,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    setNewMessage(` `);
  };

  const handleEdit = (message) => {
    setNewMessage(message.content);
    setEditMessageId(message.id);
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteDoc(doc(db, `chats/${chatId}/messages`, messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
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
                        {message.senderId === currentUser.uid && (
                          <div className="message-actions">
                            <span
                              onClick={() => handleEdit(message)}
                              class="material-symbols-outlined"
                            >
                              edit_note
                            </span>
                            <span
                              onClick={() => handleDelete(message.id)}
                              class="material-symbols-outlined"
                            >
                              delete
                            </span>
                          </div>
                        )}
                      </div>
                      {message.replyTo && (
                        <div className="reply-message">
                          Replying to: {message.replyToContent}
                        </div>
                      )}
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

                      <span
                        onClick={() => handleReply(message)}
                        class="material-symbols-outlined"
                      >
                        reply
                      </span>
                    </li>
                  ))}
                </ul>

                {replyTo && (
                  <div className="replying-to">
                    Replying to: {replyTo.content}
                    <span
                      onClick={() => setReplyTo(null)}
                      class="material-symbols-outlined"
                    >
                      close
                    </span>
                  </div>
                )}

                {uploadedImage && (
                  <div className="uploaded-image-preview">
                    {uploadedImage.type === "image" ? (
                      <div>
                        <img src={uploadedImage.url} alt="Uploaded Preview" />
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
                    <span className="material-symbols-outlined">
                      attachment
                    </span>
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
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
