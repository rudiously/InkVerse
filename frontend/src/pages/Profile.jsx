import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, UserCheck, Share2 } from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ChapterCard from '../components/ChapterCard.jsx';
import StatCard from '../components/StatCard.jsx';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/users/${username}`).then((r) => setData(r.data)).catch(() => setData(null));
  }, [username]);

  if (!data) return <div className="max-w-3xl mx-auto px-4 py-24 text-center text-brown-300">Loading profile...</div>;

  const { user: profileUser, profile, stats, chapters, isFollowing } = data;
  const isMe = user?.username === username;

  async function toggleFollow() {
    if (!user) return alert('Log in to follow writers.');
    if (isFollowing) await api.delete(`/users/${profileUser.id}/follow`);
    else await api.post(`/users/${profileUser.id}/follow`);
    setData((d) => ({ ...d, isFollowing: !d.isFollowing }));
  }

  function shareProfile() {
    navigator.clipboard?.writeText(window.location.href);
    alert('Profile link copied.');
  }

  return (
    <div>
      <div className="h-56 bg-gradient-to-br from-beige-200 to-brown-100 relative overflow-hidden">
        {profile?.cover_url && <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-14 mb-8">
          <div className="w-28 h-28 rounded-full border-4 border-cream bg-beige-200 overflow-hidden shrink-0">
            {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl">{profile?.display_name || profileUser.username}</h1>
            <p className="text-brown-300 text-sm">@{profileUser.username} · Joined {new Date(profileUser.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-3">
            {!isMe && (
              <button onClick={toggleFollow} className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gold text-charcoal text-sm font-semibold">
                {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            <button onClick={shareProfile} className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-brown-100 text-sm font-medium hover:border-gold hover:text-gold-deep">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {profile?.bio && <p className="text-brown-500 max-w-2xl mb-8">{profile.bio}</p>}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
          <StatCard label="Chapters" value={stats.publishedChapters} />
          <StatCard label="Followers" value={stats.followers} />
          <StatCard label="Following" value={stats.following} />
          <StatCard label="Total Views" value={stats.totalViews} />
          <StatCard label="Total Likes" value={stats.totalLikes} />
        </div>

        <h2 className="font-display text-2xl mb-6">Published Chapters</h2>
        {chapters?.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {chapters.map((c) => <ChapterCard key={c.id} chapter={{ ...c, users: { username: profileUser.username } }} />)}
          </div>
        ) : (
          <p className="text-brown-300 pb-16">No published chapters yet.</p>
        )}
      </div>
    </div>
  );
}
