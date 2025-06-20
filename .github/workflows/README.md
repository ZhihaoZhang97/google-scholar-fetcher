# Google Scholar Automatic Update

This workflow automatically updates your Google Scholar publications in a JSON file on a monthly basis.

## How it Works

1. The action runs on the 1st day of each month
2. It fetches your Google Scholar publications using your Scholar ID
3. Publications are saved to a JSON file in your repository
4. If there are any changes (new publications), they are automatically committed

## Configuration

Before the action can run properly, you need to set up the following repository variables in your GitHub repository:

1. Go to your repository's Settings → Secrets and variables → Actions → Variables (tab)
2. Add the following variables:

| Name | Description | Example |
|------|-------------|---------|
| GOOGLE_SCHOLAR_ID | Your Google Scholar ID (found in your personal Scholar page URL as the value of the `user=` parameter) | XYZ123456789 |
| RECORD_FILE | The path where the JSON file will be saved | data/scholar.json |
| GIT_USERNAME | The username to use for git commits | GitHub Action |
| GIT_EMAIL | The email to use for git commits | actions@github.com |

## Manual Trigger

You can manually trigger this workflow at any time from the Actions tab in your repository.

## JSON Data Format

The fetched publications will be saved in the following JSON format:

```json
[
  {
    "title": "Publication Title",
    "date": [2023, 1, 1],
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