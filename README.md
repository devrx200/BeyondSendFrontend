# Department of Higher Education - Government of Chhattisgarh
### Official Web Portal Frontend Application

An advanced, modern, high-performance, and fully responsive web platform built for the **Department of Higher Education, Government of Chhattisgarh**. Developed and hosted under **OpenForge**, India's national e-Governance open source initiative.

---

## 👨‍💻 Credits & System Architecture

### **Lead Architect & Base Structure**
- **Main Base Structure & System Architecture Designed By:** **Lomash Rishi**

### **Development & Execution Team**
- **Developed & Maintained By:** **NIC Development Team (National Informatics Centre)**

---

## 🏛️ Project Overview & Key Features

This platform serves as the central digital portal for Higher Education in Chhattisgarh, providing real-time information, government orders, college directories, scholarship schemes, and administrative services to students, faculty, and citizens.

### 🌟 Key Implemented Features

1. **Dynamic Bilingual Support (English & Hindi)**:
   - Built-in `LanguageContext` providing seamless, real-time UI switching between English and Hindi across navigation menus, headers, notice boards, leadership profiles, and footer links.

2. **Advanced Header & Navigation Architecture (`Header.jsx`)**:
   - **Top Accessibility Bar:** Direct phone & email contacts, accessibility font controls (`A-`, `A`, `A+`), language switcher, and sitemap links.
   - **White Brand Header:** Dynamic State Emblem, Department title, dynamic 3 Leader Profiles (Governor, Chief Minister, Education Minister), and Digital India branding.
   - **Sticky Navigation Bar:** Dark teal navbar with interactive metallic gold (`#FFD54F`) hover states, sub-menu dropdowns, and responsive mobile drawer navigation.

3. **Live Education Statistics Dashboard (`AfterCarousel.jsx`)**:
   - Real-time API integration rendering live statistics for:
     - Government Universities
     - Private Universities
     - Government Colleges
     - Private Colleges
     - Aided Institutions
   - Fully responsive grid layout (5-column desktop ribbon, 3-column tablet grid, 2-column + full-width mobile cards).

4. **Dynamic Leader Profiles Banner**:
   - Highlighting State Leadership with uncropped, contain-fitted circular portraits and Hindi/English designations.

5. **Hero Banner Carousel & High-Priority Notice Ticker (`HeroSlider.jsx`, `NoticeTicker.jsx`)**:
   - Dynamic banner image slider with auto-play & custom captions.
   - Live marquee notice ticker displaying critical announcements and urgent press releases.

6. **Notices, Orders & Circulars Engine (`NoticeDepAndDirectorate.jsx`, `DepDirectorateNoticesListView.jsx`)**:
   - Categorized tabs for Department Notices, Directorate Orders, Notifications, and Gazette releases with search, date filters, pagination, and integrated PDF viewing.

7. **Welfare Schemes & Announcements (`AnnouncementsAndSchemes.jsx`, `SchemeAnnouncementDetails.jsx`)**:
   - Interactive display of higher education scholarship portals, student welfare programs, and state initiatives.

8. **Institutions & Colleges Directory (`Universities.jsx`, `Colleges.jsx`)**:
   - Searchable directory of state universities and affiliated colleges with district-level filtering, contact details, and accreditation info.

9. **Dynamic Content Management Engine (`MultiSectionPages.jsx`, `RichContentPages.jsx`, `ImportantPageDetail.jsx`)**:
   - Modular page renderer allowing CMS administrators to construct custom pages with rich text HTML, table grids, accordion FAQs, and downloadable document attachments.

10. **Media Gallery & Brand Showcase (`Gallery.jsx`, `GovtBrandCarousel.jsx`)**:
    - Photo & Video gallery with lightboxes, alongside an animated carousel featuring state & national government portals.

11. **Cultural Aesthetics & Design System**:
    - Custom SVG background watermark (`page-bg.svg`) featuring 15 upright academic, scientific, and Chhattisgarh cultural motifs.
    - Traditional border pattern strips (`nav-pattern.svg`, `footer-top-pattern.svg`).
    - Curated color scheme: Deep Teal (`#153c4d`), Dark Navy (`#0d1f4e`), Bright Gold (`#ffd54f`), and Soft Light Gray (`#f8fafc`).

---

## 🛠️ Technology Stack & Dependencies

### **Core Stack**
- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite 5](https://vitejs.dev/)
- **UI & Layout:** [Bootstrap 5](https://getbootstrap.com/) & [Reactstrap](https://reactstrap.github.io/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **State & Context:** React Context API (`LanguageContext`)
- **HTTP Client:** [Axios](https://axios-http.com/)

### **Utility Libraries**
- **Icons:** React Icons (`FaPhone`, `FaEnvelope`, `FaBars`, etc.) & Bootstrap Icons (`bi-bank`, `bi-building`)
- **Document Viewer:** `@smazeeapps/file-viewer` & `react-pdf`
- **Rich Text Rendering:** `react-quill` & `jodit-react`
- **Alerts & Modals:** `sweetalert2`
- **Carousels:** `swiper`

---

## 📂 Project Structure Map

```
HigherEducation-Frontend/
├── public/                     # Static assets, logos & cultural SVG patterns
│   ├── page-bg.svg             # Tiling watermark background pattern (15 academic motifs)
│   ├── nav-pattern.svg         # Navbar bottom cultural strip
│   └── footer-top-pattern.svg  # Footer top cultural strip
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Header.jsx          # Top bar, logo bar & main sticky navigation
│   │   ├── Footer.jsx          # Multi-column footer with pattern strip
│   │   ├── AfterCarousel.jsx   # Live statistics dashboard cards
│   │   ├── HeroSlider.jsx      # Home hero banner carousel
│   │   ├── NoticeTicker.jsx    # Marquee notice ticker bar
│   │   ├── NoticeDepAndDirectorate.jsx  # Department & Directorate notices tab view
│   │   ├── AnnouncementsAndSchemes.jsx   # Schemes & announcements module
│   │   ├── AboutSection.jsx    # About Department & leadership section
│   │   └── GovtBrandCarousel.jsx # Partner logos carousel
│   ├── contexts/               # React Context Providers
│   │   └── LanguageContext.jsx # Global Hindi/English translation switcher
│   ├── views/                  # Page Views & Modules
│   │   ├── pages/              # Public facing pages (Home, Colleges, Universities, etc.)
│   │   └── Admin/              # CMS Admin Dashboard & Management Views
│   ├── App.css                 # Master Design System, variables & responsive rules
│   ├── App.jsx                 # Application entry router
│   └── main.jsx                # DOM root initialization
├── package.json                # Project dependencies & scripts
└── vite.config.js              # Vite server & network binding configuration
```

---

## 🚀 Getting Started & Local Network Setup

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://openforge.gov.in/plugins/git/hrmis-frontend/HigherEducation-Frontend.git
cd HigherEducation-Frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Running the Application Across Network
Start the Vite dev server with network exposure enabled (`--host`):
```bash
npm run dev
```

The application will be accessible at:
- **Local:** `http://localhost:5175/`
- **Network (Wi-Fi / LAN):** `http://<your-ip-address>:5175/`

### 4. Production Build
To create an optimized production build:
```bash
npm run build
```

---

## 📜 Governance & Compliance

Developed for the **Department of Higher Education, Government of Chhattisgarh** in collaboration with the **National Informatics Centre (NIC)**. Adheres to Guidelines for Indian Government Websites (GIGW) for digital accessibility, security, and responsive performance.
