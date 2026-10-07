# BeyondSend — Omnichannel Communication Platform

> **MERN Stack** — MongoDB · Express.js · React.js · Node.js  
> Migrated from legacy PHP / CodeIgniter (`cloud.beyondsend.in`)

---

## 🚀 Quick Start

### Backend (API Server)
```bash
cd D:\BeyondSend\BeyondSendBackend
npm start
# Runs on: http://localhost:3000
```

### Frontend (React App)
```bash
cd D:\BeyondSend\BeyondSendFrontend
npm run dev
# Runs on: http://localhost:5173
```

---

## 🔐 Login Credentials

> **Login URL:** `http://localhost:5173`  
> **API Auth Endpoint:** `POST http://localhost:3000/api/v0/auth/login`

---

### 👤 Admin Account
| Field       | Value                      |
|-------------|----------------------------|
| **Email**   | `admin@beyondsend.in`      |
| **Mobile**  | `9800000001`               |
| **Password**| `Admin@123`                |
| **Role**    | `ADMIN`                    |
| **Name**    | Super Admin                |

**Sidebar Access:**  
✅ Dashboard · ✅ WhatsApp Modules · ✅ Email Modules · ✅ Telecom Modules  
✅ APIs & Webhooks · ✅ Users Management · ✅ Website Setup (CMS)  
✅ System & Security · ✅ Support & Feedback

---

### 🤝 Reseller Account
| Field       | Value                       |
|-------------|-----------------------------|
| **Email**   | `reseller@beyondsend.in`    |
| **Mobile**  | `9800000002`                |
| **Password**| `Admin@123`                 |
| **Role**    | `RESELLER`                  |
| **Name**    | Rahul Sharma                |

**Sidebar Access:**  
✅ Dashboard · ✅ WhatsApp Modules · ✅ Email Modules · ✅ Telecom Modules  
✅ APIs & Webhooks · ✅ Users Management · ✅ Support & Feedback  
❌ Website Setup (CMS) — Admin only  
❌ System & Security — Admin only

---

### 🏢 Client Account
| Field       | Value                      |
|-------------|----------------------------|
| **Email**   | `client@beyondsend.in`     |
| **Mobile**  | `9800000003`               |
| **Password**| `Admin@123`                |
| **Role**    | `CLIENT`                   |
| **Name**    | Priya Enterprises          |

**Sidebar Access:**  
✅ Dashboard · ✅ WhatsApp Modules · ✅ Email Modules · ✅ Telecom Modules  
✅ APIs & Webhooks · ✅ Support & Feedback  
❌ Users Management — Admin/Reseller only  
❌ Website Setup (CMS) — Admin only  
❌ System & Security — Admin only

---

## 📋 Role Permissions Matrix

| Feature                    | ADMIN | RESELLER | CLIENT |
|----------------------------|:-----:|:--------:|:------:|
| Dashboard                  | ✅    | ✅       | ✅     |
| WhatsApp Templates         | ✅    | ✅       | ✅     |
| WhatsApp Live Responses    | ✅    | ✅       | ✅     |
| Email Templates            | ✅    | ✅       | ✅     |
| Sender / From IDs          | ✅    | ✅       | ❌     |
| SMS Templates              | ✅    | ✅       | ✅     |
| RCS Templates              | ✅    | ✅       | ✅     |
| Voice Templates            | ✅    | ✅       | ✅     |
| Contact Lists              | ✅    | ✅       | ✅     |
| Audience Segments          | ✅    | ✅       | ✅     |
| Bulk Campaigns             | ✅    | ✅       | ✅     |
| Unsubscribers (DND)        | ✅    | ✅       | ✅     |
| API Dashboard              | ✅    | ✅       | ✅     |
| API Keys                   | ✅    | ✅       | ✅     |
| Webhook Setup/Logs         | ✅    | ✅       | ❌     |
| API Documentation          | ✅    | ✅       | ✅     |
| Users Management           | ✅    | ✅       | ❌     |
| Website Setup (CMS)        | ✅    | ❌       | ❌     |
| System & Security          | ✅    | ❌       | ❌     |
| Support & Feedback         | ✅    | ✅       | ✅     |

---

## 🏗️ Project Structure

```
D:\BeyondSend\
├── BeyondSendBackend\          # Node.js / Express API
│   ├── configs\                # DB config, seed scripts
│   ├── controllers\v0\         # All API controllers
│   ├── middlewares\            # Auth, upload, activity logger
│   ├── models\                 # Mongoose models (28 models)
│   ├── routes\v0\              # API routes (auto-loaded)
│   └── index.js                # Server entry point
│
└── BeyondSendFrontend\         # React + Vite SPA
    ├── src\
    │   ├── components\         # Sidebar, headers, layouts
    │   ├── views\authorized\   # All admin pages
    │   ├── services\           # API client (axios)
    │   └── contexts\           # Auth, Language contexts
    └── public\
```

---

## 🔗 Key API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/v0/auth/login`            | Login (email/password)   |
| POST   | `/api/v0/auth/logout`           | Logout                   |
| GET    | `/api/v0/health-check`          | Server health status     |
| GET    | `/api/v0/users/profile`         | Get logged-in user info  |
| GET    | `/api/v0/users/list`            | List all users (Admin)   |
| POST   | `/api/v0/templates/whatsapp`    | Create WhatsApp template |
| GET    | `/api/v0/campaigns`             | List campaigns           |

---

## 🛠️ Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Backend    | Node.js 20, Express.js 4           |
| Database   | MongoDB (Mongoose ODM)             |
| Frontend   | React 18, Vite, React Router v6    |
| Auth       | JWT (jsonwebtoken + jwt-decode)    |
| File Upload| Multer, AWS S3                     |
| Styling    | Custom CSS (dark theme)            |

---

## 📝 Legacy Migration

This project is migrated from:
- **Old Project:** `C:\xampp\htdocs\cloud.beyondsend.in`
- **Framework:** PHP CodeIgniter (HMVC)
- **Modules Migrated:** campaigns, templates, fromids, suppression, lists, segments, reports, users, resellers, clients, dashboard