import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import ChapterCard from '../components/ChapterCard.jsx';

export default function Community() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/community').then((r) => setData(r.data)).catch(() => setData({}));
  }, []);

  if (!data) return <div className="max-w-3xl mx-auto px-4 py-24 text-center text-brown-300">Loading community...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl mb-2">Community</h1>
      <p className="text-brown-500 mb-10">Where writers gather, connect, and celebrate each other's words.</p>

      {data.challenges?.length > 0 && (
        <section className="mb-14">
          <h2 className="font-display text-2xl mb-5">Writing Challenges</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {data.challenges.map((c) => (
              <div key={c.id} className="rounded-xl2 border border-brown-100/60 bg-white/60 p-5">
                <h3 className="font-display text-lg mb-1">{c.title}</h3>
                <p className="text-sm text-brown-500 line-clamp-2 mb-2">{c.description}</p>
                <p className="text-xs text-brown-300">Ends {new Date(c.ends_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Row title="Editor's Picks" chapters={data.editorsPicks} />
      <Row title="Trending / Most Read Today" chapters={data.trending} />
      <Row title="Recently Published" chapters={data.recentlyPublished} />

      <section className="grid md:grid-cols-2 gap-10 mt-4">
        <div>
          <h2 className="font-display text-2xl mb-5">Top Writers</h2>
          <WriterList writers={data.topWriters} empty="Top writer rankings will appear here soon." />
        </div>
        <div>
          <h2 className="font-display text-2xl mb-5">Newest Writers</h2>
          <WriterList writers={data.newestWriters} empty="No new writers yet." />
        </div>
      </section>
    </div>
  );
}

function Row({ title, chapters }) {
  if (!chapters?.length) return null;
  return (
    <section className="mb-14">
      <h2 className="font-display text-2xl mb-5">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {chapters.map((c) => <ChapterCard key={c.id} chapter={c} />)}
      </div>
    </section>
  );
}

function WriterList({ writers, empty }) {
  if (!writers?.length) return <p className="text-sm text-brown-300">{empty}</p>;
  return (
    <div className="space-y-3">
      {writers.map((w) => (
        <Link key={w.id} to={`/profile/${w.username}`} className="flex items-center gap-3 p-3 rounded-xl border border-brown-100/60 hover:border-gold transition-colors">
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
