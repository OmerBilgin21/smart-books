# Smart Books

A intelligent book recommendation system that provides personalized book suggestions using Google Books API and local LLM (Ollama) integration.

## What Smart Books Does

Smart Books is a backend API service that learns your reading preferences and provides personalized book recommendations. The system analyzes your:

- **Favorite books** you've marked as liked
- **Favorite genres/categories** you've explicitly selected
- **Books you've disliked** to avoid similar recommendations
- **Preferred authors** based on your reading history
- **Preferred publishers** based on books you've enjoyed

Using this data, the system generates intelligent book suggestions with different relevance levels, from **PERFECT** matches to **MEDIOCRE** fallbacks.

## How the Suggestion System Works

The Smart Books recommendation engine uses a sophisticated multi-tier approach to find the best book suggestions:

### 1. **Perfect Suggestions** (Highest Quality)
- **Author + Category Combinations**: Books that combine your favorite authors with your preferred categories
- **Example**: If you love "Stephen King" and enjoy "Horror" categories, it will find horror books by Stephen King or similar authors in horror genres

### 2. **Very Good Suggestions**
- **High-Ranked Category Combinations**: Combines multiple categories you've rated highly (5+ stars)
- **Mixed Preferences**: Blends categories from books you've liked with your manually selected favorite categories

### 3. **Good Suggestions**
- **Category Mix-and-Match**: Combines your top-rated categories with lower-rated ones for variety
- **Author-Based**: Books by authors you've enjoyed reading

### 4. **Mediocre Suggestions**
- **Single Category**: Books from individual categories you've shown interest in
- **Publisher-Based**: Books from publishers whose works you've enjoyed

### 5. **AI-Powered Fallback**
When the system doesn't have enough user data, it leverages a local LLM (Large Language Model) to:
- Generate generic book recommendations
- Consider any dislikes you've specified
- Provide contextually relevant suggestions

### 6. **Smart Filtering**
The system automatically:
- **Filters out dislikes**: Removes books you've previously disliked
- **Avoids duplicates**: Won't suggest books you've already seen
- **Respects freshness**: Caches recent suggestions to avoid repetition

## API Endpoints

- **`/users`** - User management and authentication
- **`/books`** - Search and retrieve book data from Google Books
- **`/suggestions`** - Get personalized book recommendations
- **`/favorite-categories`** - Manage your preferred book categories
- **`/book-records`** - Track your reading history (liked, disliked, want-to-read)

## Technology Stack

- **Node.js + TypeScript** - Backend runtime and language
- **Express.js** - Web framework
- **TypeORM** - Database ORM with PostgreSQL
- **Google Books API** - Book data source
- **Ollama** - Local LLM for AI-powered suggestions
- **Zod** - Runtime type validation
- **JWT** - Authentication
- **Jest** - Testing framework
