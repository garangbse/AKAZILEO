# Deployed Version Access



 
# ALL WILL LOAD AFTER 1 MINUTE(DUE TO RENDER SPIN DOWN)




## Live URLs

- **Frontend**: https://akazileoapp-aw28fi50z-garangbses-projects.vercel.app/
- **Backend API**: https://akazileo-backend.onrender.com

## Authentication

The deployed version uses the same authentication as the local development environment:

1. **Sign Up** — Create a new account via the Sign Up page
2. **Login** — Sign in with your email and password
3. **Roles** — Users can be either "worker" or "employer" (assigned during signup or by admin)

## ⚠️ Performance Limitations

**Important:** The backend is hosted on Render's free tier with auto spin-down enabled.

- **Cold Start**: The backend takes approximately **1+ minutes to boot** on first request after inactivity due to Render's spin-down feature
- **Request Latency**: Subsequent requests may also be slower than local development
- **Workaround**: Keep the app in use or wait for the backend to initialize on first request

**Recommended**: For production use, consider upgrading Render to a paid tier to prevent spin-down.

## Troubleshooting

**Frontend won't load or shows errors:**
- Clear your browser cache (Ctrl+Shift+Delete)
- Try a different browser

**API requests timing out or returning 502:**
- Wait 1-2 minutes for the backend to boot up
- Check [Render Dashboard](https://dashboard.render.com) to see backend status
- Refresh the page and try again

**Authentication issues:**
- Verify your credentials
- Try signing up with a new account if login fails
- Check browser console (F12) for error details