import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';

const CHAPTER_LIST_FIELDS = `
id,
title,
slug,
excerpt,
cover_image_url,
category_id,
status,
reading_time_minutes,
views_count,
likes_count,
comments_count,
is_featured,
published_at,
created_at,
author_id,
categories(
  id,
  name,
  slug
),
author:users!chapters_author_id_fkey(
  id,
  username
)
`;
function estimateReadingTime(html = '') {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function uniqueSlug(title) {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 60) || 'untitled';
  let slug = `${base}-${uuidv4().slice(0, 6)}`;
  return slug;
}

// ---------------------------------------------------------------------------
// Create / Update / Publish
// ---------------------------------------------------------------------------

export async function createChapter(req, res, next) {
  try {
    const { title, content, categoryId, coverImageUrl, tags = [], status = 'draft' } = req.body;

    const slug = await uniqueSlug(title || 'untitled');
    const excerpt = (content || '').replace(/<[^>]+>/g, '').slice(0, 200);

    const { data: chapter, error } = await supabase
      .from('chapters')
      .insert({
        author_id: req.user.id,
        title: title || 'Untitled',
        slug,
        content: content || '',
        excerpt,
        cover_image_url: coverImageUrl || null,
        category_id: categoryId || null,
        status,
        reading_time_minutes: estimateReadingTime(content),
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    if (tags.length) await attachTags(chapter.id, tags);

    res.status(201).json({ chapter });
  } catch (err) {
    next(err);
  }
}

export async function updateChapter(req, res, next) {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('chapters').select('author_id, status').eq('id', id).single();

    if (!existing) return res.status(404).json({ error: 'Chapter not found.' });
    if (existing.author_id !== req.user.id) return res.status(403).json({ error: 'Not your chapter.' });

    const { title, content, categoryId, coverImageUrl, tags, status } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) {
      updates.content = content;
      updates.excerpt = content.replace(/<[^>]+>/g, '').slice(0, 200);
      updates.reading_time_minutes = estimateReadingTime(content);
    }
    if (categoryId !== undefined) updates.category_id = categoryId;
    if (coverImageUrl !== undefined) updates.cover_image_url = coverImageUrl;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published' && existing.status !== 'published') {
        updates.published_at = new Date().toISOString();
      }
    }

    const { data: chapter, error } = await supabase.from('chapters').update(updates).eq('id', id).select().single();
    if (error) throw error;

    if (tags) {
      await supabase.from('chapter_tags').delete().eq('chapter_id', id);
      if (tags.length) await attachTags(id, tags);
    }

    res.json({ chapter });
  } catch (err) {
    next(err);
  }
}

async function attachTags(chapterId, tagNames) {
  const rows = [];
  for (const name of tagNames) {
    const slug = slugify(name, { lower: true, strict: true });
    let { data: tag } = await supabase.from('tags').select('id').eq('slug', slug).maybeSingle();
    if (!tag) {
      const { data: created } = await supabase.from('tags').insert({ name, slug }).select('id').single();
      tag = created;
    }
    if (tag) rows.push({ chapter_id: chapterId, tag_id: tag.id });
  }
  if (rows.length) await supabase.from('chapter_tags').insert(rows);
}

