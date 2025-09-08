# MeHelper - Git Setup and Push to GitHub
# Run these commands in PowerShell after installing Git

# 1. Navigate to your project directory
cd "d:\Business\MeHelper"

# 2. Initialize Git repository
git init

# 3. Add all files to Git
git add .

# 4. Create initial commit
git commit -m "Initial commit: MeHelper - AI-powered medical triage system

- Complete web application with Flask backend
- AI integration with GPT-OSS-20B and Gemini Vision
- 8-level comprehensive medical triage system
- Image analysis for medical symptoms
- Offline-first design for remote areas
- Progressive web app with responsive design
- Location sharing and emergency features
- Professional README documentation"

# 5. Rename branch to main (if needed)
git branch -M main

# 6. Add remote GitHub repository
git remote add origin https://github.com/George-Tharwat-Thabet/MeHelper.git

# 7. Push to GitHub
git push -u origin main

# Alternative: If you get authentication errors, you might need to:
# - Set up GitHub authentication (Personal Access Token or SSH)
# - Or use GitHub Desktop application
# - Or use GitHub CLI: gh repo create --source=. --public --push

echo "Setup complete! Your MeHelper project should now be on GitHub."