  # AKAZILEO Frontend

A modern React + TypeScript web application for task management and freelance work. Connect with workers and employers, post or apply for tasks, and build your professional portfolio.

## 🚀 Getting Started

### Running the Application

1. Install dependencies:
   ```bash
   npm i
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5175`

**Note:** Ensure the backend is running on `http://127.0.0.1:5001` before using the app.

---

## ✨ Features

### 🔐 Authentication

#### Login
- Sign in with your email and password
- Secure JWT token-based authentication
- Session persists across page refreshes
- Automatic redirect to login if session expires

#### Register
- Create a new account with username, email, and password
- Passwords are securely hashed on the backend
- Choose your role: **Worker** or **Employer**
- Start with an empty profile - customize it later!

---

### 📊 Dashboard

Your personalized home page showing:
- **Quick Statistics**: Overview of your activity
- **Recent Activity**: Tasks you've posted or applied for
- **Recommended Tasks**: Personalized task suggestions based on your role
- **Quick Actions**: Easy access to common tasks (post a task, view marketplace, etc.)

---

### 🛒 Task Marketplace

Browse and discover available tasks posted by employers.

**Features:**
- 📋 **Browse All Tasks**: View all available tasks with descriptions, payment, and status
- 🔍 **Filter & Search**: Find tasks that match your skills and interests
- 💰 **View Payment**: See the payment amount for each task
- 📅 **Due Dates**: Check task deadlines
- ✅ **Task Status**: See if tasks are open, assigned, or completed
- 📤 **Apply for Tasks**: Apply to tasks you're interested in

**How it works:**
1. Browse the task marketplace
2. Click on a task to view full details
3. Click "Apply" to submit your application
4. Wait for the employer to accept or reject your application
5. Once accepted, start working and submit your work

---

### 📝 Task Details

View complete information about a specific task.

**What you can see:**
- Full task description and requirements
- Payment amount and payment terms
- Task status (Open, Assigned, Completed, Cancelled)
- Due date and time remaining
- Employer information (name, avatar, rating)
- Application history (if you applied)

**Actions:**
- **Apply for Task**: Submit your application to work on this task
- **View Employer Profile**: Click on employer name to see their profile
- **Track Application**: See the status of your application (pending, accepted, rejected)

---

### 💼 Portfolio

Showcase your work and projects (for Workers).

**Features:**
- 📸 **Add Portfolio Items**: Upload projects with descriptions and images
- 🔗 **Project Links**: Add links to live projects, GitHub repos, or portfolio websites
- 🖼️ **Media Upload**: Include beautiful images or screenshots of your work
- 📝 **Detailed Descriptions**: Write compelling descriptions of your projects
- 🗑️ **Manage Items**: Edit or delete portfolio items anytime
- 👀 **Public Display**: Your portfolio is visible to employers when they view your profile

**How it works:**
1. Go to Portfolio section
2. Click "Add New Project"
3. Fill in project title, description, and link
4. Upload project image/screenshot (converted to base64)
5. Save and it appears in your portfolio instantly
6. Employers can see your portfolio when browsing your profile

---

### 📢 Feed / Posts

A social feed where users share updates, work samples, and connect with the community.

**Features:**
- 📝 **Create Posts**: Share text updates, project announcements, or ask for feedback
- 🖼️ **Media Uploads**: Include images in your posts
- ❤️ **Like Posts**: Show appreciation for others' work
- 💬 **Comments**: Engage with the community by commenting on posts
- 👁️ **View Activity**: See what others in the community are working on
- ⏰ **Timestamps**: See when posts were created

**How it works:**
1. Go to Feed section
2. Click the post creation box
3. Write your message or update
4. Optionally attach an image
5. Click "Post" to share with the community
6. Like and comment on other posts to engage
7. Click on any user's name to view their profile

---

### 👤 Profile

Your professional profile that others can view and employers use to evaluate you.

**Profile Information Displayed:**
- 👤 **Profile Picture**: Your avatar (visible as base64 image)
- 📛 **Username**: Your unique identifier
- 👔 **Role Badge**: Shows if you're a Worker or Employer
- 📝 **Bio**: Your professional bio and interests
- 📊 **Stats**: Tasks completed, portfolio items, etc.
- 💼 **Portfolio Section**: (For Workers) All your portfolio items are displayed here

**Edit Your Profile:**
1. Click "Edit Profile" on your profile card
2. Update any of the following:
   - **Username**: Change your display name
   - **Profile Picture**: Upload a new profile photo (base64 image)
   - **Bio**: Write or update your professional bio
3. Click "Save" to apply changes
4. Changes take effect immediately everywhere in the app

**View Other Profiles:**
- Click on any username in the feed or marketplace to view their profile
- See their portfolio items, bio, and rating
- Click "View" on portfolio items to visit their projects
- Connect and network with other users

---

### ⚙️ Settings

Manage your account preferences and security.

**Available Settings:**
- 🔑 **Change Password**: Update your password for better security
- 🎨 **Theme Preferences**: Customize the appearance (if applicable)
- 🔔 **Notifications**: Manage notification preferences
- 📋 **Account Information**: View and update your account details
- 🚪 **Logout**: Sign out from your account

---

### 🔔 Notifications

Stay informed about important activities.

**You receive notifications for:**
- ✅ **Application Accepted**: When an employer accepts your task application
- ❌ **Application Rejected**: When an employer rejects your application
- 💬 **New Comments**: When someone comments on your posts
- ❤️ **New Likes**: When someone likes your posts
- 📢 **Task Updates**: Changes to tasks you're working on
- 👥 **Profile Views**: When employers view your profile

