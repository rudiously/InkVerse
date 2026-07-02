import { useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered, Quote, Heading2, Link as LinkIcon, Image as ImageIcon,
} from 'lucide-react';

/**
 * A lightweight contentEditable rich text editor.
 * For a production app, consider swapping this for TipTap or Slate —
 * this keeps the scaffold dependency-free while covering the spec's
 * required formatting: headings, bold, italic, underline, lists, quotes,
 * images, links.
 */
export default function RichTextEditor({ value, onChange, placeholder = 'Start writing...' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = useCallback((command, arg = null) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    onChange(ref.current.innerHTML);
  }, [onChange]);

  const handleInput = () => onChange(ref.current.innerHTML);

  const insertLink = () => {
    const url = window.prompt('Link URL');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = window.prompt('Image URL');
    if (url) exec('insertImage', url);
  };

  const toolbarBtn = (Icon, command, arg, label) => (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => exec(command, arg)}
      className="p-2 rounded-lg hover:bg-beige-100 dark:hover:bg-charcoal text-brown-700 dark:text-cream/80 transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="border border-brown-100 rounded-xl2 overflow-hidden bg-white/70 dark:bg-charcoal-soft">
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-brown-100/70 bg-beige-100/50 dark:bg-charcoal">
        {toolbarBtn(Heading2, 'formatBlock', '<h2>', 'Heading')}
        {toolbarBtn(Bold, 'bold', null, 'Bold')}
        {toolbarBtn(Italic, 'italic', null, 'Italic')}
        {toolbarBtn(Underline, 'underline', null, 'Underline')}
        {toolbarBtn(List, 'insertUnorderedList', null, 'Bullet list')}
        {toolbarBtn(ListOrdered, 'insertOrderedList', null, 'Numbered list')}
        {toolbarBtn(Quote, 'formatBlock', '<blockquote>', 'Quote')}
        <button
          type="button"
          title="Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLink}
          className="p-2 rounded-lg hover:bg-beige-100 dark:hover:bg-charcoal text-brown-700 dark:text-cream/80"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Image"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertImage}
          className="p-2 rounded-lg hover:bg-beige-100 dark:hover:bg-charcoal text-brown-700 dark:text-cream/80"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="prose-ink min-h-[400px] max-w-none px-6 py-6 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-brown-300"
      />
    </div>
  );
}
