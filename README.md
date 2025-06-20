# Google Scholar Fetcher (Python)

A GitHub Action to automatically fetch your Google Scholar publications and save them as JSON.

## Overview

This action uses the SerpAPI service to fetch Google Scholar publications for a specified author and saves them to a JSON file in your repository. The action is scheduled to run monthly, and it will automatically commit and push any changes to the repository.

## Setup Instructions

### 1. Set up GitHub Repository Variables

Go to your repository's Settings → Secrets and variables → Actions, and set up:

**Variables (Variables tab):**
- `GOOGLE_SCHOLAR_ID`: Your Google Scholar ID (found in your profile URL)
- `GIT_USERNAME` (optional): Name to use for commits (defaults to "GitHub Action")
- `GIT_EMAIL` (optional): Email to use for commits (defaults to "action@github.com")

**Secret (Secrets tab):**
- `SERPAPI_KEY`: Your SerpAPI API key (recommended to use a secret)

### 2. Get a SerpAPI Key

1. Sign up for an account at [SerpApi](https://serpapi.com/)
2. Get your API key from your dashboard
3. Add it as a secret in your GitHub repository

### 3. Workflow Configuration

The GitHub workflow is configured to run:
- Automatically on the 1st day of each month at midnight
- Manually whenever you trigger it from the Actions tab

## JSON Data Format

The script saves publications in the following format:

```json
[
  {
    "title": "Publication Title",
    "date": 2023,
    "link": "https://doi.org/...",
    "authors": ["Author 1", "Author 2"],
    "journal": "Journal Name",
    "volume": "Vol. X",
    "pages": "XX-XX",
    "publisher": "Publisher Name",
    "description": "Abstract of the publication",
    "citations": 10
  }
]
```

## Local Development

To run the script locally:

1. Install the required packages:
   ```bash
   pip install google-search-results
   ```

2. Update the `scraper.py` file with your Google Scholar ID and SerpAPI key
3. Run the script:
   ```bash
   python scraper.py
   ```

## Using in a Website

This JSON file can be used in a website by:

1. Fetching the JSON file in your JavaScript:
   ```javascript
   fetch('/data/scholar.json')
     .then(response => response.json())
     .then(data => {
       // Process the publications
     });
   ```

2. The file will be automatically updated with your latest publications monthly 