# Recruiter.ai

Resume-first job matching for Chrome.

Recruiter.ai analyzes your resume locally, extracts skills and experience, and matches you against specific job postings instead of generic company-level listings. The goal is to help job seekers focus on real opportunities, prioritize high-fit positions, and avoid wasting time on stale or low-quality postings.

## Features

### Resume-First Matching
- Import DOCX resumes
- Import TXT resumes
- Paste resume text directly
- Extract profile information from the current tab
- Local parsing inside the browser

### Exact Job Matching
- Matches against individual job requisitions
- Company-specific results
- Direct application links
- Job-source identification
- Freshness indicators

### Match Intelligence
- Match Score
- Ghost Job Risk Score
- Posting Freshness
- Resume Alignment Analysis
- Missing Skill Identification

### Privacy Focused
- Local resume parsing
- No resume uploads required
- No external storage of resume data
- User-controlled workflow

## Why Recruiter.ai?

Most job boards return thousands of results based on keywords alone. Recruiter.ai starts with the candidate profile first and then evaluates jobs against the candidate's actual experience, skills, certifications, and background.

This produces:
- Better-fit opportunities
- Less application spam
- Faster job searches
- Improved interview conversion rates

## Current Workflow

### Step 1 — Import your resume
- DOCX
- TXT
- Paste text
- Extract current tab

### Step 2 — Build Candidate Profile
Recruiter.ai extracts:
- Skills
- Certifications
- Experience
- Technologies
- Industry keywords
- Role alignment

### Step 3 — Review Matches
Each result includes:
- Job title
- Company
- Source
- Match %
- Ghost risk
- Posting freshness
- Apply link

## Installation — Chrome

> Chrome extensions installed from GitHub must be extracted first. Do **not** try to load the ZIP file itself in Chrome.

1. Download the current source ZIP: https://github.com/GabrielAllit1/Recruiter.ai/archive/refs/heads/main.zip
2. Extract `Recruiter.ai-main.zip` completely.
3. Confirm the extracted `Recruiter.ai-main` folder directly contains `manifest.json`, `popup.html`, `popup.js`, `styles.css`, and the `icons` folder.
4. Open Chrome and navigate to `chrome://extensions`.
5. Enable **Developer mode**.
6. Click **Load unpacked**.
7. Select the extracted `Recruiter.ai-main` folder — the folder that directly contains `manifest.json`.
8. Pin Recruiter.ai if you want quick access from the Chrome toolbar.

If Chrome reports that the manifest is missing or unreadable, the wrong folder was selected. Select the extracted folder that directly contains `manifest.json`, not the ZIP file or a parent directory.

## Repository Layout

```text
Recruiter.ai/
├── manifest.json
├── popup.html
├── popup.js
├── styles.css
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
└── LICENSE
```

The installable extension is intentionally kept at the repository root so GitHub's generated source ZIP can be extracted and loaded directly without navigating through nested package folders.

## Tech Stack

- JavaScript
- HTML
- CSS
- Chrome Extension APIs
- Local Resume Parsing
- Resume-to-Job Scoring Engine

## Roadmap

### Version 1
- Resume Import
- Candidate Profile Generation
- Exact Job Matching
- Ghost Job Risk
- Direct Apply Links

### Version 2
- Resume Optimization Suggestions
- ATS Scoring
- LinkedIn Profile Matching
- Cover Letter Assistance
- Interview Preparation

### Version 3
- Recruiter Intelligence
- Company Research
- Salary Analysis
- Hiring Velocity Signals
- AI Career Agent

## Project Status

Active Development

Current focus:
- Faster job discovery
- Better job-post accuracy
- Improved matching precision
- Enhanced ghost-job detection

## Disclaimer

Recruiter.ai provides informational job-matching assistance. Match scores, ghost-risk estimates, and recommendations are predictive indicators and should not be considered guarantees of hiring outcomes.

## Author

Gabriel Allit  
SALT19 LLC

Built to help candidates spend less time searching and more time interviewing.
