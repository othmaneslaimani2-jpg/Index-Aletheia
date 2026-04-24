/**
 * Fetches a random quote from the ZenQuotes API.
 * Handles errors and provides a fallback mechanism.
 * @returns {Promise<{q: string, a: string}>}
 */
async function getQuote() {
    try {
        // Switching to dummyjson.com as it supports CORS for client-side requests
        const response = await fetch("https://dummyjson.com/quotes/random");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // DummyJSON format: { id, quote, author }
        if (!data || !data.quote || !data.author) {
            throw new Error("Invalid response format from API");
        }
        
        return {
            q: data.quote,
            a: data.author
        };
    } catch (error) {
        // Silencing the console error for known CORS issues or network failures 
        // if we have a fallback ready, but keeping it for debugging.
        console.warn("API fetch failed, using fallback quote:", error.message);
        
        return {
            q: "The only true wisdom is in knowing you know nothing.",
            a: "Socrates"
        };
    }
}

/**
 * Searches for books using the Open Library API.
 * @param {string} query - The search query.
 * @returns {Promise<Array>} - Array of book objects.
 */
async function searchBooks(query) {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.docs) {
            throw new Error("Invalid response format from API");
        }
        
        return data.docs.map(book => ({
            title: book.title,
            author: book.author_name ? book.author_name[0] : 'Unknown Author',
            coverId: book.cover_i,
            key: book.key
        }));
    } catch (error) {
        console.warn("Book search failed:", error.message);
        return [];
    }
}

/**
 * Updates the books grid with search results.
 * @param {Array} books - Array of book objects.
 */
function updateBooksGrid(books) {
    const booksGrid = document.querySelector('.books-grid');
    if (!booksGrid) return;
    
    booksGrid.innerHTML = '';
    
    if (books.length === 0) {
        booksGrid.innerHTML = '<p>No books found.</p>';
        return;
    }
    
    books.forEach(book => {
        const bookCard = document.createElement('article');
        bookCard.className = 'book-card';
        
        const coverUrl = book.coverId ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg` : 'img/placeholder.svg';
        
        bookCard.innerHTML = `
            <div class="book-info">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
            </div>
            <img src="${coverUrl}" alt="${book.title}" onerror="this.src='img/placeholder.svg'" />
        `;
        
        booksGrid.appendChild(bookCard);
    });
}

/**
 * Loads default books on page load.
 */
async function loadDefaultBooks() {
    const books = await searchBooks('philosophy');
    updateBooksGrid(books);
}

/**
 * Updates the UI with the fetched quote.
 * Only runs if document is defined (browser environment).
 */
async function updateQuoteUI() {
    if (typeof document === 'undefined') return;

    const textElement = document.getElementById('quote-text');
    const authorElement = document.getElementById('quote-author');
    
    if (!textElement || !authorElement) {
        console.warn("Quote elements not found in the DOM.");
        return;
    }

    const { q, a } = await getQuote();
    
    textElement.innerText = `"${q}"`;
    authorElement.innerText = `"${a}"`;
}

// Browser-specific initialization
if (typeof document !== 'undefined') {
    const btn = document.getElementById('new-quote-btn');
    if (btn) {
        btn.addEventListener('click', updateQuoteUI);
    }
    
    // Initial fetch on page load
    window.addEventListener('DOMContentLoaded', () => {
        updateQuoteUI();
        loadDefaultBooks();
    });
    
    // Search functionality
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getQuote, searchBooks, loadDefaultBooks };
}

