import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Feather, PenLine, Compass, Sparkles } from 'lucide-react';
import api from '../api/client.js';
import ChapterCard from '../components/ChapterCard.jsx';
import StatCard from '../components/StatCard.jsx';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [newestWriters, setNewestWriters] = useState([]);
  const [topWriters, setTopWriters] = useState([]);

  useEffect(() => {
    api.get('/chapters/trending').then((r) => setTrending(r.data.chapters || [])).catch(() => {});
    api.get('/chapters/explore', { params: { sort: 'latest', limit: 8 } }).then((r) => setRecent(r.data.chapters || [])).catch(() => {});
    api.get('/chapters/featured').then((r) => setFeatured(r.data.chapter)).catch(() => {});
    api.get('/categories').then((r) => setCategories(r.data.categories || [])).catch(() => {});
    api.get('/stats').then((r) => setStats(r.data)).catch(() => {});
    api.get('/community').then((r) => {
      setNewestWriters(r.data.newestWriters || []);
      setTopWriters(r.data.topWriters || []);
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-deep text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> A home for every voice
            </span>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] text-charcoal dark:text-cream mb-6">
              Welcome to <span className="text-gold-deep">InkVerse</span>
            </h1>
            <p className="text-brown-500 text-lg leading-relaxed max-w-xl mb-2">
              Every writer has a story. Every poet has emotions. Every dreamer has a voice.
            </p>
            <p className="text-brown-500 text-lg leading-relaxed max-w-xl mb-8">
              InkVerse is a home where you can write freely, publish your chapters, connect with readers,
              and leave your words behind for the world to discover.
            </p>
            <p className="font-display italic text-xl text-brown-700 dark:text-cream/90 mb-10">
              "Write what you feel. Read what others lived."
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/write"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-charcoal font-semibold shadow-lift hover:bg-gold-deep hover:text-cream transition-colors"
              >
                <PenLine className="w-4 h-4" /> Start Writing
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-brown-100 text-brown-700 dark:text-cream/80 font-semibold hover:border-gold hover:text-gold-deep transition-colors"
              >
                <Compass className="w-4 h-4" /> Explore Stories
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative h-[420px] hidden lg:block">
            <div className="absolute inset-0 rounded-xl2 bg-gradient-to-br from-beige-100 via-cream to-beige-200 border border-brown-100/60 shadow-soft" />
            <Feather className="absolute top-10 right-14 w-16 h-16 text-gold/70 animate-float-slow" strokeWidth={1} />
            <div className="absolute top-24 left-10 w-52 h-36 bg-white/80 rounded-xl shadow-soft rotate-[-6deg] p-4 animate-float-slower">
              <div className="h-2 w-3/4 bg-brown-100 rounded mb-2" />
              <div className="h-2 w-full bg-brown-100 rounded mb-2" />
              <div className="h-2 w-2/3 bg-brown-100 rounded" />
            </div>
            <div className="absolute bottom-16 left-24 w-44 h-32 bg-brown-700 rounded-lg shadow-lift rotate-[4deg]" />
            <div className="absolute bottom-24 left-32 w-44 h-32 bg-brown-500 rounded-lg shadow-lift rotate-[-2deg]" />
            <div className="absolute bottom-10 right-16 w-24 h-24 rounded-full bg-brown-900/90 flex items-center justify-center shadow-lift animate-float-slow">
              <div className="w-14 h-10 rounded-b-full bg-cream/90" />
            </div>
            <svg className="absolute bottom-6 right-6 w-20 h-20 text-gold/60" viewBox="0 0 100 100" fill="none">
              <path d="M10 80 Q40 20 90 40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* COMMUNITY STATS */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Writers Joined" value={stats.writersJoined?.toLocaleString?.() ?? stats.writersJoined} />
            <StatCard label="Chapters Published" value={stats.chaptersPublished?.toLocaleString?.() ?? stats.chaptersPublished} />
            <StatCard label="Total Reads" value={stats.totalReads?.toLocaleString?.() ?? stats.totalReads} />
            <StatCard label="Likes Given" value={stats.likesGiven?.toLocaleString?.() ?? stats.likesGiven} />
          </div>
        </section>
      )}

      {/* FEATURED STORY */}
      {featured && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="font-display text-2xl mb-5">Featured Story</h2>
          <Link to={`/chapter/${featured.slug}`} className="group grid md:grid-cols-2 gap-8 rounded-xl2 overflow-hidden border border-brown-100/60 bg-white/50 dark:bg-charcoal-soft hover:shadow-lift transition-shadow">
            <div className="aspect-[16/10] md:aspect-auto bg-beige-200 overflow-hidden">
              {featured.cover_image_url && (
                <img src={featured.cover_image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
            </div>
            <div className="p-8 flex flex-col justify-center">
              <span className="text-xs uppercase tracking-wider text-gold-deep font-semibold mb-3">Editor's Pick</span>
              <h3 className="font-display text-3xl mb-3">{featured.title}</h3>
              <p className="text-brown-500 line-clamp-3">{featured.excerpt}</p>
            </div>
          </Link>
        </section>
      )}

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="font-display text-2xl mb-5">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/explore?category=${c.slug}`}
                className="px-4 py-2 rounded-full border border-brown-100 text-sm text-brown-700 dark:text-cream/80 hover:border-gold hover:text-gold-deep transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TRENDING */}
      <Section title="Trending Chapters" chapters={trending} />
      {/* RECENT */}
      <Section title="Recently Published" chapters={recent} />

      {/* WRITERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-2xl mb-5">Popular Writers</h2>
          <WriterList writers={topWriters} empty="Rankings will appear as the community grows." />
        </div>
        <div>
          <h2 className="font-display text-2xl mb-5">Newest Writers</h2>
          <WriterList writers={newestWriters} empty="No new writers yet." />
        </div>
      </section>

      {/* WRITING CHALLENGE CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="rounded-xl2 bg-brown-900 text-cream p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-gold-soft font-semibold">This week's writing challenge</span>
            <h3 className="font-display text-3xl mt-2">Write a letter you'll never send.</h3>
            <p className="text-cream/70 mt-2 max-w-lg">Join fellow writers in a weekly prompt — publish your entry and get featured in Community.</p>
          </div>
          <Link to="/community" className="shrink-0 px-6 py-3 rounded-full bg-gold text-charcoal font-semibold hover:bg-gold-soft transition-colors">
            View Challenge
          </Link>
        </div>
      </section>
    </div>
  );
}

function Section({ title, chapters }) {
  if (!chapters?.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl">{title}</h2>
        <Link to="/explore" className="text-sm text-gold-deep hover:underline">View all</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {chapters.slice(0, 8).map((c) => (
          <ChapterCard key={c.id} chapter={c} />
        ))}
      </div>
    </section>
  );
}

function WriterList({ writers, empty }) {
  if (!writers?.length) return <p className="text-sm text-brown-300">{empty}</p>;
  return (
    <div className="space-y-3">
      {writers.map((w) => (
        <Link
          key={w.id}
          to={`/profile/${w.username}`}
          className="flex items-center gap-3 p-3 rounded-xl border border-brown-100/60 hover:border-gold transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-beige-200 overflow-hidden shrink-0">
            {w.profiles?.avatar_url && <img src={w.profiles.avatar_url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div>
            <div className="font-medium text-sm">{w.profiles?.display_name || w.username}</div>
            <div className="text-xs text-brown-300">@{w.username}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
