# 🚀 Smart Placement Prep

> A professional AI-powered skill gap analysis tool and personalized study roadmap generator.

## 📖 What is this App?

Smart Placement Prep is a lightweight, single-page dashboard designed to help job seekers align their skills with specific roles. By comparing your resume against a target job description, the app assesses your readiness and builds a customized, week-by-week study plan to help you confidently prepare for interviews.

---

## 🧪 Try it Out: Demo Files

If you just want to test how the app works, we've provided demo files to see it in action instantly!

1. **Demo Resume**: Use this file for the "Resume Upload" section.
   - 📄 [`assets/demo_resume.txt`](assets/demo_resume.txt)
2. **Demo Job Description**: Open this file, copy all the text, and paste it into the "Target Job Description" box.
   - 📄 [`assets/demo_job_description.txt`](assets/demo_job_description.txt)

---

## 💻 How to Use the App

1. **Upload Your Resume**: Click on the dashed upload zone and select your resume (PDF, DOCX, or TXT), or simply drag and drop the file directly into the box. *(For testing, upload the `demo_resume.txt` file)*
2. **Paste the Job Description**: Copy the full text of the job description you are aiming for and paste it into the text area. *(For testing, use the contents of `demo_job_description.txt`)*
3. **Analyze**: Click the **Generate Roadmap** button.
4. **Review Your Results**: The app will process the inputs and automatically generate:
   - Your **Match Score** (a percentage showing how well you fit the role).
   - **Matched Skills** (your current strengths that align with the job).
   - **Skills to Develop** (areas requiring focus before your interview).
   - A **4-week Action Plan** (providing week-by-week specific steps to bridge your skill gaps).

---

## 🛠️ How to Run Locally

Because this is a pure frontend application, there are no complicated build steps or framework configurations.

**Option 1: Direct File Open (Easiest)**
Navigate to the project folder in your computer and double-click `index.html` to open it in your web browser. 

**Option 2: Local Server (Recommended for developers)**
If you have Node.js or Python installed, you can start a clean local server in the project folder via terminal:
- **Node.js**: `npx -y serve .` (then visit `http://localhost:3000`)
- **Python**: `python -m http.server 3000` (then visit `http://localhost:3000`)

---

## 🌍 How to Share the App

Since this uses plain HTML/CSS/JS, sharing it online for free is incredibly easy:
1. **GitHub Pages**: Upload this folder to a GitHub repository, go to `Settings` > `Pages`, and select your `main` branch. GitHub will give you a live URL instantly.
2. **Vercel / Netlify Drop**: You can literally drag and drop the `smart-placement-prep` folder into [Netlify Drop](https://app.netlify.com/drop) to publish a live, shareable link in 5 seconds without even making an account.

---

## 🏗️ Technology Stack

- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS3 (Professional SaaS-inspired "Light" Theme)
- **Logic**: Vanilla JavaScript (ES5+, Zero external dependencies)

---

## 🔮 Hackathon Vision

This prototype demonstrates the core UX and conceptual flow. Future production milestones include:
- **Real LLM Integration**: Connecting the OpenAI/Gemini API to perform genuine semantic text analysis between the resume and job posting.
- **Dynamic Resource Links**: Auto-generating links to specific Coursera, Udemy, or LeetCode resources corresponding to the exact skills the user is missing.

---
*Built with ❤️ for the Hackathon.*
