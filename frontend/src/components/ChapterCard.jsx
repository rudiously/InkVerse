import { Link } from 'react-router-dom';
import { Heart, Eye, Clock } from 'lucide-react';

export default function ChapterCard({ chapter }) {
  const author = chapter.users?.username || chapter.author?.username;
  const category = chapter.categories?.name;
  const publishedAt = chapter.published_at ? new Date(chapter.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <Link
      to={`/chapter/${chapter.slug}`}
      className="group block rounded-xl2 overflow-hidden bg-white/60 dark:bg-charcoal-soft border border-brown-100/60 hover:shadow-lift transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden bg-beige-200">
        {chapter.cover_image_url ? (
          <img
            src={chapter.cover_image_url}
            alt={chapter.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-beige-100 to-brown-100">
            <span className="font-display text-3xl text-brown-300">Ink</span>
          </div>
        )}
      </div>
      <div className="p-5">
        {category && (
          <span className="inline-block text-[11px] uppercase tracking-wider font-semibold text-gold-deep mb-2">
            {category}
          </span>
        )}
        <h3 className="font-display text-lg leading-snug text-charcoal dark:text-cream mb-1 line-clamp-2">
          {chapter.title}
        </h3>
        {chapter.excerpt && (
          <p className="text-sm text-brown-500 line-clamp-2 mb-3">{chapter.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-brown-300">
          <span>by {author ? `@${author}` : 'Unknown'}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{chapter.reading_time_minutes || 1}m</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{chapter.views_count || 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{chapter.likes_count || 0}</span>
          </div>
        </div>
        {publishedAt && <div className="mt-2 text-[11px] text-brown-300">{publishedAt}</div>}
      </div>
    </Link>
  );
}