export async function deleteChapter(req, res, next) {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('chapters').select('author_id').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Chapter not found.' });
    if (existing.author_id !== req.user.id) return res.status(403).json({ error: 'Not your chapter.' });

    await supabase.from('chapters').delete().eq('id', id);
    res.json({ message: 'Chapter deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function archiveChapter(req, res, next) {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('chapters').select('author_id').eq('id', id).single();
    if (!existing) return res.status(404).json({ error: 'Chapter not found.' });
    if (existing.author_id !== req.user.id) return res.status(403).json({ error: 'Not your chapter.' });

    const { data: chapter, error } = await supabase
      .from('chapters')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ chapter });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Explore / listing
// ---------------------------------------------------------------------------

export async function exploreChapters(req, res, next) {
  try {
    const {
      search,
      category,
      author,
      sort = "latest",
      page = 1,
      limit = 12,
    } = req.query;

    let query = supabase
      .from("chapters")
      .select(CHAPTER_LIST_FIELDS, { count: "exact" })
      .eq("status", "published");

    // Search
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Category Filter
    if (category) {
      const { data: categoryRow } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category)
        .single();

      if (categoryRow) {
        query = query.eq("category_id", categoryRow.id);
      }
    }

    // Author Filter
    if (author) {
      query = query.eq("author.username", author);
    }

    switch (sort) {
      case "mostLiked":
        query = query.order("likes_count", { ascending: false });
        break;

      case "mostViewed":
        query = query.order("views_count", { ascending: false });
        break;

      case "popular":
        query = query
          .order("likes_count", { ascending: false })
          .order("views_count", { ascending: false });
        break;

      default:
        query = query.order("published_at", { ascending: false });
    }

    const from = (page - 1) * limit;
    const to = from + Number(limit) - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      chapters: data,
      total: count,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function getFeatured(_req, res, next) {
  try {
    // Try featured chapter first
    let { data, error } = await supabase
      .from("chapters")
      .select(CHAPTER_LIST_FIELDS)
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    // If none exists, return latest published chapter
    if (!data) {
      const { data: latest, error: latestError } = await supabase
        .from("chapters")
        .select(CHAPTER_LIST_FIELDS)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) throw latestError;

      data = latest;
    }

    res.json({
      chapter: data,
    });

  } catch (err) {
    next(err);
  }
}
// ---------------------------------------------------------------------------
// My chapters (dashboard)
// ---------------------------------------------------------------------------

export async function myChapters(req, res, next) {
  try {
    const { status, sort = 'newest', search } = req.query;

    let query = supabase.from('chapters').select('*').eq('author_id', req.user.id);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('title', `%${search}%`);

    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'mostViewed':
        query = query.order('views_count', { ascending: false });
        break;
      case 'mostLiked':
        query = query.order('likes_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    const stats = {
      published: data.filter((c) => c.status === 'published').length,
      drafts: data.filter((c) => c.status === 'draft').length,
      archived: data.filter((c) => c.status === 'archived').length,
      totalViews: data.reduce((s, c) => s + (c.views_count || 0), 0),
      totalLikes: data.reduce((s, c) => s + (c.likes_count || 0), 0),
      totalComments: data.reduce((s, c) => s + (c.comments_count || 0), 0),
    };

    res.json({ chapters: data, stats });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Single chapter read page
// ---------------------------------------------------------------------------

export async function getChapterBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const { data: chapter, error } = await supabase
      .from("chapters")
      .select(`
        *,
        categories(id, name, slug),
        author:users!chapters_author_id_fkey(
          id,
          username,
          profiles(
            display_name,
            avatar_url,
            bio
          )
        )
      `)
      .eq("slug", slug)
      .single();

    if (error || !chapter) {
      return res.status(404).json({
        error: "Chapter not found.",
      });
    }

    if (
      chapter.status !== "published" &&
      chapter.author_id !== req.user?.id
    ) {
      return res.status(404).json({
        error: "Chapter not found.",
      });
    }

    // -----------------------------
    // Record the view
    // -----------------------------

    await supabase.from("chapter_views").insert({
      chapter_id: chapter.id,
      user_id: req.user?.id || null,
    });

    await supabase.rpc("increment_views", {
      chapter_uuid: chapter.id,
    });

    // Get latest view count
    const { data: updatedChapter } = await supabase
      .from("chapters")
      .select("views_count")
      .eq("id", chapter.id)
      .single();

    if (updatedChapter) {
      chapter.views_count = updatedChapter.views_count;
    }

    // -----------------------------
    // Tags
    // -----------------------------

    const { data: tagsRows } = await supabase
      .from("chapter_tags")
      .select("tags(name, slug)")
      .eq("chapter_id", chapter.id);

    // -----------------------------
    // Other chapters by same author
    // -----------------------------

    const { data: otherByAuthor } = await supabase
      .from("chapters")
      .select("id,title,slug,cover_image_url")
      .eq("author_id", chapter.author_id)
      .eq("status", "published")
      .neq("id", chapter.id)
      .limit(4);

    // -----------------------------
    // Related chapters
    // -----------------------------

    const { data: related } = await supabase
      .from("chapters")
      .select("id,title,slug,cover_image_url,category_id")
      .eq("category_id", chapter.category_id)
      .eq("status", "published")
      .neq("id", chapter.id)
      .limit(4);

    // -----------------------------
    // Like & Bookmark Status
    // -----------------------------

    let isLiked = false;
    let isBookmarked = false;

    if (req.user) {
      const [{ data: like }, { data: bookmark }] =
        await Promise.all([
          supabase
            .from("likes")
            .select("*")
            .eq("chapter_id", chapter.id)
            .eq("user_id", req.user.id)
            .maybeSingle(),

          supabase
            .from("bookmarks")
            .select("*")
            .eq("chapter_id", chapter.id)
            .eq("user_id", req.user.id)
            .maybeSingle(),
        ]);

      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    res.json({
      chapter: {
        ...chapter,
        tags: (tagsRows || [])
          .map((t) => t.tags?.name)
          .filter(Boolean),
      },
      otherByAuthor,
      related,
      isLiked,
      isBookmarked,
    });

  } catch (err) {
    next(err);
  }
}export async function getTrending(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("chapters")
      .select(CHAPTER_LIST_FIELDS)
      .eq("status", "published")
      .order("views_count", { ascending: false })
      .order("likes_count", { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({
      chapters: data,
    });
  } catch (err) {
    next(err);
  }
}