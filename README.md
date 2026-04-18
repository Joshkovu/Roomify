# 🏠 Roomify

<div align="center">

AI-first floor plan visualization app that turns 2D plans into realistic top-down 3D renders.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## ✨ Overview

Roomify helps you:
- Upload a 2D floor plan (PNG/JPG)
- Generate an AI-rendered, top-down 3D visualization
- Compare before/after with a split slider
- Export the generated image
- Persist projects using Puter worker APIs

---

## 🧩 Core Features

- **AI rendering pipeline** using `@heyputer/puter.js`
- **Floor plan upload** with size/type validation
- **Project persistence** (`save`, `list`, `get`) through worker endpoints
- **Hosted asset flow** for source/render images
- **Comparison mode** with `react-compare-slider`
- **SPA deployment-ready** (React Router `ssr: false`)

---

## 🛠️ Tech Stack

- **Frontend:** React 19, React Router 7, TypeScript
- **Build tool:** Vite 8
- **Styling:** Tailwind CSS 4 + custom CSS
- **Icons/UI:** Lucide React
- **AI/Auth/Storage/Worker integration:** Puter SDK (`@heyputer/puter.js`)
- **Deployment config included:** Netlify + Docker

---

## 📁 Project Structure

```text
app/
  routes/
    home.tsx             # Landing + upload + project list
    visualizer.$id.tsx   # Render workspace + compare + export
  root.tsx               # App shell + auth context
lib/
  ai.action.ts           # AI generation logic
  puter.action.ts        # Auth + project API calls
  puter.hosting.ts       # Hosting/upload helpers
  puter.worker.js        # Worker routes (save/list/get)
  constants.ts           # Shared constants/prompts
components/
  Upload.tsx
  Navbar.tsx
  Button.tsx
```

---

## 🚀 Getting Started

### 1) Prerequisites

- Node.js **20+**
- npm or pnpm

### 2) Install

```bash
npm install
```

### 3) Environment

Create a `.env` file in the project root:

```bash
VITE_PUTER_WORKER_URL=<your-worker-base-url>
```

### 4) Run locally

```bash
npm run dev
```

App runs at: `http://localhost:5173`

---

## 📜 Available Scripts

```bash
npm run dev        # Start local dev server
npm run build      # Build production assets
npm run start      # Serve production build
npm run typecheck  # Generate route types + TypeScript check
```

---

## 🧠 How Rendering Works

1. User uploads a floor plan image
2. Image is normalized to a data URL when needed
3. `generate3DView` sends prompt + image to Puter AI (`txt2img`)
4. Rendered image is persisted via worker endpoint
5. Visualizer displays output and before/after comparison

---

## 🌐 Deployment

### Netlify

The repository already includes `netlify.toml`:
- Build command: `pnpm run build`
- Publish directory: `build/client`
- SPA fallback redirects configured

### Docker

A multi-stage `Dockerfile` is included.

```bash
docker build -t roomify .
docker run -p 3000:3000 roomify
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run typecheck` and `npm run build`
5. Open a pull request

---

## 📌 Notes

- `VITE_PUTER_WORKER_URL` is required for project save/list/get operations.
- Supported upload types and max file size are defined in `lib/constants.ts` (`ACCEPTED_FILE_TYPES`, `MAX_UPLOAD_SIZE` currently set to 50MB).

---

# 🙌 Appreciation

If you appreciate this project and my work, feel free to connect with me on my socials:

<a href="https://x.com/JoashKutee80790"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&amp;logo=twitter&amp;logoColor=white"></a>
<a href="https://www.linkedin.com/in/joshkovu/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&amp;logo=linkedin&amp;logoColor=white"></a>
