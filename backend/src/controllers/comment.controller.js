import { supabase } from '../config/supabase.js';

export async function getComments(req, res, next) {
  try {
    const { chapterId } = req.params;
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(id, username, profiles(display_name, avatar_url))')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const top = data.filter((c) => !c.parent_comment_id);
    const replies = data.filter((c) => c.parent_comment_id);
    const withReplies = top.map((c) => ({ ...c, replies: replies.filter((r) => r.parent_comment_id === c.id) }));

    res.json({ comments: withReplies });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req, res, next) {
  try {
    const { chapterId } = req.params;
    const { content, parentCommentId } = req.body;

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({ chapter_id: chapterId, user_id: req.user.id, content, parent_comment_id: parentCommentId || null })
      .select('*, users(id, username, profiles(display_name, avatar_url))')
      .single();
    if (error) throw error;

    const { data: chapter } = await supabase.from('chapters').select('author_id, title').eq('id', chapterId).single();

    if (parentCommentId) {
      const { data: parent } = await supabase.from('comments').select('user_id').eq('id', parentCommentId).single();
      if (parent && parent.user_id !== req.user.id) {
        await supabase.from('notifications').insert({
          recipient_id: parent.user_id,
          actor_id: req.user.id,
          type: 'reply',
          chapter_id: chapterId,
          comment_id: comment.id,
          message: `${req.user.username} replied to your comment.`,
        });
      }
    } else if (chapter && chapter.author_id !== req.user.id) {
      await supabase.from('notifications').insert({
        recipient_id: chapter.author_id,
        actor_id: req.user.id,
        type: 'comment',
        chapter_id: chapterId,
        comment_id: comment.id,
        message: `${req.user.username} commented on "${chapter.title}".`,
      });
    }

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}

export async function editComment(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const { data: existing } = await supabase.from('comments').select('user_id').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Comment not found.' });
    if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Not your comment.' });

    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content, is_edited: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ comment });
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('comments').select('user_id').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Comment not found.' });
    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not your comment.' });
    }

    await supabase.from('comments').delete().eq('id', id);
    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function likeComment(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('comment_likes').insert({ comment_id: id, user_id: req.user.id });
    if (error && error.code !== '23505') throw error;
    await supabase.rpc('increment', { table_name: 'comments', row_id: id }).catch(() => {});
    // Fallback direct increment if RPC helper isn't set up
    const { data: c } = await supabase.from('comments').select('likes_count').eq('id', id).single();
    if (c) await supabase.from('comments').update({ likes_count: c.likes_count + 1 }).eq('id', id);
    res.json({ message: 'Comment liked.' });
  } catch (err) {
    next(err);
  }
}

export async function reportComment(req, res, next) {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;
    const { error } = await supabase.from('reports').insert({
      reporter_id: req.user.id,
      comment_id: id,
      reason,
      details,
    });
    if (error) throw error;
    res.json({ message: 'Comment reported. Our team will review it.' });
  } catch (err) {
    next(err);
  }
}
