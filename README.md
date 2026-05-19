# DISHA — mammo-client

> **Doctor-Facing Diagnostic Portal**
>
> mammo-client is the web application used by radiologists and doctors at each hospital. Doctors upload mammogram images, receive an AI-powered risk assessment in under 2 seconds, view diagnostic reports, and track their scan history — all from a clean, professional clinical interface.

---

## What Does This Do?

mammo-client is the **front door of the DISHA system for doctors**. It handles everything a clinician needs day-to-day:

- **Upload** a mammogram image
- **Get an instant AI prediction** — Benign or Malignant, with confidence percentage
- **View a heatmap** showing exactly which region of the mammogram the AI focused on
- **Generate a clinical report** with patient ID, findings, and recommendations
- **Review scan history** across all previous cases
- **Monitor** the local AI model's training status and accuracy

It connects directly to the local `mammo-server` for predictions and training, and links through `mammo-global` for the hospital's FL participation.

---

## System Flow

```
Doctor opens mammo-client
         │
         ▼
┌─────────────────────────────────────────┐
│         Landing Page / Login            │
│  • Login with email + password          │
│  • Register with hospital name          │
│  • Hospital auto-registered in          │
│    mammo-global on first signup         │
└───────────────────┬─────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Doctor Dashboard              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Upload Mammogram               │   │
│  │  • Drag & drop or browse        │   │
│  │  • Supports JPG, PNG, DICOM     │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │  AI Prediction (mammo-server)   │   │
│  │  • Benign / Malignant result    │   │
│  │  • Confidence percentage        │   │
│  │  • Radial gauge visualization   │   │
│  │  • Risk badge (Low/High)        │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │  Diagnostic Heatmap             │   │
│  │  • Grad-CAM overlay             │   │
│  │  • Shows AI's region of focus   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   Scan History          Clinical Report
   (all past cases)      (PDF-ready)
```

---

## Technology Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | Full-stack React framework |
| **React 18** | Component-based clinical UI |
| **MongoDB Atlas** | Stores doctors, scan history, and predictions |
| **Mongoose** | Database schema definitions |
| **bcryptjs** | Secure password hashing for doctor accounts |
| **jsonwebtoken** | Session authentication |
| **axios** | API requests to mammo-server and mammo-global |
| **react-dropzone** | Drag-and-drop image upload interface |
| **react-hot-toast** | Clinical-grade alert notifications |

---

## Features

### 1. Doctor Authentication
- **Register** with full name, email, password, and hospital name
- **Login** using email and password
- On first registration, the hospital is automatically registered in `mammo-global` as a participating FL node
- Passwords stored with bcrypt (cost factor 10)
- Session stored securely in browser (JWT)

### 2. Mammogram Upload & AI Prediction
- Drag-and-drop or browse to upload a mammogram image (JPG/PNG)
- Image is sent to the local `mammo-server` for inference
- Result returned in under 2 seconds:
  - **Prediction:** Benign or Malignant
  - **Confidence:** Percentage certainty
  - **Benign probability** and **Malignant probability** as separate values
- Auto-generates a unique **Patient Record ID** for each scan

### 3. Radial Gauge & Risk Badge
- Visual radial gauge displays the confidence score in an intuitive arc
- **Risk Badge** colour-codes the result:
  - Green — Benign (Low Risk)
  - Red — Malignant (High Risk)
- Makes the result immediately readable without reading numbers

### 4. Diagnostic Heatmap (Grad-CAM)
- After prediction, a heatmap overlay is generated via `mammo-server`
- Uses **Grad-CAM** (Gradient-weighted Class Activation Mapping) to highlight the exact region of the mammogram the AI used to make its decision
- Gives doctors visual explainability — they can see *why* the AI made its call
- Displayed as a semi-transparent colour overlay on the original image

### 5. Clinical Report Generation
- Generates a structured single-page clinical report including:
  - Hospital name and doctor details
  - Patient Record ID (auto-generated)
  - Date and time of scan
  - AI findings: prediction, confidence, risk level
  - Standardised clinical recommendation text
  - Privacy statement (data never stored externally)
- Report is print-ready and PDF-exportable

### 6. Scan History
- All scans are automatically saved after confirmation
- History page shows a searchable, sortable table of all past cases
- Each record includes patient ID, result, confidence, image name, and date
- Doctors can review past cases and track patient outcomes

