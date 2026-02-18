#  Voxhealth

**Live Demo:** 👉 https://frontend-for-voxhealth.vercel.app/

An AI-powered clinical voice diagnostic web application that transforms patient voice recordings into structured diagnostic insights using AI models and Firebase-backed persistence.

---

## 🚀 Overview

Voxhealth is a web-based AI health companion that allows users to:

- 🎙 Record voice descriptions of symptoms  
- 🤖 Receive adaptive AI-generated clinical questions  
- 📊 Get structured diagnostic insights  
- 📚 View and manage previous diagnostic sessions  

The platform streamlines preliminary clinical reasoning through natural voice interaction.

---

## 🎯 Key Features

### 🗣 Voice-First Interaction
Users describe their symptoms through a built-in voice recorder. The system processes and analyzes the recording for structured insights.

### 🤖 AI-Driven Diagnostic Workflow
Adaptive follow-up questions are generated based on the initial input. The AI evaluates both audio and questionnaire responses.

### 📚 Scan History Dashboard
Previous sessions are stored securely in Firebase and can be viewed or deleted anytime.

### 🔐 Firebase Integration
- Authentication
- Secure data storage
- Real-time updates

### 🌙 Theme Support
Light and dark mode support with persistent user preference.

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Localization | i18next |
| Backend Services | Firebase Auth + Firestore |
| AI Integration | Gemini API |
| Deployment | Vercel |

---

## 📂 Project Structure

```
Voxhealth/
│
├── components/       # Reusable UI components
├── services/         # Firebase + AI integrations
├── types.ts          # Shared TypeScript types
├── App.tsx           # Main application component
├── index.tsx         # React entry point
├── i18n.ts           # Localization configuration
├── package.json
└── README.md
```

---

## 🛠 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/skyy-07/Voxhealth.git
cd Voxhealth
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4️⃣ Run the App

```bash
npm run dev
```

---

## 📌 Usage

1. Open the deployed app or local server.
2. Click **Record** and describe your symptoms.
3. Answer the AI-generated follow-up questions.
4. View your structured diagnostic insights.
5. Access previous scans in the **History** section.

---

## 🚀 Deployment

The application is deployed on Vercel for fast and scalable hosting.

Live App:  
https://frontend-for-voxhealth.vercel.app/

---

## 🔐 Security & Privacy

- Authentication via Firebase
- Secure Firestore data storage
- Protected user-specific scan records

---

## 🤝 Contributing

Contributions are welcome!

You can:
- Improve AI prompting logic
- Enhance UI/UX
- Add new features
- Improve performance
- Add testing & CI/CD

Fork the repository and submit a pull request 🚀

---

## 📄 License

Add your preferred license (e.g., MIT License).

---

## 🏷 Tags

`react` `typescript` `firebase` `ai` `voice` `healthcare` `diagnostics` `vercel`
