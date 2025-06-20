import json
import os
import sys
import logging
import datetime
from dotenv import load_dotenv
from serpapi import GoogleSearch

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("scholar-scraper")

# Load environment variables from .env file if it exists
load_dotenv()

# Get API key and Scholar ID from environment variables or use defaults
api_key = os.environ.get("SERPAPI_KEY")
scholar_id = os.environ.get("GOOGLE_SCHOLAR_ID", "61Ou1P8AAAAJ")

# Check if API key is set
if not api_key:
    logger.error("SERPAPI_KEY environment variable is not set.")
    logger.error("Please set it in a .env file or as an environment variable.")
    sys.exit(1)

# Parameters for Google Scholar search
params = {
    "engine": "google_scholar_author",
    "author_id": scholar_id,
    "api_key": api_key,
    "sort": "pubdate",
}

logger.info(f"Fetching publications for Scholar ID: {scholar_id}")
logger.info(f"Current time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Create data directory if it doesn't exist
os.makedirs("data", exist_ok=True)

# Perform the search
try:
    logger.info("Initiating SerpAPI request...")
    search = GoogleSearch(params)
    results = search.get_dict()
    logger.info("Successfully received response from SerpAPI")

    # Extract author and article information
    author = results.get("author", {})
    if author:
        logger.info(f"Author name: {author.get('name', 'Unknown')}")

    articles = results.get("articles", [])
    total_articles = len(articles)

    if not articles:
        logger.warning("No articles found. Check your Scholar ID.")
    else:
        logger.info(f"Found {total_articles} articles")

    # Format the data for storage
    formatted_data = []
    for i, article in enumerate(articles, 1):
        try:
            publication = {
                "title": article.get("title", ""),
                "date": article.get("publication_date", {}).get("year", 0),
                "link": article.get("link", ""),
                "authors": (
                    article.get("authors", "").split(",")
                    if article.get("authors")
                    else []
                ),
                "journal": article.get("publication", ""),
                "volume": article.get("volume", ""),
                "pages": article.get("pages", ""),
                "publisher": article.get("publisher", ""),
                "description": article.get("snippet", ""),
                "citations": article.get("cited_by", {}).get("value", 0),
            }
            formatted_data.append(publication)
            logger.debug(
                f"Processed article {i}/{total_articles}: {publication['title'][:50]}..."
            )
        except Exception as e:
            logger.error(f"Error processing article {i}: {str(e)}")

    # Save to data/scholar.json
    output_path = os.path.join("data", "scholar.json")
    with open(output_path, "w") as f:
        json.dump(formatted_data, f, indent=2)

    # Print summary
    logger.info(
        f"Successfully scraped {len(formatted_data)} papers from Google Scholar"
    )
    logger.info(f"Data saved to {output_path}")

except Exception as e:
    logger.error(f"Error: {str(e)}")
    sys.exit(1)
