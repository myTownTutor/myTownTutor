# Mentora - Mentorship Platform

A complete, production-ready mentorship platform connecting students with expert mentors. Features user authentication, payment processing, mentor approval workflow, and responsive design.

## 🎯 Features

### For Students
- ✅ Instant signup (no approval needed)
- ✅ Browse and search approved mentors
- ✅ Filter mentors by expertise, experience, and rate
- ✅ View detailed mentor profiles
- ✅ Contact mentors via social links or direct message
- ✅ Track contacts sent

### For Mentors
- ✅ Complete onboarding with profile setup
- ✅ Payment processing (Razorpay UPI)
- ✅ Approval workflow by admin
- ✅ Live profile visibility once approved
- ✅ Receive student inquiries via email
- ✅ Edit profile anytime

### For Super Admin
- ✅ Dashboard with platform stats
- ✅ Review and approve/reject pending mentors
- ✅ Manage all users (CRUD operations)
- ✅ View payment transactions
- ✅ See all student-mentor contacts

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python 3.8+, Flask 2.3 |
| Frontend | React 18, React Router 6 |
| Database | SQLite (dev), PostgreSQL (prod) |
| Payment | Razorpay UPI |
| Styling | CSS3 with Flexbox/Grid |
| Email | SMTP (Gmail) |
| Auth | JWT (JSON Web Tokens) |

## 📁 Project Structure

```
mentora/
├── mentora-backend/
│   ├── app.py              # Flask app entry point
│   ├── config.py           # Configuration
│   ├── models.py           # Database models
│   ├── auth.py             # Authentication routes
│   ├── mentor_routes.py    # Mentor endpoints
│   ├── student_routes.py   # Student endpoints
│   ├── admin_routes.py     # Admin endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
│
├── mentora-frontend/
│   ├── public/
│   │   └── index.html      # HTML entry point
│   ├── src/
│   │   ├── App.jsx         # Main app component
│   │   ├── index.js        # React entry point
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Context API
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS files
│   │   └── utils/          # Helper functions
│   ├── package.json        # NPM dependencies
│   └── .env.example        # Environment variables template
│
├── SETUP.md               # Detailed setup guide
├── API_DOCS.md           # API documentation
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git
- Razorpay account
- Gmail account (for emails)

### Backend Setup
```bash
# Navigate to backend
cd mentora-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run server
python app.py
```

Server runs at `http://localhost:5000`

### Frontend Setup
```bash
# Navigate to frontend
cd mentora-frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm start
```

App opens at `http://localhost:3000`

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup and deployment guide
- **[API_DOCS.md](./API_DOCS.md)** - Complete API endpoint documentation

## 🔐 Default Admin Credentials

After setup, admin account is created automatically:
- **Email**: `admin@mentora.com`
- **Password**: `admin123`

⚠️ **Change this password in production!**

## 💳 Payment Integration (Razorpay)

### Test Mode Setup
1. Go to https://razorpay.com/dashboard
2. Get your API keys
3. Add to `.env`:
```
RAZORPAY_KEY_ID=rzp_test_ABC123...
RAZORPAY_KEY_SECRET=your_secret_key
```

### Test Card
- **Number**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits
- **Date**: Any future date

## 📧 Email Configuration

### Gmail Setup
1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
```
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
```

## 🎯 User Flows

### Student Flow
1. Sign up with email and password
2. Dashboard opens with options to browse mentors
3. Search and filter mentors
4. View detailed mentor profiles
5. Send message directly (redirects to social links)
6. View all contacts sent

### Mentor Flow
1. Sign up with email and password
2. Redirected to profile setup
3. Fill in bio, expertise, rates, social links
4. Redirected to payment page
5. Complete Razorpay payment
6. Profile status becomes "Pending Approval"
7. Admin reviews and approves
8. Once approved, profile visible to students
9. Receive email notifications for student inquiries

### Admin Flow
1. Login with super admin credentials
2. View dashboard with platform stats
3. See list of pending mentor approvals
4. Approve or reject with reason
5. Manage users (view, edit, delete)
6. View all transactions
7. See all student-mentor contacts

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

