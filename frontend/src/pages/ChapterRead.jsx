import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Bookmark, Share2, MessageCircle, Eye, Clock, UserPlus, UserCheck } from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ChapterCard from '../components/ChapterCard.jsx';

export default function ChapterRead() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const contentRef = useRef(null);

  const load = useCallback(() => {
    api.get(`/chapters/${slug}`).then((r) => setData(r.data)).catch(() => {});
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!data?.chapter) return;
    api.get(`/chapters/${data.chapter.id}/comments`).then((r) => setComments(r.data.comments || [])).catch(() => {});
  }, [data?.chapter?.id]);

  // Reading progress bar
  useEffect(() => {
    function onScroll() {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [data]);

  if (!data?.chapter) {
    return <div className="max-w-3xl mx-auto px-4 py-24 text-center text-brown-300">Loading chapter...</div>;
  }

  const { chapter, otherByAuthor, related, isLiked, isBookmarked } = data;
  const author = chapter.author;

  async function toggleLike() {
    if (!user) return alert('Log in to like chapters.');
    if (isLiked) await api.delete(`/chapters/${chapter.id}/like`);
    else await api.post(`/chapters/${chapter.id}/like`);
    load();
  }

  async function toggleBookmark() {
    if (!user) return alert('Log in to bookmark chapters.');
    if (isBookmarked) await api.delete(`/chapters/${chapter.id}/bookmark`);
    else await api.post(`/chapters/${chapter.id}/bookmark`);
    load();
  }

  async function toggleFollow() {
    if (!user) return alert('Log in to follow writers.');
    if (isFollowing) await api.delete(`/users/${author.id}/follow`);
    else await api.post(`/users/${author.id}/follow`);
    setIsFollowing((f) => !f);
  }

  function share() {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    alert('Link copied to clipboard.');
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!user) return alert('Log in to comment.');
    if (!commentText.trim()) return;
    const { data: res } = await api.post(`/chapters/${chapter.id}/comments`, {
      content: commentText,
      parentCommentId: replyTo,
    });
    setCommentText('');
    setReplyTo(null);
    setComments((prev) => {
      if (replyTo) {
        return prev.map((c) => (c.id === replyTo ? { ...c, replies: [...(c.replies || []), res.comment] } : c));
      }
      return [...prev, { ...res.comment, replies: [] }];
    });
  }

  return (
    <div>
      <div className="fixed top-16 left-0 right-0 h-1 bg-beige-100 z-30">
        <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
      </div>

      <article ref={contentRef} className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {chapter.cover_image_url && (
          <img src={chapter.cover_image_url} alt={chapter.title} className="w-full aspect-[21/9] object-cover rounded-xl2 mb-8" />
        )}

        {chapter.categories?.name && (
          <span className="text-xs uppercase tracking-wider text-gold-deep font-semibold">{chapter.categories.name}</span>
        )}
        <h1 className="font-display text-4xl sm:text-5xl leading-tight mt-3 mb-6">{chapter.title}</h1>

        <div className="flex flex-wrap items-center gap-4 mb-10 pb-6 border-b border-brown-100/60">
          <Link to={`/profile/${author?.username}`} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-beige-200 overflow-hidden">
              {author?.profiles?.avatar_url && <img src={author.profiles.avatar_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div>
              <div className="font-medium text-sm">{author?.profiles?.display_name || author?.username}</div>
              <div className="text-xs text-brown-300">
                {chapter.published_at && new Date(chapter.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </Link>
          {user?.id !== author?.id && (
            <button onClick={toggleFollow} className="ml-auto sm:ml-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-brown-100 text-xs font-medium hover:border-gold hover:text-gold-deep">
              {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          <div className="flex items-center gap-4 text-xs text-brown-300 ml-auto">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{chapter.reading_time_minutes} min read</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{chapter.views_count}</span>
          </div>
        </div>

        <div className="prose-ink" dangerouslySetInnerHTML={{ __html: chapter.content }} />

        {chapter.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10">
            {chapter.tags.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-beige-100 text-xs text-brown-500">#{t}</span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-3 mt-10 pt-6 border-t border-brown-100/60">
          <button onClick={toggleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-brown-100 text-brown-500 hover:border-gold hover:text-gold-deep'}`}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {chapter.likes_count}
          </button>
          <button onClick={toggleBookmark} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isBookmarked ? 'bg-gold/15 border-gold text-gold-deep' : 'border-brown-100 text-brown-500 hover:border-gold hover:text-gold-deep'}`}>
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} /> Bookmark
          </button>
          <button onClick={share} className="flex items-center gap-2 px-4 py-2 rounded-full border border-brown-100 text-sm font-medium text-brown-500 hover:border-gold hover:text-gold-deep">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <span className="ml-auto flex items-center gap-2 text-sm text-brown-300"><MessageCircle className="w-4 h-4" /> {comments.length} comments</span>
        </div>

        {/* About the author */}
        {author && (
          <div className="mt-14 p-6 rounded-xl2 bg-beige-100/50 border border-brown-100/60 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-beige-200 overflow-hidden shrink-0">
              {author.profiles?.avatar_url && <img src={author.profiles.avatar_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div>
              <div className="font-display text-lg">{author.profiles?.display_name || author.username}</div>
              <p className="text-sm text-brown-500 line-clamp-2">{author.profiles?.bio}</p>
              <Link to={`/profile/${author.username}`} className="text-xs text-gold-deep hover:underline">View profile</Link>
            </div>
          </div>
        )}

        {/* Comments */}
        <section className="mt-14">
          <h2 className="font-display text-2xl mb-6">Comments</h2>
          <form onSubmit={submitComment} className="mb-8">
            {replyTo && (
              <div className="text-xs text-brown-300 mb-1">
                Replying to comment — <button type="button" onClick={() => setReplyTo(null)} className="underline">cancel</button>
              </div>
            )}
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={user ? 'Share your thoughts...' : 'Log in to comment'}
              disabled={!user}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-brown-100 bg-white/70 text-sm focus:outline-none focus:border-gold disabled:opacity-50"
            />
            <button type="submit" disabled={!user} className="mt-2 px-5 py-2 rounded-full bg-gold text-charcoal text-sm font-semibold disabled:opacity-40">
              Post Comment
            </button>
          </form>

          <div className="space-y-6">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} onReply={() => setReplyTo(c.id)} />
            ))}
            {comments.length === 0 && <p className="text-sm text-brown-300">Be the first to leave a comment.</p>}
          </div>
        </section>

        {/* Other by author */}
        {otherByAuthor?.length > 0 && (
          <RelatedSection title="Other Chapters by This Writer" chapters={otherByAuthor} />
        )}
        {related?.length > 0 && (
          <RelatedSection title="Related Chapters" chapters={related} />
        )}
      </article>
    </div>
  );
}

function CommentItem({ comment, onReply }) {
  const [reported, setReported] = useState(false);
  async function report() {
    await api.post(`/comments/${comment.id}/report`, { reason: 'inappropriate' });
    setReported(true);
  }
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-beige-200 overflow-hidden shrink-0">
        {comment.users?.profiles?.avatar_url && <img src={comment.users.profiles.avatar_url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.users?.profiles?.display_name || comment.users?.username}</span>
          <span className="text-xs text-brown-300">{new Date(comment.created_at).toLocaleDateString()}</span>
          {comment.is_edited && <span className="text-xs text-brown-300">(edited)</span>}
        </div>
        <p className="text-sm text-brown-700 mt-1">{comment.content}</p>
        <div className="flex items-center gap-4 mt-1 text-xs text-brown-300">
          <button className="hover:text-gold-deep">Like ({comment.likes_count})</button>
          <button onClick={onReply} className="hover:text-gold-deep">Reply</button>
          {!reported ? (
            <button onClick={report} className="hover:text-red-500">Report</button>
          ) : (
            <span>Reported</span>
          )}
        </div>
        {comment.replies?.length > 0 && (
          <div className="mt-4 ml-4 space-y-4 border-l border-brown-100/60 pl-4">
            {comment.replies.map((r) => <CommentItem key={r.id} comment={r} onReply={onReply} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function RelatedSection({ title, chapters }) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl mb-6">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {chapters.map((c) => <ChapterCard key={c.id} chapter={c} />)}
      </div>
    </section>
  );
}
