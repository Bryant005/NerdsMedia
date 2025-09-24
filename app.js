/* app.js — routing, rendering, and client-side "serverless" content storage */

const app = document.getElementById('app');
const yearEl = document.getElementById('year');
yearEl.textContent = new Date().getFullYear();

const STORAGE_KEYS = { news: 'gns_news', gallery: 'gns_gallery', videos: 'gns_videos' };

// Utility Functions
function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeStored(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function excerptFrom(html) {
  return (html || '').replace(/<[^>]*>/g, '').slice(0, 200) + '...';
}
function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}
function getImagePath(srcValue) {
  if (!srcValue) return '';
  if (srcValue.startsWith('data:') || srcValue.startsWith('http')) {
    return srcValue;
  }
  return `images/${srcValue}`;
}

// Router
const routes = {
  home: renderHome,
  news: renderNewsList,
  'news-post': renderNewsPost,
  videos: renderVideos,
  gallery: renderGallery,
  about: renderAbout
};

function navigate() {
  const hash = location.hash.replace('#', '') || 'home';
  const [path, id] = hash.split('/');
  let routeKey = path;
  if (path === 'news' && id) {
    routeKey = 'news-post';
  }
  const pageRenderer = routes[routeKey] || renderNotFound;
  pageRenderer(id);
}

// Rendering Functions
function renderHome() {
  document.title = 'NerdMedia — Home';
  app.innerHTML = `
    <section class="hero">
      <div class="card">
        <h1 class="headline">Latest Gaming News</h1>
        <p class="meta">Fresh community-driven stories and editor picks.</p>
        <div id="newsList"></div>
      </div>
      <aside class="card">
        <h3>Upload & Publish</h3>
        <p class="small">Upload images, videos, or post a news article — stored locally on this device.</p>
        <details>
          <summary>Publish News</summary>
          <form id="newsForm">
            <label for="nTitle">Title</label><input id="nTitle" required>
            <label for="nThumb">Thumbnail Image</label><input id="nThumb" type="file" accept="image/*">
            <label for="nContent">Content (HTML allowed)</label><textarea id="nContent" rows="6"></textarea>
            <label for="nAuthor">Author</label><input id="nAuthor" placeholder="Your name">
            <button type="submit">Publish</button>
          </form>
        </details>
        <details>
          <summary>Upload Image to Gallery</summary>
          <form id="imgForm">
            <label for="imgFile">Choose image</label><input id="imgFile" type="file" accept="image/*" required>
            <label for="imgTitle">Title</label><input id="imgTitle">
            <label for="imgDesc">Description</label><input id="imgDesc">
            <button type="submit">Upload Image</button>
          </form>
        </details>
        <details>
          <summary>Upload Video</summary>
          <form id="videoForm">
            <label for="videoFile">Video file (or leave blank and add link)</label><input id="videoFile" type="file" accept="video/*">
            <label for="videoLink">Or external video link</label><input id="videoLink" placeholder="https://...">
            <label for="videoTitle">Title</label><input id="videoTitle" required>
            <button type="submit">Add Video</button>
          </form>
        </details>
      </aside>
    </section>
  `;

  const newsList = document.getElementById('newsList');
  NEWS.slice().reverse().slice(0, 6).forEach(n => {
    const el = document.createElement('article');
    el.className = 'card news-card small';
    el.innerHTML = `
      ${n.thumbnail ? `<img src="${getImagePath(n.thumbnail)}" alt="" class="news-thumbnail">` : ''}
      <div class="news-card-content">
        <h3><a href="#news/${n.id}" target="_blank">${escapeHtml(n.title)}</a></h3>
        <p class="meta">${n.date} • ${n.author || 'Community'}</p>
      </div>`;
    newsList.appendChild(el);
  });

  // Wire forms
  document.getElementById('newsForm').addEventListener('submit', async e => {
    e.preventDefault();
    const title = document.getElementById('nTitle').value.trim();
    if (!title) return;
    const content = document.getElementById('nContent').value.trim();
    const author = document.getElementById('nAuthor').value.trim() || 'Community';
    const file = document.getElementById('nThumb').files[0];
    let thumbnail = '';
    if (file) {
      thumbnail = await fileToDataURL(file);
    }
    const item = { id: 'n' + Date.now(), title, content, thumbnail, excerpt: excerptFrom(content), date: new Date().toISOString().slice(0, 10), author };
    NEWS.push(item);
    writeStored(STORAGE_KEYS.news, NEWS);
    alert('News article published locally!');
    location.hash = '#news';
  });

  document.getElementById('imgForm').addEventListener('submit', async e => {
    e.preventDefault();
    const file = document.getElementById('imgFile').files[0];
    if (!file) return;
    const title = document.getElementById('imgTitle').value || file.name;
    const desc = document.getElementById('imgDesc').value || '';
    const src = await fileToDataURL(file);
    const item = { id: 'g' + Date.now(), type: 'image', title, src, alt: title, desc, date: new Date().toISOString().slice(0, 10) };
    GALLERY.push(item);
    writeStored(STORAGE_KEYS.gallery, GALLERY);
    alert('Image uploaded to gallery locally!');
    location.hash = '#gallery';
  });

  document.getElementById('videoForm').addEventListener('submit', async e => {
    e.preventDefault();
    const title = document.getElementById('videoTitle').value.trim();
    if (!title) return;
    const file = document.getElementById('videoFile').files[0];
    const link = document.getElementById('videoLink').value.trim();
    if (!file && !link) return alert('Provide a video file or link');
    let src = link;
    if (file) {
      src = await fileToDataURL(file);
    }
    const item = { id: 'v' + Date.now(), title, src, date: new Date().toISOString().slice(0, 10) };
    VIDEOS.push(item);
    writeStored(STORAGE_KEYS.videos, VIDEOS);
    alert('Video added locally!');
    location.hash = '#videos';
  });
}

