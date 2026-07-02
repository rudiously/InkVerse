import { supabase } from '../config/supabase.js';

export async function adminDashboard(_req, res, next) {
  try {
    const [{ count: users }, { count: chapters }, { count: pendingReports }, { count: publishedToday }] =
      await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('chapters').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase
          .from('chapters')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .gte('published_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      ]);

    res.json({ users: users || 0, chapters: chapters || 0, pendingReports: pendingReports || 0, publishedToday: publishedToday || 0 });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteChapter(req, res, next) {
  try {
    const { id } = req.params;
    await supabase.from('chapters').delete().eq('id', id);
    res.json({ message: 'Chapter removed.' });
  } catch (err) {
    next(err);
  }
}

export async function adminFeatureChapter(req, res, next) {
  try {
    const { id } = req.params;
    const { featured = true } = req.body;
    const { data, error } = await supabase.from('chapters').update({ is_featured: featured }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ chapter: data });
  } catch (err) {
    next(err);
  }
}

export async function adminSuspendUser(req, res, next) {
  try {
    const { id } = req.params;
    const { suspended = true } = req.body;
    const { data, error } = await supabase.from('users').update({ is_suspended: suspended }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ user: { id: data.id, isSuspended: data.is_suspended } });
  } catch (err) {
    next(err);
  }
}

export async function adminListReports(req, res, next) {
  try {
    const { status = 'pending' } = req.query;
    const { data, error } = await supabase
      .from('reports')
      .select('*, reporter:users!reports_reporter_id_fkey(username), chapters(title, slug), comments(content)')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ reports: data });
  } catch (err) {
    next(err);
  }
}

export async function adminResolveReport(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'reviewed' | 'dismissed' | 'actioned'
    const { data, error } = await supabase.from('reports').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ report: data });
  } catch (err) {
    next(err);
  }
}

export async function adminCreateCategory(req, res, next) {
  try {
    const { name, slug, description, icon } = req.body;
    const { data, error } = await supabase.from('categories').insert({ name, slug, description, icon }).select().single();
    if (error) throw error;
    res.status(201).json({ category: data });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await supabase.from('categories').delete().eq('id', id);
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
}
