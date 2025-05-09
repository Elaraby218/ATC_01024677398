# Event Reservation System API Documentation

## Authentication
All protected endpoints require a valid authentication token in the cookie header.

## Event Endpoints

### Public Endpoints

#### 1. Get All Events
```http
GET /api/events
```
Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by event category

Response:
```json
{
  "events": [
    {
      "id": 1,
      "name": "Summer Concert",
      "description": "Annual summer music festival",
      "category": "Music",
      "date": "2024-07-15T18:00:00.000Z",
      "venue": "Central Park",
      "price": 50,
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

#### 2. Get Upcoming Events
```http
GET /api/events/upcoming
```
Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by event category

Response:
```json
{
  "events": [
    {
      "id": 1,
      "name": "Summer Concert",
      "description": "Annual summer music festival",
      "category": "Music",
      "date": "2024-07-15T18:00:00.000Z",
      "venue": "Central Park",
      "price": 50,
      "image": "concert.jpg",
      "isOpen": true,
      "quantity": 100,
      "isBooked": true  // Only included for authenticated users
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### 3. Get All Categories
```http
GET /api/events/categories/all
```
Response:
```json
[
  "Music",
  "Conference",
  "Exhibition",
  "Sports",
  "Workshop"
]
```

### Admin Protected Endpoints

#### 1. Get Event by ID (Admin Only)
```http
GET /api/events/:id
```
Response:
```json
{
  "id": 1,
  "name": "Summer Concert",
  "description": "Annual summer music festival",
  "category": "Music",
  "date": "2024-07-15T18:00:00.000Z",
  "venue": "Central Park",
  "price": 50,
  "image": "concert.jpg",
  "isOpen": true,
  "quantity": 100,
  "bookings": [
    {
      "id": 1,
      "quantity": 2,
      "bookingDate": "2024-03-15T10:00:00.000Z",
      "user": {
        "id": 1,
        "userName": "john_doe",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```
Note: This endpoint shows all bookings for the event, including user details. Only accessible by admins.

#### 2. Create Event
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

#### 3. Update Event
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

#### 4. Delete Event
```http
DELETE /api/events/:id
```

#### 5. Toggle Event Status
```http
PUT /api/events/:id/toggle-status
```

## Booking Endpoints

### Protected Endpoints (Requires Authentication)

#### 1. Create Booking
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
Response:
```json
{
  "currentBooking": {
    "bookingId": 1,
    "quantity": 2,
    "bookingDate": "2024-03-15T14:30:00.000Z"
  },
  "event": {
    "id": 1,
    "name": "Summer Concert",
    "description": "Annual summer music festival",
    "date": "2024-07-15T18:00:00.000Z",
    "venue": "Central Park",
    "price": 50,
    "category": "Music",
    "image": "concert.jpg",
    "isOpen": true
  },
  "previousBookings": [],
  "totalBookings": 1,
  "totalTickets": 2
}
```

#### 2. Get User's Bookings
```http
GET /api/bookings/my-bookings
```
Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

Response:
```json
{
  "events": [
    {
      "event": {
        "id": 1,
        "name": "Summer Concert",
        "description": "Annual summer music festival",
        "date": "2024-07-15T18:00:00.000Z",
        "venue": "Central Park",
        "price": 50,
        "category": "Music",
        "image": "concert.jpg",
        "isOpen": true
      },
      "bookingHistory": [
        {
          "bookingId": 2,
          "quantity": 3,
          "bookingDate": "2024-03-15T15:00:00.000Z"
        },
        {
          "bookingId": 1,
          "quantity": 2,
          "bookingDate": "2024-03-15T14:30:00.000Z"
        }
      ],
      "totalTickets": 5
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### 3. Cancel Booking
```http
DELETE /api/bookings/:id
```
Response:
```json
{
  "message": "Booking cancelled successfully"
}
```

## Error Responses

### Common Error Codes
- 400: Bad Request (Invalid input)
- 401: Unauthorized (No authentication)
- 403: Forbidden (No permission)
- 404: Not Found
- 500: Internal Server Error

### Example Error Response
```json
{
  "message": "Error message here"
}
```

## Special Behaviors

### Event Booking
1. Users can book the same event multiple times
2. Each booking is uniquely identified by user, event, and booking date
3. Maximum 5 tickets per booking
4. Booking decreases event quantity
5. Cancellation increases event quantity

### Booking History
1. Each event shows complete booking history
2. Bookings are sorted by date (newest first)
3. Total tickets per event are calculated
4. Pagination is applied at the event level

### Event Management
1. Only admins can create, update, delete events
2. Event status can be toggled (open/closed)
3. Events can be filtered by category
4. Upcoming events are filtered by date
5. Detailed event information (including all bookings) is only accessible to admins

### Categories
1. Categories are stored with events
2. Unique categories can be retrieved
3. Events can be filtered by category 