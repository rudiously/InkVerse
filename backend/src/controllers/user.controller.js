import { supabase } from '../config/supabase.js';

export async function getProfileByUsername(req, res, next) {
  try {
    const { username } = req.params;
    const { data: user } = await supabase
      .from('users')
      .select('id, username, created_at')
      .eq('username', username)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: 'Writer not found.' });

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

    const [{ count: chaptersCount }, { count: followersCount }, { count: followingCount }, { data: chapters }] =
      await Promise.all([
        supabase.from('chapters').select('id', { count: 'exact', head: true }).eq('author_id', user.id).eq('status', 'published'),
        supabase.from('followers').select('follower_id', { count: 'exact', head: true }).eq('following_id', user.id),
        supabase.from('followers').select('following_id', { count: 'exact', head: true }).eq('follower_id', user.id),
        supabase
          .from('chapters')
          .select('id, title, slug, cover_image_url, views_count, likes_count, published_at, category_id')
          .eq('author_id', user.id)
          .eq('status', 'published')
          .order('published_at', { ascending: false }),
      ]);

    const totalViews = (chapters || []).reduce((sum, c) => sum + (c.views_count || 0), 0);
    const totalLikes = (chapters || []).reduce((sum, c) => sum + (c.likes_count || 0), 0);

    let isFollowing = false;
    if (req.user) {
      const { data } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', req.user.id)
        .eq('following_id', user.id)
        .maybeSingle();
      isFollowing = !!data;
    }

    res.json({
      user: { id: user.id, username: user.username, joinedAt: user.created_at },
      profile,
      stats: {
        publishedChapters: chaptersCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0,
        totalViews,
        totalLikes,
      },
      chapters,
      isFollowing,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const { displayName, bio, avatarUrl, coverUrl, location, website } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...(displayName !== undefined && { display_name: displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
        ...(coverUrl !== undefined && { cover_url: coverUrl }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
      })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
}

export async function followUser(req, res, next) {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ error: "You can't follow yourself." });
    }

    const { error } = await supabase.from('followers').insert({ follower_id: req.user.id, following_id: userId });
    if (error && error.code !== '23505') throw error; // ignore duplicate follow

    await supabase.from('notifications').insert({
      recipient_id: userId,
      actor_id: req.user.id,
      type: 'follow',
      message: `${req.user.username} started following you.`,
    });

    res.json({ message: 'Followed.' });
  } catch (err) {
    next(err);
  }
}

export async function unfollowUser(req, res, next) {
  try {
    const { userId } = req.params;
    await supabase.from('followers').delete().eq('follower_id', req.user.id).eq('following_id', userId);
    res.json({ message: 'Unfollowed.' });
  } catch (err) {
    next(err);
  }
}

export async function getReadingHistory(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('reading_history')
      .select('*, chapters(id, title, slug, cover_image_url, author_id)')
      .eq('user_id', req.user.id)
      .order('last_read_at', { ascending: false });
    if (error) throw error;
    res.json({ history: data });
  } catch (err) {
    next(err);
  }
}
