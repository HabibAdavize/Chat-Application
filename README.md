# Chat Application

Welcome to the **Chat Application**—a real-time messaging platform built with ReactJS! This project was developed to showcase modern web development practices, focusing on a seamless user experience with real-time communication.

## 🛠 Features

- **Real-time Messaging:** Send and receive messages instantly with no delays.
- **User Authentication:** Secure sign-up and login using Firebase Authentication.
- **Private Chat:** Engage in one-on-one or group conversations, with message history stored for future reference.
- **Profile Management:** Users can view and update their profiles, including changing profile pictures.
- **Message Notifications:** Get notified of new messages and keep track of unread conversations.
- **Responsive Design:** The app is optimized for use on both desktop and mobile devices.

## 🚀 Technologies Used

- **ReactJS**: A JavaScript library for building user interfaces.
- **Firebase**: Backend services including Authentication, Firestore, and Storage.
- **SCSS**: A utility-first CSS framework for fast UI development.
- **React Router**: A tool for managing navigation in React applications.

## 📦 Installation

Follow these steps to set up and run the project locally on your machine.

### Prerequisites

- **Node.js**: Make sure you have Node.js installed on your machine.
- **Firebase Account**: You'll need a Firebase project for authentication, Firestore, and storage.

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/HabibAdavize/chat-application.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd real-time-chat-app
   ```

3. **Install the dependencies:**

   ```bash
   npm install
   ```

4. **Set up Firebase:**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password), **Firestore**, and **Storage**.
   - Copy your Firebase configuration details and create a `.env` file in the root of your project:

   ```bash
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server:**

   ```bash
   npm start
   ```

   The app will now be running at `http://localhost:3000`.

## 🎮 Usage

1. **Sign Up or Log In:** Create an account or log in using your email and password.
2. **Start Chatting:** Select a user to start a conversation or create a new group chat.
3. **Manage Profile:** Click on your profile picture or name to view and edit your profile.
4. **Notifications:** Stay on top of new messages with the notification system.
5. **Mobile Friendly:** Access the app on any device with responsive design.

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

Please make sure your code adheres to the existing code style and that all tests pass.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 📧 Contact

If you have any questions, issues, or suggestions, feel free to reach out!

- **GitHub Issues:** Use the [Issues](https://github.com/HabibAdavize/react-chat-app/issues) tab to report bugs or request features.
- **Email:** [habibadavize94@gmail.com](mailto:habibadavize94@gmail.com)

## 🎉 Acknowledgements

- **ReactJS**: For making front-end development so much fun.
- **Firebase**: For providing an all-in-one backend solution.
- **SCSS**: For the rapid and responsive design development.
- **Open Source Community**: For the inspiration and resources.

---

Thanks for checking out the Chat App! Happy coding! 🚀
