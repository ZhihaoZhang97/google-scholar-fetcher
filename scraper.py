import json
import os
import sys
from dotenv import load_dotenv
from serpapi import GoogleSearch

# Load environment variables from .env file if it exists
load_dotenv()

# Get API key and Scholar ID from environment variables or use defaults
api_key = os.environ.get("SERPAPI_KEY")
scholar_id = os.environ.get("GOOGLE_SCHOLAR_ID", "61Ou1P8AAAAJ")

# Check if API key is set
if not api_key:
    print("Error: SERPAPI_KEY environment variable is not set.")
    print("Please set it in a .env file or as an environment variable.")
    sys.exit(1)

# Parameters for Google Scholar search
params = {
    "engine": "google_scholar_author",
    "author_id": scholar_id,
    "api_key": api_key,
    "sort": "pubdate",
}

print(f"Fetching publications for Scholar ID: {scholar_id}")

# Create data directory if it doesn't exist
os.makedirs("data", exist_ok=True)

# Perform the search
try:
    search = GoogleSearch(params)
    results = search.get_dict()

    # Extract author and article information
    author = results.get("author", {})
    articles = results.get("articles", [])

    if not articles:
        print("Warning: No articles found. Check your Scholar ID.")

    # Format the data for storage
    formatted_data = []
    for article in articles:
        publication = {
            "title": article.get("title", ""),
            "date": article.get("publication_date", {}).get(
                "year", 0
            ),  # Simplifying to just year
            "link": article.get("link", ""),
            "authors": (
                article.get("authors", "").split(",") if article.get("authors") else []
            ),
            "journal": article.get("publication", ""),
            "volume": article.get("volume", ""),
            "pages": article.get("pages", ""),
            "publisher": article.get("publisher", ""),
            "description": article.get("snippet", ""),
            "citations": article.get("cited_by", {}).get("value", 0),
        }
        formatted_data.append(publication)

    # Save to data/scholar.json
    output_path = os.path.join("data", "scholar.json")
    with open(output_path, "w") as f:
        json.dump(formatted_data, f, indent=2)

    # Print summary
    print(f"Successfully scraped {len(formatted_data)} papers from Google Scholar")
    print(f"Data saved to {output_path}")

except Exception as e:
    print(f"Error: {str(e)}")
    sys.exit(1)
