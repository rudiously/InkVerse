import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Trophy, Megaphone } from 'lucide-react';
import api from '../api/client.js';

const ICONS = {
  like: Heart,
  comment: MessageCircle,
  reply: MessageCircle,
  follow: UserPlus,
  milestone: Trophy,
  challenge: Trophy,
  system: Megaphone,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(null);

  function load() {
    api.get('/notifications').then((r) => setNotifications(r.data.notifications || [])).catch(() => setNotifications([]));
  }
  useEffect(() => { load(); }, []);

  async function markAll() {
    await api.post('/notifications/read-all');
    load();
  }

  async function markOne(id) {
    await api.post(`/notifications/${id}/read`);
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl">Notifications</h1>
        <button onClick={markAll} className="text-sm text-gold-deep hover:underline">Mark all read</button>
      </div>

      {notifications === null ? (
        <p className="text-brown-300">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-brown-300">You're all caught up.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Megaphone;
            const content = (
              <div
                onClick={() => !n.is_read && markOne(n.id)}
                className={`flex items-start gap-3 p-4 rounded-xl2 border cursor-pointer transition-colors ${
                  n.is_read ? 'border-brown-100/40 bg-white/30' : 'border-gold/40 bg-gold/5'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-beige-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-gold-deep" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-brown-700">{n.message}</p>
                  <p className="text-xs text-brown-300 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-gold shrink-0 mt-2" />}
              </div>
            );
            return n.chapter_id ? (
              <Link key={n.id} to={`/chapter/${n.chapter_id}`}>{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
