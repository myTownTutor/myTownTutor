# Mentora API Documentation

Base URL: `http://localhost:5000/api`

All requests require JWT token in header (except auth endpoints):
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student"  // or "mentor"
}
```

**Response** (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "created_at": "2024-01-01T12:00:00"
  }
}
```

**Errors**:
- 400: Missing required fields
- 409: Email already registered

---

### Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "message": "Logged in successfully",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "created_at": "2024-01-01T12:00:00"
  }
}
```

**Errors**:
- 400: Missing email or password
- 401: Invalid credentials

---

### Get Current User

**Endpoint**: `GET /auth/me`

**Headers**: Requires JWT token

**Response** (200):
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "created_at": "2024-01-01T12:00:00"
}
```

**Errors**:
- 401: Unauthorized
- 404: User not found

---

## Mentor Endpoints

### Initiate Payment

**Endpoint**: `POST /mentors/initiate-payment`

**Headers**: Requires JWT token (mentor role)

**Request Body**:
```json
{
  "amount": 99900  // Amount in paise (999 INR)
}
```

**Response** (200):
```json
{
  "order_id": "order_ABC123...",
  "amount": 99900,
  "currency": "INR",
  "razorpay_key": "rzp_test_ABC123..."
}
```

**Errors**:
- 403: Unauthorized (not a mentor)
- 400: Amount too low

---

### Verify Payment

**Endpoint**: `POST /mentors/verify-payment`

**Headers**: Requires JWT token (mentor role)

**Request Body**:
```json
{
  "razorpay_order_id": "order_ABC123...",
  "razorpay_payment_id": "pay_ABC123...",
  "razorpay_signature": "signature_hash..."
}
```

**Response** (200):
```json
{
  "message": "Payment verified successfully",
  "mentor": {
    "id": 1,
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "approval_status": "pending_approval",
    "created_at": "2024-01-01T12:00:00"
  }
}
```

**Errors**:
- 400: Invalid signature or missing fields
- 404: Payment not found

---

### Get Mentor Profile

**Endpoint**: `GET /mentors/profile`

**Headers**: Requires JWT token (mentor role)

**Response** (200):
```json
{
  "id": 1,
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "bio": "10+ years of experience...",
  "expertise": "Web Development, Python",
  "experience_years": 10,
  "hourly_rate": 500,
  "profile_photo_url": "https://...",
  "instagram_url": "https://instagram.com/john",
  "facebook_url": "https://facebook.com/john",
  "approval_status": "approved",
  "created_at": "2024-01-01T12:00:00"
}
```

---

### Update Mentor Profile

**Endpoint**: `PUT /mentors/profile`

**Headers**: Requires JWT token (mentor role)

**Request Body**:
```json
{
  "bio": "Updated bio...",
  "expertise": "Web Development, Python, Django",
  "experience_years": 12,
  "hourly_rate": 600,
  "profile_photo_url": "https://...",
  "instagram_url": "https://instagram.com/john",
  "facebook_url": "https://facebook.com/john"
}
```

**Response** (200):
```json
{
  "message": "Profile updated successfully",
  "mentor": { /* mentor object */ }
}
```

---

### Get Approved Mentors

**Endpoint**: `GET /mentors/approved`

**Query Parameters**:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `search`: Search by name/expertise
- `min_rate`: Minimum hourly rate
- `max_rate`: Maximum hourly rate

**Example**: `/mentors/approved?search=python&max_rate=1000&page=1`

**Response** (200):
```json
{
  "mentors": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "bio": "...",
      "expertise": "Python",
      "experience_years": 10,
      "hourly_rate": 500,
      "approval_status": "approved"
    }
  ],
  "total": 5,
  "pages": 1,
  "current_page": 1
}
```

---

## Student Endpoints

### Get Student Dashboard

**Endpoint**: `GET /students/dashboard`

**Headers**: Requires JWT token (student role)

**Response** (200):
```json
{
  "student": {
    "id": 1,
    "user_id": 1,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "headline": "Software Developer",
    "bio": "...",
    "created_at": "2024-01-01T12:00:00"
  },
  "stats": {
    "contacts_sent": 3
  }
}
```

---

### Browse Mentors

**Endpoint**: `GET /students/mentors`

**Headers**: Requires JWT token (student role)

**Query Parameters**:
- `page`: Page number
- `per_page`: Items per page
- `search`: Search term
- `expertise`: Filter by expertise
- `min_exp`: Minimum years experience
- `max_rate`: Maximum hourly rate
- `sort_by`: 'latest', 'rating', 'price_low', 'price_high'

**Response** (200):
```json
{
  "mentors": [ /* array of mentor objects */ ],
  "total": 15,
  "pages": 2,
  "current_page": 1
}
```

---

### Send Message to Mentor

**Endpoint**: `POST /students/contact-mentor`

