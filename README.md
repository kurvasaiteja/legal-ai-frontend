# Legal AI - Contract Analysis Frontend ⚖️

Welcome to the frontend repository for the **Legal AI SaaS**. This is a modern, responsive React application designed to provide a seamless interface for uploading legal contracts, identifying risks, and interacting with an AI legal assistant.

The UI is built with **React**, styled with **Tailwind CSS**, and focuses heavily on user experience with features like real-time typewriter effects, toast notifications, and smooth transitions.

## ✨ Key Features

  * **📄 Document Upload:**
      * Clean, drag-and-drop style interface.
      * Handles large PDF uploads with extended timeout settings (up to 5 minutes) to ensure OCR processing finishes.
  * **⚠️ Risk Analysis Dashboard:**
      * Visualizes "High Risk" clauses identified by the backend.
      * Displays the original legal text alongside a simplified AI explanation.
      * **Smart Rewriting:** One-click generation of client-favorable clauses to replace risky text.
  * **💬 Legal Assistant Chat:**
      * Context-aware chatbot that answers questions based specifically on the uploaded document.
      * Polished **Typewriter Effect** for AI responses to simulate natural conversation.
      * Auto-scrolling and loading states for a smooth chat experience.
  * **🎨 Premium UI/UX:**
      * **Toast Notifications:** Custom success/error alerts for user feedback.
      * **Responsive Design:** Fully functional on desktop and mobile (`flex-col` to `md:flex-row`).
      * **Loading Skeletons:** Visual feedback while the AI is thinking.

## 🛠️ Tech Stack

  * **Framework:** React (Vite)
  * **Styling:** Tailwind CSS
  * **Icons:** Heroicons
  * **HTTP Client:** Axios
  * **State Management:** React Hooks (`useState`, `useEffect`, `useRef`)

-----

## 🚀 Getting Started

Follow these instructions to get the frontend running on your local machine.

### 1\. Clone the Repository

```bash
git clone https://github.com/your-username/legal-ai-frontend.git
cd legal-ai-frontend
```

### 2\. Install Dependencies

```bash
npm install
```

### 3\. Configuration

Currently, the application is configured to connect to the live Render backend.

Open `src/App.jsx` and locate the `API_URL` constant:

```javascript
// Default configuration connects to the live backend
const API_URL = "https://legal-ai-backend-6kw0.onrender.com";

// If running the backend locally, change it to:
// const API_URL = "http://localhost:5000";
```

### 4\. Run the Development Server

```bash
npm run dev
```

The application will launch at `http://localhost:5173` (or the port shown in your terminal).

-----

## 🖥️ Usage Guide

1.  **Upload Tab:** Click the upload box to select a PDF contract. Wait for the "Document processed successfully\!" toast.
2.  **Risk Analysis Tab:** Click "Risk Analysis" to scan the document. The AI will list potential pitfalls.
      * *Action:* Click **"Rewrite to be more favorable"** on any risk card to generate a safer clause.
      * *Action:* Click the Copy icon to copy the new text to your clipboard.
3.  **Legal Assistant Tab:** Switch to the chat view to ask specific questions like *"What is the termination notice period?"* or *"Is there an indemnity clause?"*.

-----

## 📂 Project Structure

```text
src/
├── components/       # (Internal components like Toast, Typewriter, Spinner)
├── App.jsx           # Main application logic and routing
├── main.jsx          # Entry point
└── index.css         # Tailwind directives and global styles
```

## 🤝 Contributing

This is the frontend component of a larger Legal AI system. If you'd like to improve the UI, feel free to fork the repo and submit a Pull Request\!

## 📝 License

This project is open-source and available under the MIT License.