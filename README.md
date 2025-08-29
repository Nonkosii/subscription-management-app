# Mobile Subscription Management Portal

A full-stack web application for managing mobile subscriptions with real-time updates, OTP authentication, and admin dashboard.

## Important Architecture Note: In-Memory Data Storage

This application currently uses **in-memory data storage** for demonstration purposes. This means:

### Limitations:
- **Data is not persisted** - All user data, subscriptions, and transactions are lost when the server restarts
- **Not production-ready** - This is a demo application only
- **Single server instance only** - Cannot be scaled horizontally
- **No data backup** - No recovery mechanism for lost data

### Intended Use:
- Development and testing environments only
- Demo purposes and proof-of-concept
- Educational examples of real-time functionality

### Production Considerations:
For production use, you would need to:
1. Replace in-memory storage with a proper database (MongoDB)
2. Implement proper data persistence layers
3. Add database migration scripts
4. Implement backup and recovery procedures

## Features

- **OTP-based Authentication** - Secure login with mobile number verification
- **Service Management** - Browse and subscribe to various services
- **Real-time Updates** - Live subscription tracking with Socket.IO
- **Admin Dashboard** - Monitor user activity and service usage
- **Telco Billing Simulation** - Mock payment processing system
- **Responsive Design** - Modern UI with TailwindCSS
- **Rate Limiting** - Protection against OTP abuse

## Tech Stack & Justifications

### Frontend Choices
| Technology | Justification |
|------------|---------------|
| **React 18** | Modern component-based architecture with hooks for state management |
| **Vite** | Faster build times and hot reload compared to Create React App |
| **TailwindCSS** | Utility-first CSS for rapid UI development and consistency |
| **Axios** | Robust HTTP client with interceptors for API calls |
| **Socket.IO Client** | Enables real-time bidirectional communication |

### Backend Choices
| Technology | Justification |
|------------|---------------|
| **Node.js + Express** | Lightweight and efficient for JSON APIs, large ecosystem |
| **Socket.IO** | Handles real-time updates better than raw WebSockets |
| **JWT** | Stateless authentication suitable for mobile and web clients |
| **CORS** | Essential for cross-origin requests in development |

### Development Tools
| Technology | Justification |
|------------|---------------|
| **Nodemon** | Auto-restart server during development for productivity |
| **Dotenv** | Secure management of environment variables |

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Step-by-Step Setup

1. **Clone and setup the repository**

   git clone <https://github.com/Nonkosii/subscription-management-app>

   cd subscription-management-app

2. **Setup Backend Server**

   cd server

   npm install

3. **Setup Frontend Client**

   cd ../client

   npm install

4. **Environment Configuration**
   Create `.env` file in server directory:

   JWT_SECRET=secret-key

   PORT=5000

5. **Run the Application**
   - Terminal 1 (Backend API):

     cd server

     node server.js

   - Terminal 2 (Frontend Client):
    
     cd client

     npm run dev

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Admin Access: Use MSISDN `27820000000`

## API Documentation

### Base URL

http://localhost:5000

## Data Persistence Note

**Important**: This API uses in-memory storage. All data is temporary and will be lost when the server restarts. This includes:
- User sessions and authentication tokens
- Subscription records  
- Transaction history
- Admin dashboard statistics

For production use, implement proper database persistence.

### Authentication Endpoints

#### POST `/auth/send-otp`

Send OTP to mobile number for authentication.

**Request:**

{
  "msisdn": "27820000000"
}

**Response:**

{
  "message": "OTP sent (mocked)"
}

**Rate Limiting:** 5 attempts per 15 minutes per IP

#### POST `/auth/verify-otp`
Verify OTP and receive authentication token.

**Request:**
{
  "msisdn": "27820000000",
  "otp": "123456"
}

**Response:**

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

### Service Endpoints

#### GET `/services`
Get all available subscription services.

**Response:**

[
  {
    "id": "1",
    "name": "Music Streaming",
    "description": "Access to millions of songs"
  },
  {
    "id": "2", 
    "name": "Video Streaming",
    "description": "Unlimited movies and TV shows"
  }
]

### Subscription Endpoints (Authenticated)

#### GET `/subscriptions`
Get user's current subscriptions.

**Headers:**

Authorization: Bearer <jwt-token>


**Response:**

{
  "subscriptions": ["1", "2"]
}

#### POST `/subscriptions`
Subscribe to a service with telco billing simulation.

**Headers:**

Authorization: Bearer <jwt-token>


**Request:**

{
  "serviceId": "1"
}


**Success Response (90%):**

{
  "message": "Subscribed successfully",
  "subscriptions": ["1", "2"],
  "billing": {
    "success": true,
    "transactionId": "TXN_123456789",
    "provider": "vodacom",
    "amount": 1.5,
    "currency": "ZAR"
  }
}

**Failure Response (10%):**

Status: 402 Payment Required

{
  "message": "Subscription failed: Insufficient funds",
  "billing": {
    "success": false,
    "transactionId": "TXN_987654321",
    "provider": "vodacom"
  }
}


#### DELETE `/subscriptions/:serviceId`
Unsubscribe from a service.

**Headers:**

Authorization: Bearer <jwt-token>


**Response:**

{
  "message": "Unsubscribed successfully",
  "subscriptions": ["1"]
}


### Transaction Endpoints (Authenticated)

#### GET `/transactions`
Get user's transaction history.

**Headers:**

Authorization: Bearer <jwt-token>

**Response:**

{
  "transactions": [
    {
      "id": "1",
      "service": "Music Streaming",
      "type": "subscribe",
      "date": "2024-01-01T12:00:00.000Z",
      "user": "27820000000"
    }
  ]
}


## Socket.IO Events

### Client to Server Events
- `register-user` - Register user connection with MSISDN
- `register-admin` - Register admin user connection

### Server to Client Events
- `subscription-update` - Real-time subscription changes
- `user-connected` - Notification of user connection
- `user-disconnected` - Notification of user disconnection

### Example Subscription Update
```javascript
// Server emits:
io.emit('subscription-update', {
  user: "27820000000",
  subscriptions: ["1", "2"]
});

// Client listens:
socket.on('subscription-update', (data) => {
  console.log('User:', data.user, 'Subscriptions:', data.subscriptions);
});
```

## Testing

### Manual Test Cases
1. **User Registration Flow**
   - Enter MSISDN → Request OTP → Verify → Access Dashboard

2. **Subscription Flow** 
   - Browse services → Subscribe → Handle success/failure → View transactions

3. **Admin Monitoring**
   - Login as admin → View real-time user activity → Monitor service usage

4. **Real-time Testing**
   - Open multiple windows → Subscribe in one → Verify updates in others

### API Testing with curl
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test services endpoint
curl http://localhost:5000/services

# Test OTP request
curl -X POST http://localhost:5000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"msisdn":"27820000000"}'
```


## Configuration

### Environment Variables
- `JWT_SECRET` - Secret key for JWT token signing
- `PORT` - Server port number (default: 5000)
- `NODE_ENV` - Application environment mode

### CORS Settings
Configured to allow cross-origin requests from:
- http://localhost:5173 (Vite development server)
- http://localhost:3000 (Alternative frontend ports)
