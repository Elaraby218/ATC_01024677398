# Event Reservation System Backend

A robust backend system for managing event reservations, built with Node.js, Express, TypeScript, and PostgreSQL.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [API Documentation](#api-documentation)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Programming language
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Project Structure

```
Back-end/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── generated/      # Generated Prisma client
│   ├── middleware/     # Custom middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   └── index.ts        # Application entry point
├── prisma/             # Database schema and migrations
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

## Database Models

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  userName  String   @unique
  firstName String
  lastName  String
  email     String   @unique
  password  String
  age       Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userRoles UserRole[]
  bookings  Booking[]
}
```

### Event Model
```prisma
model Event {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  category    String
  date        DateTime
  venue       String
  price       Float
  image       String?
  isOpen      Boolean  @default(true)
  quantity    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  bookings    Booking[]
}
```

### Booking Model
```prisma
model Booking {
  id          Int      @id @default(autoincrement())
  userId      Int
  eventId     Int
  quantity    Int
  bookingDate DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  isDeleted   Boolean  @default(false)
  deletedAt   DateTime?

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId, bookingDate])
}
```

### Role Model
```prisma
model Role {
  id       Int      @id @default(autoincrement())
  roleName String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userRoles UserRole[]
}
```

## API Documentation

### Authentication Endpoints

#### Sign Up
```http
POST /api/auth/signup
```
Request Body:
```json
{
  "userName": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "age": 25
}
```

#### Login
```http
POST /api/auth/login
```
Request Body:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```
Request Body:
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### Logout
```http
POST /api/auth/logout
```

### Events

#### Get All Events (Public)
```http
GET /api/events
```

Query Parameters:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `category` (optional): Filter events by category

Response:
```json
{
  "events": [
    {
      "id": 1,
      "name": "Summer Concert",
      "description": "Annual summer music festival",
      "category": "Music",
      "date": "2024-07-15T18:00:00Z",
      "venue": "Central Park",
      "price": 50.00,
      "image": "concert.jpg",
      "isOpen": true,
      "quantity": 100
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Get All Events (Admin)
```http
GET /api/events
```

Headers:
- `Authorization`: Bearer token (required)
- User must have admin role

Query Parameters:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `category` (optional): Filter events by category

Response:
```json
{
  "events": [
    {
      "id": 1,
      "name": "Summer Concert",
      "description": "Annual summer music festival",
      "category": "Music",
      "date": "2024-07-15T18:00:00Z",
      "venue": "Central Park",
      "price": 50.00,
      "image": "concert.jpg",
      "isOpen": true,
      "quantity": 100,
      "bookings": [
        {
          "id": 1,
          "quantity": 2,
          "bookingDate": "2024-03-10T14:30:00Z",
          "user": {
            "id": 1,
            "userName": "john_doe",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com"
          }
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Event Endpoints

#### Public Endpoints

##### Get All Categories
```http
GET /api/events/categories/all
```

#### Admin Protected Endpoints

##### Get Event by ID
```http
GET /api/events/:id
```

##### Create Event
```http
POST /api/events
```
Request Body:
```json
{
  "name": "Summer Concert",
  "description": "Annual summer music festival",
  "category": "Music",
  "date": "2024-07-15T18:00:00.000Z",
  "venue": "Central Park",
  "price": 50,
  "quantity": 100,
  "image": "concert.jpg"
}
```

##### Update Event
```http
PUT /api/events/:id
```
Request Body:
```json
{
  "name": "Updated Concert Name",
  "price": 60,
  "quantity": 150
}
```

##### Delete Event
```http
DELETE /api/events/:id
```

##### Toggle Event Status
```http
PUT /api/events/:id/toggle-status
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
```
Request Body:
```json
{
  "eventId": 1,
  "quantity": 2
}
```

#### Get User's Bookings
```http
GET /api/bookings/my-bookings
```
Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### Cancel Booking
```http
DELETE /api/bookings/:id
```

### User Endpoints

#### Update Profile
```http
PUT /api/users/profile
```
Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "userName": "john_doe"
}
```

#### Update Password
```http
PUT /api/users/password
```
Request Body:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see below)
4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/event_reservation"
JWT_ACCESS_SECRET="your_access_token_secret"
JWT_REFRESH_SECRET="your_refresh_token_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "message": "Error message here"
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- Rate limiting
- CORS protection
- SQL injection prevention (via Prisma)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 