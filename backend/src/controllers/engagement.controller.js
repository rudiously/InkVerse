import { supabase } from '../config/supabase.js';

export async function likeChapter(req, res, next) {
  try {
    const { id: chapterId } = req.params;
    const { error } = await supabase.from('likes').insert({ chapter_id: chapterId, user_id: req.user.id });
    if (error && error.code !== '23505') throw error;

    const { data: chapter } = await supabase.from('chapters').select('author_id, title').eq('id', chapterId).single();
    if (chapter && chapter.author_id !== req.user.id) {
      await supabase.from('notifications').insert({
        recipient_id: chapter.author_id,
        actor_id: req.user.id,
        type: 'like',
        chapter_id: chapterId,
        message: `${req.user.username} liked "${chapter.title}".`,
      });
    }

    res.json({ message: 'Liked.' });
  } catch (err) {
    next(err);
  }
}

export async function unlikeChapter(req, res, next) {
  try {
    const { id: chapterId } = req.params;
    await supabase.from('likes').delete().eq('chapter_id', chapterId).eq('user_id', req.user.id);
    res.json({ message: 'Unliked.' });
  } catch (err) {
    next(err);
  }
}

export async function bookmarkChapter(req, res, next) {
  try {
    const { id: chapterId } = req.params;
    const { error } = await supabase.from('bookmarks').insert({ chapter_id: chapterId, user_id: req.user.id });
    if (error && error.code !== '23505') throw error;
    res.json({ message: 'Bookmarked.' });
  } catch (err) {
    next(err);
  }
}

export async function removeBookmark(req, res, next) {
  try {
    const { id: chapterId } = req.params;
    await supabase.from('bookmarks').delete().eq('chapter_id', chapterId).eq('user_id', req.user.id);
    res.json({ message: 'Bookmark removed.' });
  } catch (err) {
    next(err);
  }
}

export async function myBookmarks(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('created_at, chapters(id, title, slug, cover_image_url, excerpt, author_id, users(username))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ bookmarks: data });
  } catch (err) {
    next(err);
  }
}
