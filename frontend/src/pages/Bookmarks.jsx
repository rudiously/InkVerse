import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, X } from 'lucide-react';
import api from '../api/client.js';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState(null);

  function load() {
    api.get('/bookmarks').then((r) => setBookmarks(r.data.bookmarks || [])).catch(() => setBookmarks([]));
  }
  useEffect(() => { load(); }, []);

  async function remove(chapterId) {
    await api.delete(`/chapters/${chapterId}/bookmark`);
    load();
  }

  function share(slug) {
    navigator.clipboard?.writeText(`${window.location.origin}/chapter/${slug}`);
    alert('Link copied.');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl mb-8 flex items-center gap-3"><Bookmark className="w-7 h-7 text-gold" /> Bookmarks</h1>

      {bookmarks === null ? (
        <p className="text-brown-300">Loading...</p>
      ) : bookmarks.length === 0 ? (
        <p className="text-brown-300">You haven't bookmarked anything yet. Explore stories to save them for later.</p>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b) => (
            <div key={b.chapters.id} className="flex items-center gap-4 rounded-xl2 border border-brown-100/60 bg-white/60 p-4">
              <div className="w-16 h-16 rounded-lg bg-beige-200 overflow-hidden shrink-0">
                {b.chapters.cover_image_url && <img src={b.chapters.cover_image_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/chapter/${b.chapters.slug}`} className="font-display text-lg hover:text-gold-deep truncate block">{b.chapters.title}</Link>
                <p className="text-xs text-brown-300">by @{b.chapters.users?.username}</p>
              </div>
              <Link to={`/chapter/${b.chapters.slug}`} className="px-3 py-1.5 rounded-full border border-brown-100 text-xs hover:border-gold hover:text-gold-deep">Continue Reading</Link>
              <button onClick={() => share(b.chapters.slug)} className="px-3 py-1.5 rounded-full border border-brown-100 text-xs hover:border-gold hover:text-gold-deep">Share</button>
              <button onClick={() => remove(b.chapters.id)} className="p-2 rounded-full hover:bg-red-50 text-red-400"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
