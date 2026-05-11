# 🌟 Humanity Haven Foundation

<div align="center">

![Humanity Haven Foundation](https://via.placeholder.com/1200x300/2C1810/FFFFFF?text=Humanity+Haven+Foundation)

**Empowering Lives, Restoring Hope**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11.0-FFCA28?logo=firebase)](https://firebase.google.com/)
[![M-Pesa](https://img.shields.io/badge/M--Pesa-Integrated-00A859)](https://developer.safaricom.co.ke/)

_A full-stack e-commerce and donation platform with seamless M-Pesa payment integration_

[Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [M-Pesa Integration](#m-pesa-integration)
- [Firebase Setup](#firebase-setup)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 📖 About The Project

**Humanity Haven Foundation** is a comprehensive digital platform designed to support charitable initiatives through an elegant e-commerce store and seamless donation system. The platform enables supporters to purchase merchandise (with pickup at events) or make direct contributions—all powered by Kenya's leading mobile money service, M-Pesa.

### The Problem We Solve

Traditional charity platforms often face:

- ❌ Complex payment gateways
- ❌ High transaction fees
- ❌ Poor mobile optimization
- ❌ Lack of real-time updates

### Our Solution

- ✅ **Native M-Pesa Integration** - STK Push for instant payments
- ✅ **Zero Transaction Fees** - Direct to foundation account
- ✅ **Mobile-First Design** - Optimized for Kenyan users
- ✅ **Real-Time Status** - Live payment confirmation
- ✅ **QR Code Pickup Passes** - Secure event access

---

## ✨ Features

### 🛍️ **E-Commerce Store**

- Product catalog with stock management
- Shopping cart with real-time updates
- Secure checkout with M-Pesa
- Order confirmation with QR codes

### 🤝 **Donation System**

- One-time and recurring contributions
- Custom amount options
- Impact tracking
- Receipt generation

### 📅 **Event Management**

- Upcoming events showcase
- RSVP functionality
- Pickup location mapping
- Event-based merchandise pickup

### 📱 **User Experience**

- Responsive design (mobile/tablet/desktop)
- Dark/Light mode support
- Smooth animations with Framer Motion
- Accessible components

### 🔐 **Admin Features**

- Inventory management
- Order tracking
- Donation reports
- Content management

---

## 🛠️ Tech Stack

### Frontend

| Technology           | Purpose      |
| -------------------- | ------------ |
| **React 18**         | UI framework |
| **TypeScript**       | Type safety  |
| **Tailwind CSS**     | Styling      |
| **Framer Motion**    | Animations   |
| **Lucide React**     | Icons        |
| **React Router DOM** | Navigation   |

### Backend

| Technology             | Purpose                      |
| ---------------------- | ---------------------------- |
| **Firebase Firestore** | Database                     |
| **Firebase Auth**      | Authentication (Anonymous)   |
| **Firebase Functions** | M-Pesa API (Cloud Functions) |
| **Express.js**         | API routes (via Functions)   |

### Payments

| Technology               | Purpose              |
| ------------------------ | -------------------- |
| **Safaricom M-Pesa API** | STK Push payments    |
| **Daraja API**           | OAuth & transactions |

### Development Tools

| Tool         | Purpose         |
| ------------ | --------------- |
| **Vite**     | Build tool      |
| **ESLint**   | Code linting    |
| **Prettier** | Code formatting |
| **npm**      | Package manager |

---

## 🏗️ Architecture

┌─────────────────────────────────────────────────────────────┐
│ Client Browser │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Home │ │ Shop │ │ Donate │ │ Events │ │
│ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ │
│ │ │ │ │ │
│ └────────────┴────────────┴────────────┘ │
│ │ │
│ ┌──────▼──────┐ │
│ │ Firebase │ │
│ │ Client │ │
│ │ SDK │ │
│ └──────┬──────┘ │
└─────────────────────────┼───────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Firebase Platform │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Firestore │ │ Auth │ │ Functions │ │
│ │ Database │ │ (Anonymous) │ │ (M-Pesa) │ │
│ └──────────────┘ └──────────────┘ └──────┬───────┘ │
│ │ │
└──────────────────────────────────────────────┼──────────────┘
│
▼
┌──────────────────┐
│ M-Pesa API │
│ (Safaricom) │
└──────────────────┘

text

### Data Flow (Payment Process)

1. **User initiates payment** → `Checkout.tsx` / `Donate.tsx`
2. **Frontend calls** → `stkPush` Cloud Function
3. **Function requests** → M-Pesa STK Push
4. **User receives prompt** → Enter PIN on phone
5. **M-Pesa processes** → Sends callback to `mpesaCallback`
6. **Callback updates** → Firestore order/contribution
7. **Frontend polls** → `queryStatus` for confirmation
8. **Success screen** → QR code generated for pickup

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Firebase Account** (Blaze plan for Cloud Functions)
- **Safaricom Developer Account** (for M-Pesa sandbox credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/humanity-haven-foundation.git
   cd humanity-haven-foundation
   Install dependencies
   ```

bash
npm install
cd functions && npm install && cd ..
Create environment files

bash
cp .env.example .env.local
Start development server

bash
npm run dev
Open your browser

text
http://localhost:3000
🔧 Environment Setup
Frontend (.env.local)
env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Backend (Firebase Functions Config)
bash

# Set M-Pesa credentials

firebase functions:config:set mpesa.consumer_key="your_consumer_key"
firebase functions:config:set mpesa.consumer_secret="your_consumer_secret"
firebase functions:config:set mpesa.passkey="your_passkey"
firebase functions:config:set mpesa.shortcode="174379"
firebase functions:config:set mpesa.environment="sandbox"
💳 M-Pesa Integration
Getting M-Pesa Credentials
Register at Safaricom Developer Portal

Create an app to get Consumer Key & Secret

Use sandbox credentials for testing:

Shortcode: 174379

Test numbers: 254708374149, 254711111111

Test PIN: 123456

Testing Payments
Scenario Phone Number Expected Result
Success 254708374149 Payment completes
Insufficient funds 254708374149 Error message
Wrong PIN 254708374149 Error message
Timeout Any number Timeout after 60s
M-Pesa Endpoints
Function Method Purpose
stkPush Callable Initiate payment
queryStatus Callable Check payment status
mpesaCallback HTTP POST Receive M-Pesa callback
mpesaHealth HTTP GET Health check
🔥 Firebase Setup
Firestore Collections
javascript
// Orders Collection
orders/
└── {orderId}
├── orderId: string
├── customerName: string
├── customerEmail: string
├── mpesaNumber: string
├── items: array
├── totalAmount: number
├── status: 'pending' | 'paid' | 'failed'
├── createdAt: timestamp
└── paidAt: timestamp

// Products Collection
products/
└── {productId}
├── name: string
├── price: number
├── description: string
├── image: string
├── stock: number
└── category: string

// Events Collection
events/
└── {eventId}
├── title: string
├── date: string
├── description: string
├── location: string
└── isUpcoming: boolean

// Contributions Collection
contributions/
└── {contributionId}
├── donorName: string
├── mpesaNumber: string
├── amount: number
├── status: 'pending' | 'completed' | 'failed'
└── createdAt: timestamp

// M-Pesa Transactions (internal)
mpesa_transactions/
└── {orderId/contributionId}
├── checkoutRequestID: string
├── resultCode: string
├── status: 'pending' | 'completed' | 'failed'
└── mpesaReceiptNumber: string
Security Rules
javascript
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
// Allow public read for products and events
match /products/{document} {
allow read: if true;
}
match /events/{document} {
allow read: if true;
}

    // Allow anyone to create orders and contributions
    match /orders/{document} {
      allow create: if true;
      allow read: if request.auth != null;
    }
    match /contributions/{document} {
      allow create: if true;
      allow read: if request.auth != null;
    }

    // Admin only for modifications
    match /{document=**} {
      allow write: if request.auth != null &&
        request.auth.token.email == 'admin@humanityhaven.org';
    }

}
}
📦 Deployment
Deploy to Firebase
bash

# Build the project

npm run build

# Deploy hosting

firebase deploy --only hosting

# Deploy functions

firebase deploy --only functions

# Deploy Firestore rules

firebase deploy --only firestore:rules

# Deploy everything

firebase deploy
Environment-specific Deploy
bash

# Production

firebase use production
firebase deploy

# Staging

firebase use staging
firebase deploy
Post-Deployment Checklist
Verify M-Pesa callback URL is accessible

Test payment flow in sandbox

Check Firestore indexes are created

Confirm environment variables are set

Test CORS configuration

Verify QR code generation works

📁 Project Structure
text
humanity-haven-foundation/
├── src/
│ ├── components/ # Reusable UI components
│ │ ├── Navbar.tsx
│ │ ├── Footer.tsx
│ │ ├── Cart.tsx
│ │ ├── ErrorToast.tsx
│ │ └── ScrollToTop.tsx
│ ├── pages/ # Page components
│ │ ├── Home.tsx
│ │ ├── Shop.tsx
│ │ ├── ProductDetail.tsx
│ │ ├── Checkout.tsx
│ │ ├── Donate.tsx
│ │ ├── Events.tsx
│ │ ├── EventDetail.tsx
│ │ ├── About.tsx
│ │ ├── Contact.tsx
│ │ └── Admin.tsx
│ ├── context/ # React context
│ │ ├── CartContext.tsx
│ │ └── AuthContext.tsx
│ ├── lib/ # Utilities
│ │ ├── firebase.ts
│ │ ├── utils.ts
│ │ └── errorHandler.ts
│ ├── styles/ # Global styles
│ │ └── globals.css
│ ├── App.tsx
│ └── main.tsx
├── functions/ # Firebase Cloud Functions
│ ├── index.js # M-Pesa API
│ ├── package.json
│ └── .eslintrc.js
├── public/ # Static assets
├── .env.example # Environment variables template
├── .gitignore
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── firebase.json
└── README.md
📡 API Documentation
STK Push (Initiate Payment)
Callable Function: stkPush

Request:

javascript
{
orderId: string,
amount: number,
phoneNumber: string, // Format: 2547XXXXXXXX
accountReference: string,
transactionDesc: string
}
Response:

javascript
{
success: boolean,
checkoutRequestID: string,
merchantRequestID: string,
responseCode: string,
message: string
}
Query Status
Callable Function: queryStatus

Request:

javascript
{
checkoutRequestID: string,
orderId: string
}
Response:

javascript
{
success: boolean,
resultCode: string, // '0' = success
resultDesc: string
}
Health Check
Endpoint: GET /mpesaHealth

Response:

javascript
{
status: 'healthy',
environment: 'sandbox' | 'production',
shortcode: string,
timestamp: string
}
🤝 Contributing
Contributions are what make the open-source community amazing!

Fork the Project

Create your Feature Branch

bash
git checkout -b feature/AmazingFeature
Commit your Changes

bash
git commit -m 'Add some AmazingFeature'
Push to the Branch

bash
git push origin feature/AmazingFeature
Open a Pull Request

Development Guidelines
Follow ESLint configuration

Write meaningful commit messages

Update documentation for API changes

Test payment flows before submitting

📄 License
Distributed under the MIT License. See LICENSE for more information.

🙏 Acknowledgments
Safaricom for M-Pesa API

Firebase for backend infrastructure

Tailwind CSS for styling framework

Framer Motion for animations

All Contributors who support the cause

📞 Contact & Support
Website: humanityhaven.org

Email: support@humanityhaven.org

Phone: +254 700 000 000

GitHub Issues: Report Bug

🌍 Impact Report
Since launch, Humanity Haven Foundation has:

🎓 250+ students sponsored

🏠 50+ families housed

💊 10,000+ medical treatments funded

🌱 5,000+ trees planted

Every donation makes a difference. Thank you for being part of the change.

<div align="center"> <sub>Built with ❤️ for Humanity Haven Foundation</sub> </div> ```
This README provides comprehensive documentation that covers:

Project overview and mission

Complete tech stack explanation

Architecture diagrams and data flow

Step-by-step setup instructions

M-Pesa integration details

Firebase configuration

API documentation

Deployment guides

Project structure

Contributing guidelines

#deployement
npm run build
firebase deploy
