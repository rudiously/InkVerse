import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Edit3, Trash2, Archive, Share2, Search } from 'lucide-react';
import api from '../api/client.js';
import StatCard from '../components/StatCard.jsx';

const TABS = [
  { key: '', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
  { key: 'archived', label: 'Archived' },
];

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'mostViewed', label: 'Most Viewed' },
  { key: 'mostLiked', label: 'Most Liked' },
];

export default function MyChapters() {
  const [tab, setTab] = useState('');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [chapters, setChapters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/chapters/mine', { params: { status: tab || undefined, sort, search: search || undefined } })
      .then((r) => {
        setChapters(r.data.chapters || []);
        setStats(r.data.stats);
      })
      .finally(() => setLoading(false));
  }, [tab, sort, search]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this chapter permanently?')) return;
    await api.delete(`/chapters/${id}`);
    load();
  }

  async function handleArchive(id) {
    await api.post(`/chapters/${id}/archive`);
    load();
  }

  async function handlePublish(id) {
    await api.put(`/chapters/${id}`, { status: 'published' });
    load();
  }

  function handleShare(slug) {
    const url = `${window.location.origin}/chapter/${slug}`;
    navigator.clipboard?.writeText(url);
    alert('Link copied to clipboard.');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl mb-8">My Chapters</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
          <StatCard label="Published" value={stats.published} />
          <StatCard label="Drafts" value={stats.drafts} />
          <StatCard label="Archived" value={stats.archived} />
          <StatCard label="Views" value={stats.totalViews} />
          <StatCard label="Likes" value={stats.totalLikes} />
          <StatCard label="Comments" value={stats.totalComments} />
          <StatCard label="Followers" value="—" />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-brown-900 text-cream' : 'text-brown-500 hover:bg-beige-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brown-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your chapters"
              className="pl-9 pr-3 py-2 rounded-full border border-brown-100 text-sm bg-white/70 focus:outline-none focus:border-gold"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-full border border-brown-100 text-sm bg-white/70"
          >
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl2 bg-beige-100 animate-pulse" />)}
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-24 text-brown-300">
          <p className="font-display text-xl mb-2">Nothing here yet</p>
          <Link to="/write" className="text-gold-deep hover:underline text-sm">Start writing your first chapter</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((c) => (
            <div key={c.id} className="rounded-xl2 border border-brown-100/60 bg-white/60 p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg truncate">{c.title}</h3>
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                    c.status === 'published' ? 'bg-green-100 text-green-700' : c.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-brown-100 text-brown-500'
                  }`}>{c.status}</span>
                </div>
                <div className="text-xs text-brown-300 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Created {new Date(c.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{c.views_count}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{c.likes_count}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{c.comments_count}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link to={`/chapter/${c.slug}`} className="px-3 py-1.5 rounded-full border border-brown-100 text-xs hover:border-gold hover:text-gold-deep">Preview</Link>
                <Link to={`/write/${c.id}`} className="px-3 py-1.5 rounded-full border border-brown-100 text-xs hover:border-gold hover:text-gold-deep flex items-center gap-1"><Edit3 className="w-3 h-3" />Edit</Link>
                {c.status === 'draft' && (
                  <button onClick={() => handlePublish(c.id)} className="px-3 py-1.5 rounded-full bg-gold text-charcoal text-xs font-semibold">Publish</button>
                )}
                {c.status !== 'archived' && (
                  <button onClick={() => handleArchive(c.id)} className="px-3 py-1.5 rounded-full border border-brown-100 text-xs hover:border-gold flex items-center gap-1"><Archive className="w-3 h-3" />Archive</button>
                )}
                <button onClick={() => handleShare(c.slug)} className="px-3 py-1.5 rounded-full border border-brown-100 text-xs hover:border-gold flex items-center gap-1"><Share2 className="w-3 h-3" />Share</button>
                <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 rounded-full border border-red-200 text-red-500 text-xs hover:bg-red-50 flex items-center gap-1"><Trash2 className="w-3 h-3" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
