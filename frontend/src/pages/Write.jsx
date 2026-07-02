import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image as ImageIcon, Save, Eye, Send, Loader2 } from 'lucide-react';
import api from '../api/client.js';
import RichTextEditor from '../components/RichTextEditor.jsx';

export default function Write() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [chapterId, setChapterId] = useState(id || null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [preview, setPreview] = useState(false);
  const autosaveTimer = useRef(null);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get(`/chapters/${id}`).then((r) => {
      const c = r.data.chapter;
      setTitle(c.title);
      setContent(c.content);
      setCoverImageUrl(c.cover_image_url || '');
      setCategoryId(c.category_id || '');
      setTagsInput((c.tags || []).join(', '));
    }).catch(() => {});
  }, [id]);

  const save = useCallback(async (status) => {
    setSaving(true);
    try {
      const payload = {
        title: title || 'Untitled',
        content,
        coverImageUrl: coverImageUrl || null,
        categoryId: categoryId || null,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        status,
      };
      if (chapterId) {
        const { data } = await api.put(`/chapters/${chapterId}`, payload);
        setLastSaved(new Date());
        return data.chapter;
      } else {
        const { data } = await api.post('/chapters', payload);
        setChapterId(data.chapter.id);
        setLastSaved(new Date());
        return data.chapter;
      }
    } finally {
      setSaving(false);
    }
  }, [title, content, coverImageUrl, categoryId, tagsInput, chapterId]);

  // Auto-save draft every 20s of inactivity
  useEffect(() => {
    if (!title && !content) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      save('draft').catch(() => {});
    }, 20000);
    return () => clearTimeout(autosaveTimer.current);
  }, [title, content, coverImageUrl, categoryId, tagsInput, save]);

  async function handlePublish() {
    const chapter = await save('published');
    if (chapter) navigate(`/chapter/${chapter.slug}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">{chapterId ? 'Edit Chapter' : 'Write a New Chapter'}</h1>
        <div className="flex items-center gap-3 text-xs text-brown-300">
          {saving ? (
            <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</span>
          ) : lastSaved ? (
            <span>Saved {lastSaved.toLocaleTimeString()}</span>
          ) : null}
        </div>
      </div>

      {preview ? (
        <PreviewPane title={title} content={content} coverImageUrl={coverImageUrl} />
      ) : (
        <div className="space-y-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter title"
            className="w-full font-display text-3xl bg-transparent border-b border-brown-100 focus:outline-none focus:border-gold pb-3 placeholder:text-brown-200"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-brown-300 mb-1 block">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-brown-100 bg-white/70 text-sm focus:outline-none focus:border-gold"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-brown-300 mb-1 block">Tags (comma separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="hope, midnight, first love"
                className="w-full px-3 py-2 rounded-lg border border-brown-100 bg-white/70 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-brown-300 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> Cover image URL
            </label>
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-brown-100 bg-white/70 text-sm focus:outline-none focus:border-gold"
            />
          </div>

          <RichTextEditor value={content} onChange={setContent} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-8">
        <button
          onClick={() => save('draft')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brown-100 text-brown-700 text-sm font-medium hover:border-gold hover:text-gold-deep transition-colors"
        >
          <Save className="w-4 h-4" /> Save Draft
        </button>
        <button
          onClick={() => setPreview((p) => !p)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brown-100 text-brown-700 text-sm font-medium hover:border-gold hover:text-gold-deep transition-colors"
        >
          <Eye className="w-4 h-4" /> {preview ? 'Back to Editing' : 'Preview'}
        </button>
        <button
          onClick={handlePublish}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-charcoal text-sm font-semibold hover:bg-gold-deep hover:text-cream transition-colors shadow-soft ml-auto"
        >
          <Send className="w-4 h-4" /> Publish
        </button>
      </div>
    </div>
  );
}

function PreviewPane({ title, content, coverImageUrl }) {
  return (
    <div>
      {coverImageUrl && <img src={coverImageUrl} alt="" className="w-full aspect-[21/9] object-cover rounded-xl2 mb-6" />}
      <h1 className="font-display text-4xl mb-6">{title || 'Untitled'}</h1>
      <div className="prose-ink" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