### 7. FL Training Status Monitor
- Dashboard shows the live status of the local `mammo-server`
- Displays current model accuracy, total training rounds, and validation metrics
- Indicates whether the AI backend is **Online** or **Offline**
- Keeps doctors informed about the quality of their local AI model

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Create a new doctor account |
| `POST` | `/api/auth/login` | None | Login and receive JWT |
| `POST` | `/api/predict` | JWT | Send image to mammo-server, get prediction |
| `POST` | `/api/predict-heatmap` | JWT | Generate Grad-CAM heatmap for an image |
| `POST` | `/api/confirm-scan` | JWT | Save a completed scan to history |
| `GET` | `/api/history` | JWT | Retrieve all past scans for the logged-in doctor |

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with login and registration |
| `/dashboard` | Main clinical workspace — upload, predict, view result |
| `/history` | Full scan history table |
| `/reports` | Clinical report generation and print view |
| `/scan` | Dedicated scan submission page |
| `/help` | User guide and platform documentation |

---

## Database Models

### Doctor
```typescript
{
  name:         string,   // "Dr. Sankalp Ramteke"
  email:        string,   // "sankalp@aiims.ac.in"
  password:     string,   // bcrypt hash
  hospitalName: string,   // "AIIMS Nagpur"
  createdAt:    Date
}
```

### Scan History Record
```typescript
{
  doctorId:       string,   // links to Doctor
  patientId:      string,   // auto-generated "PAT-XXXX"
  imageName:      string,   // original filename
  result:         string,   // "Benign" | "Malignant"
  confidence:     string,   // "94.7%"
  benignProb:     string,   // "5.3%"
  malignantProb:  string,   // "94.7%"
  date:           Date
}
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- `mammo-server` running locally on port 8000 (for predictions)
- `mammo-global` running on port 3001 (for FL coordination)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev   # Runs on http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string for mammo-client database |
| `JWT_SECRET` | Yes | Secret key for signing doctor session tokens |
| `MAMMO_SERVER_URL` | No | Local AI server URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_GLOBAL_URL` | No | mammo-global URL for FL status display |

---

## How It Connects to the Wider DISHA System

```
mammo-client (doctor portal)
       │
       ├── POST /api/predict ──────────────→ mammo-server :8000
       │                                     (local AI inference)
       │
       ├── POST /api/predict-heatmap ──────→ mammo-server :8000
       │                                     (Grad-CAM generation)
       │
       └── Auto-register hospital ─────────→ mammo-global :3001
           on doctor signup                  (FL network enrollment)
```

When a doctor **registers**, their hospital name is sent to `mammo-global`, enrolling it as a participating Federated Learning node. This means the hospital will appear on the global admin dashboard and can contribute to improving the shared AI model — without ever sharing patient data.

---

## Privacy & Compliance

| What | How |
|---|---|
| **Patient images** | Processed entirely on the hospital's local `mammo-server`. Never sent to any cloud or external server. |
| **Scan results** | Stored only in the hospital's own MongoDB database. |
| **FL participation** | Only mathematical weight updates (not images) are sent to `mammo-global`. |
| **Doctor passwords** | Stored as bcrypt hashes. Never readable, even by administrators. |
| **Patient IDs** | Auto-generated codes (`PAT-XXXX`). No real names stored in scan records. |

---

## Frequently Asked Questions

**Q: Does the AI send mammogram images anywhere outside the hospital?**
> No. The image goes from the doctor's browser to `mammo-server`, which runs on the hospital's own machine. The result (a prediction number) comes back. The image itself never leaves the hospital network.

**Q: What is the AI model's accuracy?**
> The ResNet50 model was validated on the CBIS-DDSM dataset with **92.1% accuracy** on 10,556 mammogram images. Accuracy continues to improve with each Federated Learning round as more hospitals contribute.

**Q: What does the heatmap actually show?**
> It shows which pixels of the mammogram most strongly influenced the AI's prediction, using a technique called Grad-CAM. Warm colours (red/yellow) indicate high influence. This helps doctors understand the AI's reasoning and identify the region of concern.

**Q: What happens if mammo-server is offline?**
> The dashboard shows "Backend Offline" status. Predictions cannot be made until the local server is restarted. Scan history and reports remain fully accessible.

**Q: Can two doctors from the same hospital share scan history?**
> Currently, scan history is per-doctor (linked by `doctorId`). Each doctor sees only their own cases. Multi-doctor shared records can be enabled by updating the history query to filter by `hospitalName` instead.
