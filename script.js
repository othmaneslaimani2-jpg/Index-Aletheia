const textElement = document.getElementById('quote-text');
const authorElemnet = document.getElementById('quote-author');
const btn = document.getElementById ('new-quote-btn');
async function fetchQuote() {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();
    textElement.innerText = `"${data[0].q}"`;
    authorElemnet.innerText = `"${data[0].a}"`;
}
btn.addEventListener('click',fetchQuote);
fetchQuote();

