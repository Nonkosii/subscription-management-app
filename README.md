# Mobile Subscription Management Portal

A full-stack web application for managing mobile subscriptions with real-time updates, OTP authentication, and admin dashboard.

## Features

- **OTP-based Authentication** - Secure login with mobile number verification
- **Service Management** - Browse and subscribe to various services
- **Real-time Updates** - Live subscription tracking with Socket.IO
- **Admin Dashboard** - Monitor user activity and service usage
- **Telco Billing Simulation** - Mock payment processing system
- **Responsive Design** - Modern UI with TailwindCSS

## Tech Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for REST API
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **CORS** - Cross-origin resource sharing

### Development
- **Nodemon** - Auto-restart server during development
- **Dotenv** - Environment variable management

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup Instructions

1. **Clone the repository**

    git clone <your-repo-url>
    cd subscription-management-app

2.  **Setup Backend**

    cd server
    npm install

3.  **Setup Frontend**

    cd ../client
    npm install

4.  **Environment Setup**

    Create .env file in server directory:
    text

    JWT_SECRET=your-secret-key-change-in-production
    PORT=5000

5.  **Run the Application**

    Terminal 1 (Backend):
        cd server
        npm run dev

    Terminal 2 (Frontend):
        cd client
        npm run dev

6. **Access the Application**

    Frontend: http://localhost:5173

    Backend API: http://localhost:5000

    Admin Access: Use MSISDN 27820000000