function renderNewsList() {
  document.title = 'NerdsMedia — News';
  app.innerHTML = `<section class="card"><h1 class="headline">News</h1><div id="newsGrid" class="grid" role="list"></div></section>`;
  const grid = document.getElementById('newsGrid');
  NEWS.slice().reverse().forEach(n => {
    const el = document.createElement('article');
    el.setAttribute('role', 'listitem');
    el.className = 'card news-card';
    el.innerHTML = `
      ${n.thumbnail ? `<img src="${getImagePath(n.thumbnail)}" alt="" class="news-thumbnail">` : ''}
      <div class="news-card-content">
        <h3><a href="#news/${n.id}" target="_blank">${escapeHtml(n.title)}</a></h3>
        <p class="meta">${n.date} • ${n.author || 'Community'}</p>
        <p>${n.excerpt || excerptFrom(n.content) || ''}</p>
      </div>`;
    grid.appendChild(el);
  });
}

function renderNewsPost(id) {
  const post = NEWS.find(n => n.id === id);
  if (!post) return renderNotFound();
  document.title = `${post.title} — NerdsMedia`;
  app.innerHTML = `
    <article class="card">
      ${post.thumbnail ? `<img src="${getImagePath(post.thumbnail)}" alt="${escapeHtml(post.title)}" class="post-thumbnail">` : ''}
      <h1>${escapeHtml(post.title)}</h1>
      <p class="meta">${post.date} • ${post.author || 'Community'}</p>
      <div class="content">${post.content || ''}</div>
    </article>`;
}