### Mentors
```
POST   /api/mentors/initiate-payment
POST   /api/mentors/verify-payment
GET    /api/mentors/profile
PUT    /api/mentors/profile
GET    /api/mentors/approved
GET    /api/mentors/{id}
```

### Students
```
GET    /api/students/dashboard
GET    /api/students/mentors
POST   /api/students/contact-mentor
GET    /api/students/contacts
```

### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/pending-mentors
POST   /api/admin/mentors/{id}/approve
POST   /api/admin/mentors/{id}/reject
GET    /api/admin/users
DELETE /api/admin/users/{id}
GET    /api/admin/transactions
```

See [API_DOCS.md](./API_DOCS.md) for detailed documentation.

## 🎨 Design

### Color Scheme
- **Primary**: #0066CC (Professional Blue)
- **Secondary**: #F0F4F8 (Light Gray)
- **Success**: #22C55E (Green)
- **Danger**: #EF4444 (Red)

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px
- Flexbox and CSS Grid layouts
- Touch-friendly buttons and inputs

## 📈 Performance

- JWT-based stateless authentication
- Paginated API responses
- Database query optimization
- Frontend component memoization
- Lazy loading for images

## 🔒 Security

- ✅ Password hashing (Werkzeug)
- ✅ JWT token authentication
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Email verification needed (future)
- ⚠️ Add HTTPS in production
- ⚠️ Add rate limiting
- ⚠️ Add CSRF protection

## 🚢 Deployment

### Backend (Heroku)
```bash
cd mentora-backend
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
cd mentora-frontend
npm run build
vercel deploy dist
```

See [SETUP.md](./SETUP.md) for detailed deployment guide.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# kill process on port
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
kill -9 <PID>
```

### Database Issues
```bash
# Reset database
rm mentora.db
python app.py  # Recreates database
```

### Email Not Sending
- Verify Gmail app password (not regular password)
- Check spam folder
- Ensure MAIL_USERNAME and MAIL_PASSWORD are correct

### Payment Issues
- Verify Razorpay keys in `.env`
- Ensure test card format is correct
- Check browser console for errors

See [SETUP.md](./SETUP.md#troubleshooting) for more help.

## 📝 Features Checklist

### Authentication
- [x] User registration (student/mentor)
- [x] Email/password login
- [x] JWT token generation
- [x] Role-based access control
- [x] Session management

### Mentor System
- [x] Mentor profile creation
- [x] Profile image upload (URL)
- [x] Expertise and experience tracking
- [x] Hourly rate setting
- [x] Social media links
- [x] Approval workflow
- [x] Rejection with reason

### Payment
- [x] Razorpay integration
- [x] Order creation
- [x] Payment verification
- [x] Transaction tracking
- [x] Email confirmation

### Student Features
- [x] Browse mentors
- [x] Search by name/expertise
- [x] Filter by experience/rate
- [x] View mentor details
- [x] Contact mentor
- [x] Email notification to mentor
- [x] Track contacts sent

### Admin Features
- [x] Dashboard with stats
- [x] Pending mentor reviews
- [x] Approve/reject mentors
- [x] User management
- [x] Transaction viewing
- [x] Contact tracking

### Frontend
- [x] Responsive design
- [x] Mobile-friendly
- [x] Modern UI with cards
- [x] Navigation menu
- [x] Form validation
- [x] Loading states
- [x] Error handling

## 🔮 Future Enhancements

- [ ] Video calling (Jitsi/Twilio)
- [ ] Real-time chat
- [ ] Session scheduling calendar
- [ ] Review and rating system
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Profile image upload (S3/Cloudinary)
- [ ] Analytics dashboard
- [ ] Notification preferences
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Certificate generation
- [ ] Group mentoring sessions
- [ ] API rate limiting
- [ ] Advanced search filters

## 📞 Support

For issues or questions:
1. Check [SETUP.md](./SETUP.md) for setup help
2. Review [API_DOCS.md](./API_DOCS.md) for API details
3. Check error messages in browser console
4. Review Flask server logs
5. Create an issue on GitHub

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ using Flask and React

## 🙏 Acknowledgments

- Razorpay for payment processing
- Flask for backend framework
- React for frontend library
- Inspired by platforms like LinkedIn, Indeed, and Facebook

---

**Happy Mentoring! 🚀**
