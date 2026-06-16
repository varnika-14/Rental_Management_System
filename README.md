# 🏠 Rental Management System

**Live URL:** https://rental-management-system-var.vercel.app

A comprehensive full-stack rental management platform connecting property owners and tenants with AI-powered features, real-time chat, and secure payment tracking.

---

## 📋 Project Overview

This platform bridges the gap between property owners and tenants by providing a unified solution for property listing, booking management, rent tracking, and seamless communication. Built with the MERN stack, it leverages Mistral AI for intelligent property price prediction and natural language search capabilities.

---

## 👥 User Roles

### 🏢 Property Owner
- List and manage properties with detailed information
- Receive and manage booking requests from tenants
- Accept/reject booking requests with reasons
- Track rent payments from tenants
- Chat with potential tenants
- View revenue analytics and payment history

### 👤 Tenant
- Search properties using traditional filters or natural language
- Submit booking requests with preferred move-in dates
- Make secure rent payments (one-time or monthly)
- Track payment history and pending dues
- Chat directly with property owners
- View property availability calendar

---

## ✨ Key Features

### 1. 🤖 AI-Powered Price Prediction
- **Smart Pricing:** Owners can get AI-recommended rent prices using Mistral AI
- **Market Analysis:** Considers location, property type, amenities, area, and nearby places
- **Confidence Scoring:** Provides confidence levels (High/Medium/Low) with reasoning
- **One-Click Apply:** Automatically populate suggested rent price

### 2. 🔍 Natural Language Search
- **Conversational Search:** Tenants can describe what they're looking for in plain English
- **Multi-Field Analysis:** Searches across title, description, location, amenities, bedrooms, and budget
- **Smart Filtering:** AI extracts key requirements (budget, location, amenities) automatically
- **Example Queries:**
  - "2BHK apartment near metro station under 25000"
  - "Furnished villa with swimming pool and parking"
  - "Studio with gym and wifi for working professional"

### 3. 💬 Real-Time Chat System
- **Instant Messaging:** WebSocket-based real-time communication
- **Conversation Management:** Automatic conversation threads between owners and tenants
- **Read Receipts:** Track unread messages with badges
- **Typing Indicators:** Real-time typing status
- **Persistent History:** All messages stored and retrievable

### 4. 📅 Smart Booking System
- **Availability Check:** Prevents double-booking with date overlap validation
- **Flexible Durations:** Book by days, months, or years
- **Status Tracking:** Pending → Accepted/Rejected/Cancelled workflow
- **Auto-Rejection:** Automatically rejects overlapping pending requests when a booking is accepted

### 5. 💰 Payment Management
- **Flexible Payment Plans:** One-time full payment or monthly installments
- **Payment Tracking:** Real-time paid amount vs remaining balance
- **Payment History:** Complete transaction history per booking
- **Simulated Payments:** Card/UPI payment simulation for demo
- **Progress Indicator:** Visual payment progress bar

### 6. 📊 Rent Tracking Dashboard
- **For Owners:** Total revenue, pending amounts, active rentals, fully paid count
- **For Tenants:** Total paid, remaining dues, active rentals
- **Per-Booking Details:** Monthly rent, total commitment, payment status
- **Payment History:** Chronological list of all payments with amounts and dates

### 7. 📝 Property Management
- **Rich Property Details:** Title, description, type, rent, location, full address
- **Multiple Images:** Upload up to 10 property photos
- **Detailed Specifications:** Bedrooms, area (sq ft), amenities, nearby places
- **CRUD Operations:** Full create, read, update, delete functionality

### 8. 🔐 Secure Authentication
- **OTP Verification:** Email-based OTP for registration
- **Role-Based Access:** Separate dashboards for owners and tenants
- **JWT Tokens:** Secure API authentication
- **Profile Management:** Complete profile with govt ID verification

### 9. 📱 Responsive Design
- **Mobile-First Approach:** Fully functional on all devices
- **Collapsible Sidebar:** Optimized navigation for mobile screens
- **Touch-Friendly:** Large buttons and easy-to-tap elements

---

## 🛠️ Technology Stack

### Frontend
- React.js with Hooks
- Socket.IO Client (Real-time chat)
- Axios (API calls)
- React Router DOM (Navigation)
- CSS3 (Custom styling with responsive design)

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- Socket.IO (WebSocket server)
- JWT (Authentication)
- Bcryptjs (Password hashing)
- Nodemailer (Email OTP)

### AI Integration
- **Mistral AI API** - Price prediction & natural language search

### Cloud Services
- Cloudinary (Image storage)
- Render (Backend hosting)
- Vercel (Frontend hosting)

---

## 🎯 Core Workflows

### Owner Journey
1. Register as owner with email verification
2. Complete profile with ID verification
3. Add properties with details and photos
4. Receive booking requests from tenants
5. Accept/reject requests (accepting locks dates)
6. Track rent payments from accepted bookings
7. Chat with tenants for coordination

### Tenant Journey
1. Register as tenant with email verification
2. Browse properties (filter or natural language search)
3. View property details with availability calendar
4. Submit booking request with preferred dates
5. Once accepted, make rent payment (monthly/one-time)
6. Track payment history and pending dues
7. Chat with owner for move-in coordination

---

## 📸 Screenshots

| Feature | Description |
|---------|-------------|
| Home Screen | Role selection (Owner/Tenant) landing page |
| Dashboard | Role-specific analytics and quick actions |
| Property Listing | Grid view with filters and AI search |
| Booking Requests | Owner view with accept/reject options |
| Rent Tracking | Payment progress and history |
| Chat Interface | Real-time messaging system |

---

## 🚀 Live Demo

**Frontend:** [https://rental-management-system-var.vercel.app](https://rental-management-system-var.vercel.app)

**Backend API:** [https://rental-management-system-4.onrender.com](https://rental-management-system-4.onrender.com)

### Test Credentials

**Owner Account:**
- Email: owner@example.com
- Password: owner123

**Tenant Account:**
- Email: tenant@example.com
- Password: tenant123

---

## 💡 Key Highlights

✅ **AI Integration:** Mistral AI for intelligent pricing and search
✅ **Real-Time Communication:** Socket.IO powered instant messaging
✅ **Smart Booking:** Automatic date conflict resolution
✅ **Flexible Payments:** Monthly or one-time payment options
✅ **Role-Specific Dashboards:** Tailored views for owners and tenants
✅ **Responsive Design:** Seamless experience across all devices
✅ **Secure Authentication:** OTP verification + JWT tokens
✅ **Complete Rental Lifecycle:** From listing to payment tracking

---

## 📞 Contact

**Developer:** Varnika

**GitHub:** [https://github.com/varnika-14](https://github.com/varnika-14)

**Project Repository:** [https://github.com/varnika-14/Rental_Management_System](https://github.com/varnika-14/Rental_Management_System)

---

## 📄 License

This project is for educational and portfolio purposes.

---

## 🙏 Acknowledgments

- Mistral AI for natural language processing
- Cloudinary for image hosting
- MongoDB Atlas for database hosting
- Render & Vercel for deployment platforms

---

**© 2026 Rental Management System | Built with 💙 for hassle-free rentals**
