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
    window.addEventListener('DOMContentLoaded', updateQuoteUI);
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getQuote };
}

