import { supabase } from '../config/supabase.js';

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function listCategories(_req, res, next) {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    if (error) throw error;
    res.json({ categories: data });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function myNotifications(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:users!notifications_actor_id_fkey(username, profiles(display_name, avatar_url))')
      .eq('recipient_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ notifications: data });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('recipient_id', req.user.id);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    next(err);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', req.user.id).eq('is_read', false);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Community page aggregates
// ---------------------------------------------------------------------------

export async function communityOverview(_req, res, next) {
  try {
    const [
      { data: topWriters },
      { data: trending },
      { data: newestWriters },
      { data: recentlyPublished },
      { data: editorsPicks },
      { data: challenges },
    ] = await Promise.all([
      supabase.rpc('get_top_writers').then((r) => (r.error ? { data: [] } : r)),
      supabase
        .from('chapters')
        .select('id, title, slug, cover_image_url, views_count, likes_count, users(username)')
        .eq('status', 'published')
        .order('views_count', { ascending: false })
        .limit(6),
      supabase
        .from('users')
        .select('id, username, created_at, profiles(display_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('chapters')
        .select('id, title, slug, cover_image_url, published_at, users(username)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(8),
      supabase
        .from('chapters')
        .select('id, title, slug, cover_image_url, users(username)')
        .eq('status', 'published')
        .eq('is_featured', true)
        .limit(4),
      supabase
        .from('writing_challenges')
        .select('*')
        .gte('ends_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(3),
    ]);

    res.json({
      topWriters: topWriters || [],
      trending,
      newestWriters,
      recentlyPublished,
      editorsPicks,
      challenges,
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Global search
// ---------------------------------------------------------------------------

export async function globalSearch(req, res, next) {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json({ chapters: [], writers: [], categories: [], tags: [] });

    const [{ data: chapters }, { data: writers }, { data: categories }, { data: tags }] = await Promise.all([
      supabase
        .from('chapters')
        .select('id, title, slug, cover_image_url, users(username)')
        .eq('status', 'published')
        .ilike('title', `%${q}%`)
        .limit(8),
      supabase.from('users').select('id, username, profiles(display_name, avatar_url)').ilike('username', `%${q}%`).limit(6),
      supabase.from('categories').select('*').ilike('name', `%${q}%`).limit(6),
      supabase.from('tags').select('*').ilike('name', `%${q}%`).limit(6),
    ]);

    res.json({ chapters, writers, categories, tags });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Platform stats (home page)
// ---------------------------------------------------------------------------

export async function platformStats(_req, res, next) {
  try {
    const [{ count: writers }, { count: chapters }, { data: views }, { count: likes }] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('chapters').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('chapters').select('views_count').eq('status', 'published'),
      supabase.from('likes').select('chapter_id', { count: 'exact', head: true }),
    ]);

    const totalReads = (views || []).reduce((sum, c) => sum + (c.views_count || 0), 0);

    res.json({
      writersJoined: writers || 0,
      chaptersPublished: chapters || 0,
      totalReads,
      likesGiven: likes || 0,
    });
  } catch (err) {
    next(err);
  }
}
