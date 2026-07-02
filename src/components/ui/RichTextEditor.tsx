import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { cn, sanitizeHtml } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

// `execCommand` is deprecated but still universally supported and is the
// lightest way to ship a working WYSIWYG toolbar without a heavy dependency.
type Command = { key: string; label: string; Icon: typeof Bold; run: () => void };

/**
 * Minimal HTML rich-text editor built on a contentEditable surface. Every
 * toolbar button performs a real formatting command; the produced HTML is what
 * gets stored in the question field (the backend persists it verbatim).
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type here',
  error,
  className,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external value into the DOM only when it actually differs (e.g. when
  // switching between questions) so typing never resets the caret position.
  useEffect(() => {
    const el = ref.current;
    if (el && value !== el.innerHTML) el.innerHTML = sanitizeHtml(value);
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    // Treat a visually empty editor as an empty string so validation still fires.
    const isEmpty = el.textContent?.trim() === '' && !el.querySelector('img');
    onChange(isEmpty ? '' : el.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt('Enter a URL (https://…)');
    if (url) exec('createLink', url);
  };

  // Sanitize pasted content so arbitrary/malicious HTML never enters the field.
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    if (html) document.execCommand('insertHTML', false, sanitizeHtml(html));
    else document.execCommand('insertText', false, text);
    emit();
  };

  const commands: Command[] = [
    { key: 'bold', label: 'Bold', Icon: Bold, run: () => exec('bold') },
    { key: 'italic', label: 'Italic', Icon: Italic, run: () => exec('italic') },
    { key: 'underline', label: 'Underline', Icon: Underline, run: () => exec('underline') },
    {
      key: 'strike',
      label: 'Strikethrough',
      Icon: Strikethrough,
      run: () => exec('strikeThrough'),
    },
    {
      key: 'ul',
      label: 'Bulleted list',
      Icon: List,
      run: () => exec('insertUnorderedList'),
    },
    {
      key: 'ol',
      label: 'Numbered list',
      Icon: ListOrdered,
      run: () => exec('insertOrderedList'),
    },
    { key: 'link', label: 'Insert link', Icon: Link2, run: addLink },
  ];

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-surface-border bg-surface-muted/60 px-2 py-1.5">
        {commands.map(({ key, label, Icon, run }) => (
          <button
            key={key}
            type="button"
            title={label}
            aria-label={label}
            // Prevent the button from stealing focus/selection before the command runs.
            onMouseDown={(e) => e.preventDefault()}
            onClick={run}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition hover:bg-white hover:text-brand-600"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Question text"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onPaste={handlePaste}
        className={cn(
          'rte-content min-h-[120px] w-full rounded-b-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink-900 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
        )}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
