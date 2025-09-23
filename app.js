/* app.js — routing, rendering, and client-side "serverless" content storage
window.addEventListener('load',()=>{
// make nav-toggle work
document.querySelector('.nav-toggle').addEventListener('click', e=>{
const ul = document.getElementById('nav-list');
const expanded = e.currentTarget.getAttribute('aria-expanded') === 'true';
e.currentTarget.setAttribute('aria-expanded', String(!expanded));
ul.style.display = expanded? 'none' : 'flex';
});
// search
document.getElementById('searchInput').addEventListener('input', e=>{
const q = e.target.value.toLowerCase().trim();
if(!q){ navigate(); return; }
// simple search across news titles and video titles
const results = NEWS.filter(n=>n.title.toLowerCase().includes(q))
.concat(VIDEOS.filter(v=>v.title.toLowerCase().includes(q)));
renderSearchResults(results, q);
});
navigate();
});


// Rendering functions
function renderHome(){
document.title = 'GamingNewsSite — Home';
app.innerHTML = `
<section class="hero">
<div class="card">
<h1 class="headline">Latest Gaming News</h1>
<p class="meta">Fresh community-driven stories and editor picks.</p>
<div id="newsList"></div>
</div>
<aside class="card">
<h3>Upload & Publish</h3>
<p class="small">Upload images, videos, or post a news article — stored locally and shown to everyone who visits this site on this device (or uploaded files embedded in your repo will be used on GitHub Pages).</p>
<details>
<summary>Publish News</summary>
<form id="newsForm">
<label for="nTitle">Title</label>
<input id="nTitle" required>
<label for="nContent">Content (HTML allowed)</label>
<textarea id="nContent" rows="6"></textarea>
<label for="nAuthor">Author</label>
<input id="nAuthor" placeholder="Your name">
<button type="submit">Publish</button>
</form>
</details>
<details>
<summary>Upload Image to Gallery</summary>
<form id="imgForm">
<label for="imgFile">Choose image</label>
<input id="imgFile" type="file" accept="image/*">
<label for="imgTitle">Title</label>
<input id="imgTitle">
<label for="imgDesc">Description</label>
<input id="imgDesc">
<button type="submit">Upload Image</button>
</form>
</details>
<details>
<summary>Upload Video</summary>
<form id="videoForm">
<label for="videoFile">Video file (or leave blank and add link)</label>
<input id="videoFile" type="file" accept="video/*">
<label for="videoLink">Or external video link</label>
