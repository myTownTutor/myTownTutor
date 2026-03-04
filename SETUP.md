# Mentora Platform - Setup Guide

## Project Overview
A complete mentorship platform connecting students with expert mentors. Includes user authentication, payment processing via Razorpay, and an admin approval system.

## Technology Stack
- **Backend**: Python with Flask
- **Frontend**: React 18 with React Router
- **Database**: SQLite (development) / PostgreSQL (production)
- **Payment**: Razorpay UPI
- **Email**: SMTP (Gmail recommended)

---

## Prerequisites

### Required Software
- Python 3.8+
- Node.js 14+
- Git
- A Razorpay account (https://razorpay.com)
- Gmail or SMTP email account

---

## Backend Setup (Flask)

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd mentora/mentora-backend
```

### 2. Create Virtual Environment
```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
FLASK_ENV=development
DATABASE_URL=sqlite:///mentora.db
JWT_SECRET_KEY=your-super-secret-key-change-this

# Razorpay Configuration (from https://razorpay.com/dashboard)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-secret

# Gmail Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
```

**Note**: For Gmail, generate an App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the generated password and use it in `.env`

### 5. Initialize Database
```bash
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

### 6. Run Flask Server
```bash
python app.py
```

Server will start at `http://localhost:5000`

### 7. Test Backend
```bash
# Test health endpoint
curl http://localhost:5000/health

# Should return: {"status": "ok"}
```

**Default Admin Credentials**:
- Email: `admin@mentora.com`
- Password: `admin123`

---

## Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd ../mentora-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key-id
```

### 4. Start Development Server
```bash
npm start
```

Application will open at `http://localhost:3000`

---

## Testing the Platform

### 1. Student Signup & Flow
1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Select "I'm a Student"
4. Fill in details and submit
5. You'll be redirected to Student Dashboard
6. Click "Browse Mentors" to see approved mentors
7. Click "Contact" on a mentor to send a message

### 2. Mentor Signup & Approval Flow
1. Click "Sign Up" and select "I'm a Mentor"
2. Fill in basic details
3. You'll be redirected to Mentor Profile Setup
4. Complete your profile (bio, expertise, rate, etc.)
5. Click "Save Profile"
6. You'll see "Pending Payment" status
7. Click "Complete Payment"
8. Use Test Razorpay Credentials:
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Date: Any future date
9. After successful payment, status becomes "Pending Approval"
10. Admin must approve you

### 3. Admin Approval
1. Login as admin: `admin@mentora.com` / `admin123`
2. Click "Admin Panel"
3. View pending mentors
4. Click "Approve" or "Reject"
5. Once approved, mentor profile becomes visible to students

### 4. Student Contacts Mentor
1. First, login as student
2. Browse mentors
3. Click on an approved mentor's profile
4. Click "Contact" and send a message
5. An email is sent to the mentor with your details and message

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user

### Mentors
- `POST /api/mentors/initiate-payment` - Start payment for registration
- `POST /api/mentors/verify-payment` - Verify payment and activate mentor
- `GET /api/mentors/{id}` - Get mentor details
- `PUT /api/mentors/profile` - Update mentor profile
- `GET /api/mentors/approved` - List approved mentors

### Students
- `GET /api/students/dashboard` - Get student dashboard
- `GET /api/students/mentors` - Browse mentors (with filters)
- `POST /api/students/contact-mentor` - Send message to mentor
- `GET /api/students/contacts` - View your sent contacts

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/pending-mentors` - List pending approvals
- `POST /api/admin/mentors/{id}/approve` - Approve mentor
- `POST /api/admin/mentors/{id}/reject` - Reject mentor
- `GET /api/admin/users` - List all users
- `GET /api/admin/transactions` - View all payments

---

## Production Deployment

### Backend (Heroku)

1. **Prepare for Deployment**
```bash
pip freeze > requirements.txt
git add -A
git commit -m "Setup deployment"
```

2. **Create Heroku App**
```bash
heroku create your-mentora-app
```

3. **Add PostgreSQL Database**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Set Environment Variables**
```bash
heroku config:set FLASK_ENV=production
heroku config:set JWT_SECRET_KEY=your-prod-secret-key
heroku config:set RAZORPAY_KEY_ID=your-prod-key
heroku config:set RAZORPAY_KEY_SECRET=your-prod-secret
heroku config:set MAIL_USERNAME=your-email@gmail.com
heroku config:set MAIL_PASSWORD=your-app-password
```

5. **Create Procfile**
```bash
echo "web: gunicorn app:create_app()" > Procfile
pip install gunicorn
```

6. **Deploy**
```bash
git push heroku main
```

### Frontend (Vercel/Netlify)

1. **Build for Production**
```bash
npm run build
```

2. **Deploy to Vercel**
```bash
npm i -g vercel
vercel
```

3. **Set Environment Variables in Vercel Dashboard**
- `REACT_APP_API_URL=your-backend-url`
- `REACT_APP_RAZORPAY_KEY_ID=your-key`

---

## Troubleshooting

### Port Already in Use
```bash
# Backend (Flask) - Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Frontend (React) - Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Database Reset
```bash
rm mentora.db
python app.py  # This recreates the database
```

### Email Not Sending
1. Check `.env` credentials are correct
2. Ensure Gmail 2FA is enabled
3. Generate App Password (not regular password)
4. Check spam/trash folders

### Razorpay Payment Issues
1. Verify keys in `.env` are correct
2. Ensure test mode is enabled
3. Use test card: `4111 1111 1111 1111`

---

## Features Implemented

✅ User Authentication (Student, Mentor, Admin)
✅ Mentor Payment Integration (Razorpay)
✅ Mentor Approval System (Admin)
✅ Student Dashboard
✅ Browse & Search Mentors
✅ Contact Mentor (Email)
✅ Mentor Profile Management
✅ Admin Dashboard
✅ Email Notifications
✅ Responsive Design

---

## Future Enhancements

- Video calling integration
- Review & Rating system
- Chat messaging
- Session scheduling
- Certificate generation
- Analytics dashboard
- Mobile app

---

## Support

For issues or questions:
- Check the API documentation above
- Review the code comments
- Check browser console for frontend errors
- Check Flask console for backend errors

---

## License

This project is open source and available under the MIT License.