**View Notifications:**
- Notification bell icon in the header
- Click to see all your recent notifications
- Mark as read to clear them

---

## 🎨 User Interface & Experience

### Session Management
- **Persistent Login**: Your session is saved locally and restored when you refresh the page
- **Auto-Logout**: If your token expires, you'll be redirected to login
- **Loading State**: Shows a loading spinner while checking your session

### Search
- **Profile Search**: Search for other users by username
- **Quick Access**: Click on search results to visit their profile instantly

### Responsive Design
- 📱 Works on desktop, tablet, and mobile devices
- 🎨 Clean, modern design with intuitive navigation
- ⚡ Fast and smooth user experience with Vite

---

## 🔄 User Workflows

### For Workers

1. **Register** → Set your role to "Worker"
2. **Create Profile** → Add profile picture, bio, skills
3. **Build Portfolio** → Showcase your best work
4. **Browse Tasks** → Find tasks in the marketplace
5. **Apply for Tasks** → Submit applications to tasks you like
6. **Work on Tasks** → Once accepted, start working
7. **Submit Work** → Upload completed work/files
8. **Get Paid** → Receive payment once approved

### For Employers

1. **Register** → Set your role to "Employer"
2. **Create Profile** → Add company info and bio
3. **Post Tasks** → Submit tasks in the marketplace
4. **Review Applications** → See applications from workers
5. **Accept/Reject** → Choose workers for your tasks
6. **Monitor Progress** → Track task submissions
7. **Approve Work** → Review and approve submitted work
8. **Pay Workers** → Process payments for completed tasks

---

## 🛠️ Technical Stack

- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Lightning-fast build tool
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful, consistent icons
- **Shadcn UI Components**: Accessible, well-designed components
- **Axios**: HTTP client for API calls (wrapped in custom api service)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── App.tsx                 # Main app component
│   ├── routes.ts               # Route definitions
│   ├── components/
│   │   ├── Layout.tsx          # Main layout with sidebar
│   │   ├── AppModal.tsx        # Modal dialogs
│   │   └── ui/                 # Reusable UI components
│   ├── context/
│   │   └── AppContext.tsx      # Global app state (auth, user, modals)
│   ├── data/
│   │   └── mockData.ts         # Mock data for development
│   ├── pages/
│   │   ├── LoginPage.tsx       # Login page
│   │   ├── RegisterPage.tsx    # Registration page
│   │   ├── DashboardPage.tsx   # Home dashboard
│   │   ├── TaskMarketplacePage.tsx
│   │   ├── TaskDetailsPage.tsx
│   │   ├── PortfolioPage.tsx
│   │   ├── FeedPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── SettingsPage.tsx
│   └── styles/                 # CSS and theme files
├── services/
│   ├── api.ts                  # API client and utility functions
│   ├── task.ts                 # Task-related API calls
│   └── portfolio.ts            # Portfolio-related API calls
└── main.tsx                    # React entry point
```

---

## 🔗 API Integration

The frontend communicates with the backend API at `http://127.0.0.1:5001`

**Main Endpoints Used:**
- `POST /register` - Create new user account
- `POST /login` - Authenticate user
- `GET /me` - Get current user info
- `GET/PUT /users/<id>` - Get/update user profile
- `GET /tasks` - Get all tasks
- `GET /tasks/<id>` - Get task details
- `POST /tasks` - Create new task (employers)
- `POST /applications` - Apply for a task
- `GET /portfolio/<userId>` - Get user's portfolio
- `GET /posts` - Get feed posts
- `POST /posts` - Create new post
- And many more...

---

## 🎯 Key Features by Page

| Page | Purpose | Actions |
|------|---------|---------|
| **Login** | Authenticate users | Login with email/password |
| **Register** | Create new accounts | Sign up with role selection |
| **Dashboard** | Home & overview | View stats, quick actions |
| **Marketplace** | Browse tasks | Search, filter, apply |
| **Task Details** | View task info | Apply, contact employer |
| **Portfolio** | Showcase work | Add, edit, delete projects |
| **Feed** | Social updates | Post, like, comment |
| **Profile** | Personal page | Edit profile, view stats |
| **Settings** | Account mgmt | Change password, logout |

---

## 📝 Notes for Users

- **Image Uploads**: All images are converted to base64 and stored securely
- **Session Persistence**: Your login session is saved and restored automatically
- **Real-time Updates**: Some features update in real-time without page refresh
- **Responsive**: The app works great on mobile, tablet, and desktop
- **Dark/Light Mode**: Theme adapts to your system preferences

---

## 🚀 Tips & Best Practices

1. **Complete Your Profile**: A complete profile attracts more task opportunities
2. **High-Quality Portfolio**: Use clear, professional project images
3. **Engaging Bio**: Write a compelling bio that highlights your skills
4. **Regular Activity**: Keep the feed active with posts and updates
5. **Timely Applications**: Apply quickly when interesting tasks are posted
6. **Professional Communication**: Be clear and responsive in your interactions

---

## 🐛 Troubleshooting

### Issues?
- **Can't login?** Check that the backend is running on port 5001
- **Images not loading?** Ensure they're properly converted to base64
- **Changes not showing?** Try refreshing the page
- **COR errors?** Verify backend CORS configuration includes your frontend URL

For more help, check the main [AKAZILEO README](../README.md)
  