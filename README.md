# Recruiter.ai

Resume-first job matching for Chrome.

Recruiter.ai analyzes resume text locally in the browser, builds a candidate profile, and matches that profile against specific public job postings. It is designed to help job seekers focus on higher-fit opportunities, inspect freshness and ghost-job risk signals, and move from resume to targeted search faster.

## Install Recruiter.ai

**Recommended:** install the published extension from the Chrome Web Store:

https://chromewebstore.google.com/detail/recruiterai/hhlignadhoncjciohnkejonccilhmhde

The Chrome Web Store is the primary distribution channel for normal users. GitHub is the source-code and manual-install channel.

## Features

### Resume-first matching
- Import DOCX or TXT resumes
- Paste resume text directly
- Extract visible text from the current tab only when the user requests it
- Local candidate-profile generation

### Exact job matching
- Specific job requisitions rather than generic company listings
- Direct application links
- Job-source identification
- Posting freshness indicators

### Match intelligence
- Match score
- Ghost-job risk score
- Posting freshness
- Resume alignment analysis
- Missing-skill / keyword suggestions

### Privacy-focused design
- Resume parsing is performed locally in Chrome
- Candidate profile data is stored locally with `chrome.storage.local`
- No Recruiter.ai user account is required
- Resume text is not uploaded to SALT19 servers
- Current-page extraction happens only after an explicit user action

Privacy policy: https://salt19.com/recruiter-ai/privacy.html

## Current permissions

Recruiter.ai intentionally requests a narrow permission set:

- `storage` — retains the locally generated candidate profile on the device
- `activeTab` — grants temporary access to the active page after the user invokes the extension
- `scripting` — reads visible page text when the user explicitly chooses **Extract current tab**
- `https://remoteok.com/*` — retrieves public job-listing data from RemoteOK
- `https://www.arbeitnow.com/*` — retrieves public job-listing data from Arbeitnow

Recruiter.ai does not execute remotely hosted JavaScript.

## How matching works

1. Import or paste resume/profile text.
2. Recruiter.ai extracts skills, industries, likely role families, seniority signals, and other candidate-profile information locally.
3. Public job feeds are retrieved from supported job sources.
4. Job data is compared locally against the candidate profile.
5. Results are ranked and displayed with match and ghost-job risk signals.

When live API results are insufficient, Recruiter.ai can offer user-initiated Google search links assembled from role, skill, location/work-mode, or company terms. Those searches are opened only when the user chooses them and are then subject to Google's own privacy practices.

## Manual / developer installation

Use this only if you want the GitHub source build instead of the Chrome Web Store release.

1. Download the current source ZIP: https://github.com/GabrielAllit1/Recruiter.ai/archive/refs/heads/main.zip
2. Extract `Recruiter.ai-main.zip` completely.
3. Confirm `Recruiter.ai-main` directly contains `manifest.json`, `popup.html`, `popup.js`, `styles.css`, and `icons/`.
4. Open `chrome://extensions`.
5. Enable **Developer mode**.
6. Click **Load unpacked**.
7. Select the extracted `Recruiter.ai-main` folder that directly contains `manifest.json`.

Do not attempt to load the ZIP itself.

## Repository layout

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

## Tech stack

- JavaScript
- HTML
- CSS
- Chrome Extension APIs
- Local resume parsing
- Resume-to-job scoring logic

## Project status

Active development.

Current focus:
- Faster job discovery
- Better job-post accuracy
- Improved matching precision
- Clearer privacy and permission boundaries
- Enhanced ghost-job detection

## Disclaimer

Recruiter.ai provides informational job-matching assistance. Match scores, ghost-risk estimates, salary ranges, freshness signals, and recommendations are predictive or heuristic indicators and are not guarantees of hiring outcomes, compensation, or job availability.

## Author

Gabriel Allit  
SALT19 LLC

Built to help candidates spend less time searching and more time pursuing relevant opportunities.
