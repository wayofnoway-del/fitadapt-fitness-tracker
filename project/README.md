# FitAdapt - Fitness Goal Tracker MVP

A complete fitness tracking application built with React, TypeScript, Vite, and Supabase.

## 🎯 Features

### ✅ Complete MVP Functionality

**Authentication**
- User signup with email verification
- Secure login/logout
- Protected routes (authentication required)

**Dashboard**
- 6 stat cards: Total Workouts, Distance, Duration, Calories, Active Goals, Streak
- Active goals with progress bars
- Recent workouts table
- Real-time updates

**Goals Management**
- Create, edit, and delete fitness goals
- Track progress with visual progress bars
- Set target values, units, and deadlines
- Update progress on goals
- Multiple goal types: Distance, Weight, Duration, Frequency

**Workout Logging**
- Log workouts with details: Date, Type, Duration, Distance, Calories, Intensity
- Workout history table with filters
- Edit and delete workouts
- Filter by workout type (Running, Cycling, Gym, Swimming, Yoga, Other)
- Intensity tracking (Light, Moderate, Intense)

**Profile Management**
- Update personal information: Name, Age, Weight, Height
- Set fitness level (Beginner, Intermediate, Advanced)
- Select preferred activities

## 🛠️ Tech Stack

- **Frontend:** React 18.3 + TypeScript
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Routing:** React Router v6

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Getting Started

### 1. Access the Application

Open your browser and navigate to: **http://localhost:5173/**

### 2. Create an Account

1. Click "Sign up" on the login page
2. Enter your email and password (minimum 6 characters)
3. Check your email for verification link from Supabase
4. Click the verification link
5. Return to the app and login

### 3. Set Up Your Profile

1. Navigate to the **Profile** page
2. Fill in your information:
   - Full Name
   - Fitness Level
   - Age, Weight, Height
   - Preferred Activities
3. Click "Save Profile"

### 4. Create Your First Goal

1. Go to the **Goals** page
2. Click "New Goal"
3. Fill in:
   - Title (e.g., "Run 5km")
   - Description (optional)
   - Goal Type
   - Target Value
   - Unit (e.g., km, kg, sessions)
   - Deadline (optional)
4. Click "Create Goal"

### 5. Log Your First Workout

1. Go to the **Workouts** page
2. Click "Log Workout"
3. Fill in:
   - Date
   - Workout Type
   - Duration (minutes)
   - Distance (km) - optional
   - Calories - optional
   - Intensity
   - Notes - optional
4. Click "Log Workout"

### 6. Track Your Progress

1. Return to **Dashboard** to see your stats updated
2. View active goals with progress bars
3. See recent workouts
4. Update goal progress by clicking "Update Progress" on any goal

## 📂 Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # Navigation and app layout
│   │   └── ProtectedRoute.tsx   # Authentication guard
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication state management
│   ├── lib/
│   │   └── supabase.ts          # Supabase client and TypeScript types
│   ├── pages/
│   │   ├── Login.tsx            # Login page
│   │   ├── Signup.tsx           # Signup page
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Goals.tsx            # Goals management
│   │   ├── Workouts.tsx         # Workout logging and history
│   │   └── Profile.tsx          # User profile settings
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles (Tailwind)
├── .env                         # Environment variables (Supabase)
├── package.json                 # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## 🗄️ Database Schema

The app uses Supabase with the following tables:

### profiles
- User profile information
- Fitness level, age, weight, height
- Preferred activities

### goals
- User fitness goals
- Progress tracking
- Target values and deadlines

### workouts
- Workout history
- Type, duration, distance, intensity
- Calories and notes

## 🔐 Environment Variables

Required variables in `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are already configured for this project.

## 🎨 UI/UX Features

- **Responsive Design:** Works on desktop, tablet, and mobile
- **Loading States:** Spinners during data fetching
- **Error Handling:** User-friendly error messages
- **Form Validation:** Client-side validation on all forms
- **Visual Feedback:** Success/error messages
- **Progress Bars:** Visual goal progress tracking
- **Color-Coded Intensity:** Easy-to-read workout intensity badges
- **Clean Navigation:** Intuitive menu with icons
- **Modern Design:** Tailwind CSS with blue primary color

## 📊 Key Functionalities

### Dashboard Statistics

The dashboard calls a Supabase function `get_user_fitness_summary` that calculates:
- Total workouts logged
- Total distance covered
- Total duration exercised
- Total calories burned
- Number of active goals
- Current streak (workouts in last 7 days)

### Goal Progress Tracking

- Visual progress bars show current/target values
- Percentage completion displayed
- Easy progress updates via modal dialog
- Automatic status updates when target reached

### Workout Filtering

- Filter by workout type
- View all workouts or specific types
- Sort by date (most recent first)
- Edit or delete any workout

## 🚧 Known Limitations (MVP)

- No AI-generated challenges (available in add-ons)
- No local gym finder (available in add-ons)
- No advanced analytics/charts (available in add-ons)
- No social features (friends, sharing)
- No notifications/reminders
- No data export

## 🔮 Future Enhancements

See `/srv/proj/outskill_hackathon/fitness_tracker_addons_guide.md` for:

1. **AI-Powered Challenges** - OpenAI integration for personalized challenges
2. **Gym Finder** - Google Places API to find nearby gyms
3. **Advanced Analytics** - Charts and trends visualization
4. **Social Features** - Friends, leaderboards, sharing
5. **Notifications** - Email and push notifications
6. **Mobile App** - React Native version

## 🐛 Troubleshooting

### App shows blank page
- Check browser console (F12) for errors
- Verify Supabase credentials in `.env`
- Ensure dev server is running

### Can't login after signup
- Check email for verification link
- Verify email in Supabase dashboard (Authentication → Users)
- Try password reset if needed

### Stats showing 0 despite having data
- Verify Supabase function `get_user_fitness_summary` exists
- Check database tables have data
- Check browser console for errors

### Changes not reflecting
- Hard refresh browser (Ctrl + Shift + R)
- Check if dev server reloaded
- Restart dev server if needed

## 📝 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
```

### Making Changes

1. Edit files in `src/` directory
2. Changes hot-reload automatically
3. Check browser console for errors
4. Use browser dev tools to inspect elements

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Tutorial](https://reactrouter.com/en/main)

## 📄 License

This project is part of the Outskill Hackathon.

## 🤝 Contributing

This is an MVP. To add features:

1. Follow the add-ons guide for pre-built features
2. Create new components in `src/components/`
3. Add new pages in `src/pages/`
4. Update routing in `src/App.tsx`
5. Test thoroughly before deploying

## 🎉 Congratulations!

You've successfully built a complete fitness tracking MVP! 💪

**Next Steps:**
1. Use the app to track your own fitness
2. Share with friends for feedback
3. Add advanced features from the add-ons guide
4. Deploy to production (Netlify, Vercel, etc.)

---

**Built with ❤️ for the Outskill Hackathon**
