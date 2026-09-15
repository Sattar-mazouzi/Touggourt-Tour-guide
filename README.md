<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Memory of Touggourt (ذاكرة توقرت)

Memory of Touggourt is a comprehensive, multilingual cultural and tourist guide application dedicated to the province of Touggourt, Algeria. It serves as a digital gateway to the city's rich history, deep Saharan heritage, and vibrant tourist routes.

View your app in AI Studio: https://ai.studio/apps/7ff207da-bdb3-4919-b261-eccbfc196a37

---

## 📱 App Sections & Features

The application is built with a highly interactive, mobile-first design, divided into several key sections:

- **Home (الرئيسية):** Features curated highlights, a dynamic welcome message, and quick access to various tourist and historical routes (Cultural, Natural, Religious, Services).
- **Explore (استكشف):** A powerful discovery engine allowing users to toggle between a List view and an Interactive Map view. Users can filter places by category and sub-category, or search by keywords.
- **Gallery (المعرض):** A rich visual showcase of the city, featuring high-resolution images, 3D visualizations, and an integrated YouTube channel section ("Memory of Touggourt") to explore cultural videos. Includes smooth thumbnail navigation and full-screen gallery modes.
- **Favorites (المفضلة):** A personalized space where authenticated users can save and easily access their preferred locations and landmarks.
- **About (عن التطبيق):** Contains application metadata, owner information, and a list of official contributors and authorities responsible for the project.
- **City Bio & Heritage Articles:** Deep dives into Touggourt's history, climate, topography, and rich material/non-material heritage (including traditional clothing, culinary arts, folklore, and festivals).

## 🛠️ Technical Architecture

The application is built using modern web development practices, focusing on performance, accessibility, and dynamic content delivery.

### Frontend Technologies
- **Framework:** React 19 powered by Vite for lightning-fast HMR and optimized builds.
- **Language:** TypeScript for robust, type-safe code architecture.
- **Styling:** Tailwind CSS for rapid, utility-first styling and highly responsive UI components.
- **Icons:** `lucide-react` for clean, consistent vector iconography.
- **Internationalization (i18n):** Custom built-in translation system supporting English, Arabic (RTL), and French seamlessly.
- **Animations:** CSS-based animations (`animate-in`, `fade-in`, `zoom-in`) and smooth scroll behaviors utilizing `scrollIntoView` and CSS scroll snapping for immersive media viewing.

### Backend & Storage (Firebase)
The app relies entirely on Google's Firebase ecosystem for its backend infrastructure:
- **Firestore (NoSQL Database):** Stores all structured data including `places` (landmarks, hotels, parks), `gallery` items, `aboutCity` content, `appConfig`, and user reviews.
- **Firebase Authentication:** Manages user sessions securely, enabling features like favoriting places and leaving reviews.
- **Firebase Analytics:** Tracks visitor sessions and screen views to understand user engagement and improve the experience.

### APIs & Integrations
- **Overpass API (OpenStreetMap):** Dynamically fetches real-time "Services" data (hospitals, pharmacies, banks, transport hubs, parks) based on the city's geographical bounding box to augment the curated database with live local services.
- **Google Maps API:** Deep-links to Google Maps for turn-by-turn directions.
- **YouTube Embed API:** Natively embeds cultural videos directly into the detail and gallery views without leaving the app.
- **Gemini API (`@google/genai`):** Configured for AI-powered guide features, offering intelligent assistance to tourists.

---

## 🚀 Run Locally

This repository contains everything you need to run your app locally.

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
