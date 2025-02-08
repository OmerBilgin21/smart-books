# Smart Books

### To run the project

Acquire an API key for Google Books API from [here](https://developers.google.com/books).
Start your PostgreSQL server and create a database called "smart_books_app"
Install the packages.
Run `npm run m:run` command to run the already generated migration files on your database, might take a while on initial run.
Create a .env file with the following key/values:

GOOGLE_BOOKS_API_KEY=""  
DB_USERNAME=""  
DB_PASS=""

The rest of the environment variables are defined for the DEV environment, for production use, define those under "nodemonConfig" at package.json!

TODO:

- [ ] Already read lists.
- [ ] Like/dislike suggestions, consider on future suggestions
- [ ] Implement a frecency (frequency + recency) to already read lists.
