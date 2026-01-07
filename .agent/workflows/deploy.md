---
description: How to deploy the Love Story Runner game
---

# Deployment Guide

Since **Love Story Runner** is a static web application (HTML, CSS, and Vanilla JavaScript), you can host it for free on many platforms.

## 1. Local Development (Optional)
To run the game locally with a local server (recommended for development):
1. Open a terminal in the project directory.
2. Run one of the following:
   - **Python**: `python -m http.server 8000`
   - **Node.js**: `npx live-server`
3. Visit `http://localhost:8000` in your browser.

## 2. GitHub Pages (Free & Recommended)
1. Initialize a Git repository: `git init`.
2. Push your code to a new GitHub repository.
3. Go to the repository **Settings** on GitHub.
4. Navigate to **Pages** in the sidebar.
5. Under **Build and deployment**, select the `main` branch and `/ (root)` folder.
6. Click **Save**. Your game will be live at `https://your-username.github.io/your-repo-name/`.

## 3. Vercel or Netlify (Fast & Easy)
1. Go to [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com).
2. Login and select **"Add New Project"**.
3. Import your GitHub repository or **drag and drop** the `Temple run` folder into their dashboard.
4. They will automatically detect the static files and provide a production URL.

## 4. Manual Hosting
Simply upload all files in the `Temple run` directory to any web hosting provider's public folder (usually `public_html`).
