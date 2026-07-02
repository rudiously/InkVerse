import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../api/client.js';
import ChapterCard from '../components/ChapterCard.jsx';
import CategoryPill from '../components/CategoryPill.jsx';

const SORTS = [
  { key: 'latest', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
  { key: 'mostLiked', label: 'Most Liked' },
  { key: 'mostViewed', label: 'Most Viewed' },
];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');

  const activeCategory = params.get('category') || '';
  const sort = params.get('sort') || 'latest';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/chapters/explore', {
        params: { search: params.get('search') || undefined, category: activeCategory || undefined, sort, page, limit: 12 },
      })
      .then((r) => {
        setChapters(r.data.chapters || []);
        setTotal(r.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [params, activeCategory, sort, page]);

  useEffect(() => { load(); }, [load]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setParams(next);
  }

  function submitSearch(e) {
    e.preventDefault();
    updateParam('search', search);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl mb-2">Explore Stories</h1>
      <p className="text-brown-500 mb-8">Discover authentic voices from writers around the world.</p>

      <form onSubmit={submitSearch} className="relative mb-6 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search titles, writers, tags..."
          className="w-full pl-11 pr-4 py-3 rounded-full border border-brown-100 bg-white/70 focus:outline-none focus:border-gold text-sm"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2 mb-4 overflow-x-auto pb-1">
        <CategoryPill label="All" active={!activeCategory} onClick={() => updateParam('category', '')} />
        {categories.map((c) => (
          <CategoryPill key={c.id} label={c.name} active={activeCategory === c.slug} onClick={() => updateParam('category', c.slug)} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-xs uppercase tracking-wider text-brown-300 mr-2">Sort by</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => updateParam('sort', s.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              sort === s.key ? 'bg-gold text-charcoal' : 'text-brown-500 hover:text-gold-deep'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl2 bg-beige-100 animate-pulse" />
          ))}
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-24 text-brown-300">
          <p className="font-display text-xl mb-2">No chapters found</p>
          <p className="text-sm">Try a different search or category.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((c) => (
              <ChapterCard key={c.id} chapter={c} />
            ))}
          </div>
          <Pagination page={page} total={total} limit={12} onChange={(p) => updateParam('page', String(p))} />
        </>
      )}
    </div>
  );
}

function Pagination({ page, total, limit, onChange }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {Array.from({ length: pages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-9 h-9 rounded-full text-sm ${page === i + 1 ? 'bg-brown-900 text-cream' : 'text-brown-500 hover:bg-beige-100'}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
