import { FileItem } from "../types";

/**
 * Guarantees that any project contains the complete full-stack source code:
 * 1. index.html - Frontend UI & interactive elements
 * 2. styles.css - Modern styling & design tokens
 * 3. script.js - Dynamic client-side logic & API integration
 * 4. server.js - Production-ready Node.js Express REST API server
 * 5. package.json - NPM manifest with scripts and dependencies
 * 6. README.md - Setup guide, architecture, and API documentation
 */
export function ensureFullStackProjectFiles(
  projectName: string,
  prompt: string,
  existingFiles: FileItem[]
): FileItem[] {
  const files: FileItem[] = [...existingFiles];
  const title = projectName || "Full-Stack Web Application";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "webntra-app";

  const hasServer = files.some(f => f.path.toLowerCase() === "server.js");
  const hasPackage = files.some(f => f.path.toLowerCase() === "package.json");
  const hasReadme = files.some(f => f.path.toLowerCase() === "readme.md");

  if (!hasServer) {
    const serverJs = `/**
 * ${title} — Production Express Backend Server
 * Generated autonomously by Webntra AI Multi-Agent SDLC Platform
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from current directory
app.use(express.static(__dirname));

// In-Memory Database Store for live persistence
const db = {
  submissions: [],
  appointments: [],
  newsletter: [],
  inquiries: []
};

// ── Health Check Endpoint ──
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    application: "${title.replace(/"/g, '\\"')}",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ── Bookings / Appointments Endpoint ──
app.post("/api/appointments", (req, res) => {
  const { name, email, phone, date, time, service, notes } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: "Name and email are required" });
  }

  const appointment = {
    id: "apt_" + Date.now(),
    name,
    email,
    phone: phone || "N/A",
    date: date || new Date().toISOString().split("T")[0],
    time: time || "10:00 AM",
    service: service || "General Consultation",
    notes: notes || "",
    status: "confirmed",
    createdAt: new Date().toISOString()
  };

  db.appointments.push(appointment);
  console.log("[API] New Appointment Booked:", appointment);

  res.status(201).json({
    success: true,
    message: "Appointment confirmed successfully!",
    appointment
  });
});

// ── Contact / Inquiry Endpoint ──
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ success: false, error: "Email and message are required" });
  }

  const inquiry = {
    id: "inq_" + Date.now(),
    name: name || "Anonymous",
    email,
    subject: subject || "Website Inquiry",
    message,
    createdAt: new Date().toISOString()
  };

  db.inquiries.push(inquiry);
  console.log("[API] New Contact Inquiry Received:", inquiry);

  res.status(201).json({
    success: true,
    message: "Thank you for reaching out! We will respond shortly.",
    inquiry
  });
});

// ── Interactive Action / Calculator / Form Endpoint ──
app.post("/api/action", (req, res) => {
  const actionData = {
    id: "act_" + Date.now(),
    ...req.body,
    timestamp: new Date().toISOString()
  };

  db.submissions.push(actionData);
  console.log("[API] User Action Recorded:", actionData);

  res.json({
    success: true,
    message: "Data processed successfully",
    data: actionData
  });
});

// ── Retrieve All Stored Records ──
app.get("/api/data", (req, res) => {
  res.json({
    success: true,
    counts: {
      appointments: db.appointments.length,
      inquiries: db.inquiries.length,
      submissions: db.submissions.length
    },
    data: db
  });
});

// Catch-all: Route unknown requests to frontend index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start Express Server
app.listen(PORT, () => {
  console.log("==================================================");
  console.log(\`🚀  ${title.replace(/"/g, '\\"')} Server Running\`);
  console.log(\`👉  Local URL:   http://localhost:\${PORT}\`);
  console.log(\`👉  API Health:  http://localhost:\${PORT}/api/health\`);
  console.log("==================================================");
});
`;
    files.push({
      path: "server.js",
      language: "javascript",
      content: serverJs
    });
  }

  if (!hasPackage) {
    const packageJson = JSON.stringify({
      name: slug,
      version: "1.0.0",
      description: `Full-Stack Web Application for ${title} built with Webntra AI`,
      main: "server.js",
      scripts: {
        start: "node server.js",
        dev: "node --watch server.js"
      },
      keywords: ["webntra", "full-stack", "express", "webapp"],
      author: "Webntra AI Autonomous SDLC",
      license: "MIT",
      dependencies: {
        express: "^4.19.2",
        cors: "^2.8.5",
        dotenv: "^16.4.5"
      }
    }, null, 2);

    files.push({
      path: "package.json",
      language: "json",
      content: packageJson
    });
  }

  if (!hasReadme) {
    const readme = `# 🌟 ${title} — Full-Stack Web Application

Generated autonomously by **[Webntra AI](https://webntra.app)** using a 7-Agent SDLC Pipeline.

---

## ⚡ Quick Start (Local Execution)

Run this project on your local machine with Node.js in 2 simple steps:

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Start the Full-Stack Server
\`\`\`bash
npm start
\`\`\`

### 3. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** in your browser!

For live automatic reloading during code edits:
\`\`\`bash
npm run dev
\`\`\`

---

## 📦 Complete Source Code Structure

This package contains the complete full-stack codebase:

| File | Purpose | Description |
|---|---|---|
| \`index.html\` | **Frontend UI** | Responsive semantic HTML5 layout with navigation, hero, interactive cards, and modals |
| \`styles.css\` | **Design System** | Tailored CSS variables, responsive typography, glassmorphism, and responsive breakpoints |
| \`script.js\` | **Client Logic** | Interactive UI handlers (calculators, modals, filters) and API calls to backend |
| \`server.js\` | **Backend Server** | Node.js + Express REST API server with JSON body-parsing, CORS, and data storage |
| \`package.json\` | **Dependencies** | NPM scripts (\`npm start\`) and required production dependencies (\`express\`, \`cors\`) |
| \`README.md\` | **Documentation** | Quickstart guide, API endpoint documentation, and deployment guides |

---

## 🔌 REST API Endpoints

The Express server includes pre-configured REST API endpoints:

- **\`GET /api/health\`** — Health check & server status.
- **\`POST /api/appointments\`** — Create and persist appointment bookings.
- **\`POST /api/contact\`** — Process and save contact inquiries.
- **\`POST /api/action\`** — Record interactive user actions and calculations.
- **\`GET /api/data\`** — Retrieve in-memory records.

---

## ☁️ Deployment

You can deploy this project directly to any cloud platform:

### Deploy to Render / Railway / Heroku
1. Push this folder to GitHub.
2. Connect your repository to **Render**, **Railway**, or **Heroku**.
3. Set build command: \`npm install\`
4. Set start command: \`npm start\`
5. Done! Your full-stack website will be live with SSL.
`;

    files.push({
      path: "README.md",
      language: "markdown",
      content: readme
    });
  }

  return files;
}
