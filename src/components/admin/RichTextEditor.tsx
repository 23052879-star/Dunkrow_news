import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code,
  Undo, 
  Redo, 
  Link2, 
  Image as ImageIcon, 
  Youtube as YoutubeIcon,
  HelpCircle
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = 'Start writing your article here...' 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-500 underline hover:text-red-400'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full mx-auto my-6 border border-neutral-800'
        }
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'rounded-xl w-full aspect-video my-6 border border-neutral-800'
        }
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-neutral-600 before:float-left before:pointer-events-none before:h-0'
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  React.useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="h-64 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-500">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Loading Rich Text Editor...</span>
        </div>
      </div>
    );
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('Enter YouTube URL:');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const Button = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all active:scale-95 ${
        active 
          ? 'bg-red-600 text-white shadow shadow-red-950/20' 
          : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 flex flex-col focus-within:ring-2 focus-within:ring-red-500/50 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-neutral-900 border-b border-neutral-800">
        <Button 
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </Button>
        <Button 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </Button>
        <div className="w-px h-6 bg-neutral-800 mx-1"></div>

        <Button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </Button>
        <Button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </Button>
        <Button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </Button>
        <div className="w-px h-6 bg-neutral-800 mx-1"></div>

        <Button 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </Button>
        <Button 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </Button>
        <div className="w-px h-6 bg-neutral-800 mx-1"></div>

        <Button 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={16} />
        </Button>
        <Button 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code size={16} />
        </Button>
        <div className="w-px h-6 bg-neutral-800 mx-1"></div>

        <Button onClick={addLink} active={editor.isActive('link')} title="Insert Link">
          <Link2 size={16} />
        </Button>
        <Button onClick={addImage} title="Insert Image">
          <ImageIcon size={16} />
        </Button>
        <Button onClick={addYoutube} title="Insert YouTube Video">
          <YoutubeIcon size={16} />
        </Button>
        <div className="w-px h-6 bg-neutral-800 mx-1"></div>

        <Button 
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={16} />
        </Button>
        <Button 
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={16} />
        </Button>
      </div>

      {/* Editor Content Workspace */}
      <div className="p-4 min-h-[300px] max-h-[600px] overflow-y-auto prose prose-invert max-w-none text-neutral-300 focus:outline-none">
        <EditorContent editor={editor} className="focus:outline-none" />
      </div>
    </div>
  );
};

export default RichTextEditor;