**Headers**: Requires JWT token (student role)

**Request Body**:
```json
{
  "mentor_id": 1,
  "message": "I'm interested in learning Python. Can you help?",
  "phone": "+91 9876543210"  // Optional
}
```

**Response** (201):
```json
{
  "message": "Contact sent successfully",
  "contact": {
    "id": 1,
    "mentor_id": 1,
    "student_id": 1,
    "student_email": "jane@example.com",
    "student_name": "Jane Smith",
    "student_phone": "+91 9876543210",
    "message": "I'm interested in learning Python...",
    "status": "sent",
    "created_at": "2024-01-01T12:00:00"
  }
}
```

**Errors**:
- 400: Missing required fields
- 404: Mentor not found or not approved

---

### Get My Contacts

**Endpoint**: `GET /students/contacts`

**Headers**: Requires JWT token (student role)

**Response** (200):
```json
{
  "contacts": [ /* array of contact objects */ ]
}
```

---

## Admin Endpoints

### Get Dashboard Stats

**Endpoint**: `GET /admin/dashboard`

**Headers**: Requires JWT token (super_admin role)

**Response** (200):
```json
{
  "total_users": 50,
  "total_mentors": 15,
  "total_students": 35,
  "pending_mentors": 3,
  "approved_mentors": 12,
  "total_payments": 12,
  "total_revenue": 9990.00
}
```

---

### Get Pending Mentors

**Endpoint**: `GET /admin/pending-mentors`

**Headers**: Requires JWT token (super_admin role)

**Query Parameters**:
- `page`: Page number
- `per_page`: Items per page

**Response** (200):
```json
{
  "mentors": [
    {
      "id": 1,
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "bio": "...",
      "expertise": "Python",
      "experience_years": 10,
      "hourly_rate": 500,
      "approval_status": "pending_approval"
    }
  ],
  "total": 3,
  "pages": 1,
  "current_page": 1
}
```

---

### Approve Mentor

**Endpoint**: `POST /admin/mentors/{id}/approve`

**Headers**: Requires JWT token (super_admin role)

**Response** (200):
```json
{
  "message": "Mentor approved successfully",
  "mentor": { /* mentor object */ }
}
```

**Email**: Approval email is sent to mentor

---

### Reject Mentor

**Endpoint**: `POST /admin/mentors/{id}/reject`

**Headers**: Requires JWT token (super_admin role)

**Request Body**:
```json
{
  "reason": "Profile information is incomplete"
}
```

**Response** (200):
```json
{
  "message": "Mentor rejected",
  "mentor": { /* mentor object with rejected_reason */ }
}
```

**Email**: Rejection email is sent to mentor

---

### Get All Users

**Endpoint**: `GET /admin/users`

**Headers**: Requires JWT token (super_admin role)

**Query Parameters**:
- `page`: Page number
- `per_page`: Items per page
- `role`: Filter by role (optional)

**Response** (200):
```json
{
  "users": [ /* array of user objects */ ],
  "total": 50,
  "pages": 3,
  "current_page": 1
}
```

---

### Delete User

**Endpoint**: `DELETE /admin/users/{id}`

**Headers**: Requires JWT token (super_admin role)

**Response** (200):
```json
{
  "message": "User deleted successfully"
}
```

**Errors**:
- 400: Cannot delete yourself
- 404: User not found

---

### Get Transactions

**Endpoint**: `GET /admin/transactions`

**Headers**: Requires JWT token (super_admin role)

**Query Parameters**:
- `page`: Page number
- `per_page`: Items per page
- `status`: Filter by status (optional)

**Response** (200):
```json
{
  "transactions": [
    {
      "id": 1,
      "mentor_id": 1,
      "amount": 999.00,
      "currency": "INR",
      "razorpay_order_id": "order_ABC123...",
      "status": "completed",
      "created_at": "2024-01-01T12:00:00"
    }
  ],
  "total": 12,
  "pages": 1,
  "current_page": 1
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Codes

- **400**: Bad Request - Invalid input or missing required fields
- **401**: Unauthorized - Missing or invalid JWT token
- **403**: Forbidden - User doesn't have permission
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists (e.g., email taken)
- **500**: Server Error - Something went wrong on server

---

## Rate Limiting

Currently no rate limiting is implemented. Production deployment should consider:
- Adding rate limiting middleware
- Implementing caching
- Database query optimization

---

## Authentication

JWT tokens are valid for 30 days. Include token in header:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

Tokens are obtained from the `/auth/login` endpoint.

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User","role":"student"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

---

## WebHooks (Future)

Future versions may include webhooks for:
- Mentor approval/rejection
- Payment completion
- Contact received

---

## Support

For API issues:
1. Check the documentation above
2. Review error message
3. Check server logs
4. Ensure correct headers and body format
