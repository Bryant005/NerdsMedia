// ==================
// Simple SPA for GamingNewsSite
// ==================

const app = document.getElementById('app');

// ---- Storage Keys ----
const STORAGE_KEYS = {
  news: 'gamingNews',
  videos: 'gamingVideos',
  gallery: 'gamingGallery'
};

// ---- Demo Data (loads only once if localStorage is empty) ----
const DEMO_NEWS = [
  {
    id: 'n1',
    title: 'Elder Scrolls VI Rumors',
    author: 'Admin',
    date: '2025-09-24',
    content: `<p>Bethesda may finally reveal Elder Scrolls VI gameplay in the coming months.
    Fans worldwide are buzzing about potential release dates and locations.</p>`
  },
  {
    id: 'n2',
    title: 'Cyberpunk 2077 Gets Another Patch',
    author: 'Editor',
    date: '2025-09-23',
    content: `<p>The futuristic RPG keeps improving with new AI behaviors, bug fixes, 
    and added features. CD Projekt Red has shown commitment to the community.</p>`
  }
];

const DEMO_VIDEOS = [
  { id: 'v1', title: 'Top 10 Games 2025', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 'v2', title: 'IGN-style Game Review', url: 'https://www.youtube.com/embed/oHg5SJYRHA0' }
];

const DEMO_GALLERY = [
  { id: 'g1', title: 'Epic Screenshot', img: 'https://placehold.co/400x250', link: '#', desc: 'Placeholder screenshot' },
  { id: 'g2', title: 'Character Art', img: 'https://placehold.co/400x250', link: '#', desc: 'Fan art example' }
];

// ---- LocalStorage Helpers ----
function loadStored(key, fallback){
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}
function saveStored(key, data){
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- In-Memory State ----
let NEWS = loadStored(STORAGE_KEYS.news, DEMO_NEWS);
let VIDEOS = loadStored(STORAGE_KEYS.videos, DEMO_VIDEOS);
let GALLERY = loadStored(STORAGE_KEYS.gallery, DEMO_GALLERY);

// ---- Router ----
function router(){
  const hash = location.hash.slice(1); // remove #
  if(!hash) return renderHome();

  const [route, param] = hash.split('/');
  switch(route){
    case 'news':
      param ? renderNewsPost(param) : renderNewsList();
      break;
    case 'videos':
      renderVideos();
      break;
    case 'gallery':
      renderGallery();
      break;
    case 'about':
      renderAbout();
      break;
    default:
      renderNotFound();
  }
}
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// ---- Render Functions ----

// Home
function renderHome(){
  document.title = 'GamingNewsSite — Home';
  app.innerHTML = `
    <section class="card">
      <h1 class="headline">Welcome to GamingNewsSite</h1>
      <p>Your hub for gaming news, reviews, videos, and galleries — inspired by IGN but with our own twist!</p>
      <p><a href="#news" class="btn">Read the Latest News</a></p>
    </section>
  `;
}

// News List
function renderNewsList(){
  document.title = 'GamingNewsSite — News';
  app.innerHTML = `
    <section class="card">
      <h1 class="headline">News</h1>
      <div id="newsGrid" class="grid" role="list"></div>
    </section>
  `;

  const grid = document.getElementById('newsGrid');
  NEWS.slice().reverse().forEach(n=>{
    const el = document.createElement('article');
    el.setAttribute('role','listitem');
    el.className='card';
    el.innerHTML = `
      <h3><a href="#news/${n.id}">${escapeHtml(n.title)}</a></h3>
      <p class="meta">${n.date} • ${n.author||'Community'}</p>
      <p>${n.excerpt || excerptFrom(n.content) || ''}</p>
      <p><a href="#news/${n.id}" class="btn-small">Continue Reading…</a></p>
    `;
    grid.appendChild(el);
  });
}

// Single News Post
function renderNewsPost(id){
  const post = NEWS.find(n=>n.id === id);
  if(!post) return renderNotFound();

  document.title = `${post.title} — GamingNewsSite`;
  app.innerHTML = `
    <article class="card">
      <h1>${escapeHtml(post.title)}</h1>
      <p class="meta">${post.date} • ${post.author || 'Community'}</p>
      <div class="content">${post.content || ''}</div>
      <p><a href="#news" class="back-link">← Back to News</a></p>
    </article>
  `;
}

// Videos
function renderVideos(){
  document.title = 'GamingNewsSite — Videos';
  app.innerHTML = `
    <section class="card">
      <h1 class="headline">Videos</h1>
      <div class="grid" id="videoGrid"></div>
    </section>
  `;
  const grid = document.getElementById('videoGrid');
  VIDEOS.forEach(v=>{
    const el = document.createElement('div');
    el.className='card';
    el.innerHTML = `
      <h3>${escapeHtml(v.title)}</h3>
      <iframe width="100%" height="250" src="${v.url}" frameborder="0" allowfullscreen></iframe>
    `;
    grid.appendChild(el);
  });
}

// Gallery
function renderGallery(){
  document.title = 'GamingNewsSite — Gallery';
  app.innerHTML = `
    <section class="card">
      <h1 class="headline">Gallery</h1>
      <div class="grid" id="galleryGrid"></div>
    </section>
  `;
  const grid = document.getElementById('galleryGrid');
  GALLERY.forEach(g=>{
    const el = document.createElement('div');
    el.className='card';
    el.innerHTML = `
      <img src="${g.img}" alt="${escapeHtml(g.title)}" />
      <h3>${escapeHtml(g.title)}</h3>
      <p>${g.desc||''}</p>
      <p><a href="${g.link}" target="_blank">View More</a></p>
    `;
    grid.appendChild(el);
  });
}

// About
function renderAbout(){
  document.title = 'GamingNewsSite — About';
  app.innerHTML = `
    <section class="card">
      <h1 class="headline">About This Site</h1>
      <p>This is a student project inspired by IGN — a gaming news portal built with plain HTML, CSS, and JS (no server required).</p>
    </section>
  `;
}

// Not Found
function renderNotFound(){
  document.title = '404 — GamingNewsSite';
  app.innerHTML = `
    <section class="card">
      <h1>404 — Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p><a href="#">Return Home</a></p>
    </section>
  `;
}

// ---- Utility Functions ----
function escapeHtml(str){
  return str ? str.replace(/[&<>'"]/g, c=>({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[c])) : '';
}
function excerptFrom(html, length=120){
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  return text.length > length ? text.slice(0,length) + '…' : text;
}