function renderVideos() {
  document.title = 'NerdsMedia — Videos';
  app.innerHTML = `<section class="card"><h1 class="headline">Videos</h1><div id="videoGrid" class="grid"></div></section>`;
  const grid = document.getElementById('videoGrid');
  VIDEOS.slice().reverse().forEach(v => {
    const el = document.createElement('div');
    el.className = 'card';
    let player = '';
    if (v.youtubeId) {
      player = `<iframe style="width: 100%; height: 160px; border: 0; border-radius: 6px;" src="https://www.youtube.com/embed/${v.youtubeId}" title="${escapeHtml(v.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else if (v.src) {
      player = `<video controls src="${v.src}" style="width:100%;height:160px;object-fit:cover;border-radius:6px"></video>`;
    }
    el.innerHTML = `
      <h3>${escapeHtml(v.title)}</h3>
      <div class="video-thumb">${player}</div>
      <p class="meta">${v.date || ''}</p>`;
    grid.appendChild(el);
  });
}

function renderGallery() {
  document.title = 'NerdsMedia — Gallery';
  app.innerHTML = `<section class="card"><h1 class="headline">Gallery</h1><div id="galleryGrid" class="grid" role="list"></div></section>`;
  const grid = document.getElementById('galleryGrid');
  GALLERY.slice().reverse().forEach(it => {
    const el = document.createElement('figure');
    el.className = 'card';
    el.setAttribute('role', 'listitem');
    if (it.type === 'image') {
      el.innerHTML = `<img src="${getImagePath(it.src)}" alt="${escapeHtml(it.alt || it.title)}" style="width:100%;height:160px;object-fit:cover;border-radius:6px"><figcaption><strong>${escapeHtml(it.title)}</strong><p class="small">${escapeHtml(it.desc || '')}</p></figcaption>`;
    } else {
      el.innerHTML = `<figcaption><strong>${escapeHtml(it.title)}</strong><p class="small">${escapeHtml(it.desc || '')}</p></figcaption>`;
    }
    grid.appendChild(el);
  });
}

function renderAbout() {
  document.title = 'About — NerdsMedia';
  app.innerHTML = `<section class="card"><h1 class="headline">About</h1><p>This is a community-first gaming news site built as a static template you can host on GitHub Pages. It uses client-side storage to allow local publishing and uploads.</p></section>`;
}

function renderNotFound() {
  document.title = 'Not Found — NerdsMedia';
  app.innerHTML = `<section class="card"><h1>404 — Not Found</h1><p>Sorry, It seems that this place was looted, such a shame.</p></section>`;
}

function renderSearchResults(items, q) {
  document.title = `Search: ${q} — NerdsMedia`;
  app.innerHTML = `<section class="card"><h1>Search results for "${escapeHtml(q)}"</h1><div id="searchGrid" class="grid"></div></section>`;
  const grid = document.getElementById('searchGrid');
  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'card';
    if (it.title) el.innerHTML = `<h3>${escapeHtml(it.title)}</h3><p class="meta">${it.date || ''}</p>`;
    grid.appendChild(el);
  });
}

// Global data arrays
let NEWS = [];
let GALLERY = [];
let VIDEOS = [];

async function init() {
  async function loadJSON(path, fallback) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('File not found');
      return await res.json();
    } catch (e) {
      console.error(`Failed to load ${path}:`, e);
      return fallback;
    }
  }

  const [sampleNews, sampleGallery, sampleVideos] = await Promise.all([
    loadJSON('data/news.json', []),
    loadJSON('data/gallery.json', []),
    loadJSON('data/videos.json', [])
  ]);

  NEWS = [...sampleNews, ...readStored(STORAGE_KEYS.news, [])];
  GALLERY = [...sampleGallery, ...readStored(STORAGE_KEYS.gallery, [])];
  VIDEOS = [...sampleVideos, ...readStored(STORAGE_KEYS.videos, [])];

  document.querySelector('.nav-toggle').addEventListener('click', () => {
    const ul = document.getElementById('nav-list');
    ul.style.display = ul.style.display === 'flex' ? 'none' : 'flex';
  });

  document.getElementById('searchInput').addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      navigate();
      return;
    }
    const results = [
      ...NEWS.filter(n => n.title.toLowerCase().includes(q)),
      ...VIDEOS.filter(v => v.title.toLowerCase().includes(q)),
      ...GALLERY.filter(g => g.title.toLowerCase().includes(q))
    ];
    renderSearchResults(results, q);
  });

  navigate();
}

window.addEventListener('hashchange', navigate);
document.addEventListener('DOMContentLoaded', init);
