import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Strike from '@tiptap/extension-strike';


import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Eye,
  Trash2,
  Undo,
  Redo,
  Highlighter,
  FileText,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  TypeOutline,
  Hash,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Minus,
  Palette,
  Table as TableIcon,
  ChevronDown,
} from 'lucide-react';
import PersonalizationTokens from './personalization-tokens';

// Typography constants removed as requested: COLORS
const FONTS = [
  'Arial',
  'Helvetica',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Courier New',
  'Brush Script MT',
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

// 🔴 Custom font size extension
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize.replace(/['"]/g, ''),
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize:
        (fontSize) =>
          ({ chain }) => {
            return chain().setMark('textStyle', { fontSize }).run();
          },
      unsetFontSize:
        () =>
          ({ chain }) => {
            return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
          },
    };
  },
});

// 🔴 Custom variable highlighting extension
const VariableHighlight = Extension.create({
  name: 'variableHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('variableHighlight'),
        state: {
          init(_, { doc }) {
            return findVariables(doc);
          },
          apply(tr, oldState) {
            if (tr.docChanged) {
              return findVariables(tr.doc);
            }
            return oldState.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function findVariables(doc) {
  const decorations = [];
  const regex = /\{\{[^{}]+\}\}/g;

  doc.descendants((node, pos) => {
    if (node.isText) {
      let match;
      while ((match = regex.exec(node.text))) {
        decorations.push(
          Decoration.inline(pos + match.index, pos + match.index + match[0].length, {
            class:
              'bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-lg font-mono text-xs font-medium border border-amber-200/60 shadow-sm',
            style:
              'background-color: rgba(254, 243, 199, 0.8); color: #78350f; padding: 2px 6px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; border: 1px solid rgba(253, 230, 138, 0.6); font-size: 0.75rem; font-weight: 500;',
          }),
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

const HtmlEmailEditor = ({ value, onChange, userFields = [], senderName = '' }) => {
  const [showTokens, setShowTokens] = useState(false);
  const [tokenQuery, setTokenQuery] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const tokenRef = useRef(null);
  const containerRef = useRef(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageUploadTab, setImageUploadTab] = useState('url'); // 'url' | 'file'
  const [openDropdown, setOpenDropdown] = useState(null); // 'style' | 'font' | 'size' | 'format' | 'align' | 'lists' | 'insert'

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const editor = useEditor({
    extensions: [
      // ✅ StarterKit includes: Bold, Italic, Strike, Code, CodeBlock, Blockquote, HorizontalRule, HardBreak, Heading, History
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Strike,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing your email… Use {{first_name}} for personalization',
      }),
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
        HTMLAttributes: {
          style: 'max-width: 400px; width: 100%; height: auto; display: inline-block;',
        },
      }),
      BulletList.configure({
        keepMarks: true,
        keepAttributes: true,
        HTMLAttributes: {
          class: 'list-disc ltr:ml-4 ltr:mr-4 rtl:ml-4',
        },
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: true,
        HTMLAttributes: {
          class: 'list-decimal ltr:ml-4 ltr:mr-4 rtl:ml-4',
        },
      }),
      ListItem,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 px-4 py-2 ltr:text-left ltr:text-right rtl:text-left font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      VariableHighlight,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      // Real-time suggestion trigger with filtering support
      const { from } = editor.state.selection;

      // Look back to find the start of a token sequence
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from);
      const lastTokenStart = textBefore.lastIndexOf('{{');

      if (lastTokenStart !== -1) {
        // Get content between {{ and current cursor
        const query = textBefore.substring(lastTokenStart + 2);

        // Ensure there's no closing }} or space in the query (which would mean we're past the token)
        if (!query.includes('}}') && !query.includes(' ')) {
          setShowTokens(true);
          setTokenQuery(query);

          // Calculate position
          if (containerRef.current) {
            const { view } = editor;
            const coords = view.coordsAtPos(from);
            const containerRect = containerRef.current.getBoundingClientRect();

            setDropdownPos({
              top: coords.bottom - containerRect.top + 10, // 10px below the line
              left: coords.left - containerRect.left,
            });
          }
        } else {
          setShowTokens(false);
          setTokenQuery('');
        }
      } else {
        setShowTokens(false);
        setTokenQuery('');
      }

      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'focus:outline-none min-h-[400px] p-6 bg-white text-gray-900 prose prose-slate prose-lg max-w-none overflow-y-auto leading-normal',
        spellcheck: 'false',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  // Handle click outside for tokens
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tokenRef.current && !tokenRef.current.contains(event.target)) {
        setShowTokens(false);
      }
    };
    if (showTokens) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTokens]);

  const insertToken = (tokenObj) => {
    if (!editor) return;

    const { from } = editor.state.selection;
    const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from);
    const lastTokenStart = textBefore.lastIndexOf('{{');

    if (lastTokenStart !== -1) {
      // Calculate absolute position in the document to replace the trigger text
      const startPos = from - (textBefore.length - lastTokenStart);
      editor
        .chain()
        .focus()
        .insertContentAt({ from: startPos, to: from }, tokenObj.token)
        .run();
    } else {
      // Fallback to simple insertion if for some reason trigger wasn't found
      editor.chain().focus().insertContent(tokenObj.token).run();
    }

    setShowTokens(false);
    setTokenQuery('');
  };

  const clearContent = () => {
    editor?.commands.clearContent();
  };

  const setLink = () => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      // No text selected — insert the URL as clickable text
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" class="text-blue-600 underline cursor-pointer">${url}</a>`)
        .run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkUrl('');
    setShowLinkModal(false);
  };

  const addImage = (src) => {
    if (src) {
      editor.chain().focus().setImage({ src }).run();
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addImage(reader.result);
    reader.readAsDataURL(file);
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true })
      .run();
    setShowTableModal(false);
  };

  const renderEmailPreview = (content) => {
    if (!content || content.trim() === '') {
      return `
      <div class="text-sm text-slate-400 italic flex items-center justify-center py-10">
        No content to preview
      </div>
    `;
    }

    let html = content;

    // Highlight tokens
    html = html.replace(
      /\{\{([^}]+)\}\}/g,
      `<span class="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg font-mono text-xs font-bold border border-amber-200/50 leading-none shadow-sm inline-block mx-0.5">$&</span>`,
    );

    // Filter out trailing empty paragraphs that add extra space
    html = html.trim().replace(/(<p>&nbsp;<\/p>|<p><\/p>)+$/, '');

    return html;
  };

  if (!editor) {
    return (
      <div className="min-h-100 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading editor…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white group/editor">
      {/* Toolbar - z-index high so dropdowns render above content */}
      <div className="sticky top-0 z-[100] border-b border-slate-100 bg-white">
        <div className="flex items-center gap-0.5 px-2 py-1.5 min-h-[44px]">

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25 transition-all text-[11px] font-semibold flex-none"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25 transition-all text-[11px] font-semibold flex-none"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
            <span>Redo</span>
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1 flex-none" />

          {/* Style Dropdown */}
          <div className="relative flex-none">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'style' ? null : 'style')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all min-w-[110px] ${openDropdown === 'style' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <span className="flex-1 text-left">
                {editor.isActive('paragraph') ? 'Paragraph' :
                  [1, 2, 3, 4, 5, 6].find(level => editor.isActive('heading', { level }))
                    ? <span className="uppercase">h{[1, 2, 3, 4, 5, 6].find(level => editor.isActive('heading', { level }))}</span>
                    : 'Style'}
              </span>
              <ChevronDown className="w-3 h-3 flex-none" />
            </button>
            {openDropdown === 'style' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl py-1 z-[500] w-32 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().setParagraph().run(); setOpenDropdown(null); }}
                  className={`w-full text-left px-4 py-2 text-[11px] font-bold border-b border-slate-50 transition-colors ${editor.isActive('paragraph') ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  Paragraph
                </button>
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => { editor.chain().focus().toggleHeading({ level }).run(); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 text-[13px] font-black uppercase border-b border-slate-50 last:border-0 transition-colors ${editor.isActive('heading', { level }) ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-900'}`}
                  >
                    h{level}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Dropdown */}
          <div className="relative flex-none">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'font' ? null : 'font')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all min-w-[100px] ${openDropdown === 'font' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <TypeOutline className="w-3.5 h-3.5 flex-none" />
              <span className="flex-1 text-left truncate max-w-[70px]">
                {editor.getAttributes('textStyle').fontFamily?.split(',')[0] || 'Font'}
              </span>
              <ChevronDown className="w-3 h-3 flex-none" />
            </button>
            {openDropdown === 'font' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl py-1 z-[500] w-48 animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {FONTS.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => { editor.chain().focus().setFontFamily(font).run(); setOpenDropdown(null); }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${editor.getAttributes('textStyle').fontFamily === font ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Size Dropdown */}
          <div className="relative flex-none">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'size' ? null : 'size')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all min-w-[60px] ${openDropdown === 'size' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <Hash className="w-3.5 h-3.5 flex-none" />
              <span>{editor.getAttributes('textStyle').fontSize?.replace('px', '') || '16'}</span>
              <ChevronDown className="w-3 h-3 flex-none" />
            </button>
            {openDropdown === 'size' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl py-1 z-[500] w-20 animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => { editor.chain().focus().setFontSize(`${size}px`).run(); setOpenDropdown(null); }}
                      className={`w-full text-center px-2 py-1.5 text-xs transition-colors ${editor.getAttributes('textStyle').fontSize === `${size}px` ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 mx-1 flex-none" />

          {/* Format Dropdown */}
          <div className="relative flex-none">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'format' ? null : 'format')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${openDropdown === 'format' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <Bold className="w-3.5 h-3.5" />
              <span>Format</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === 'format' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl py-1 z-[500] w-44 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().toggleBold().run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive('bold') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <Bold className="w-3.5 h-3.5" /><span>Bold</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().toggleItalic().run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive('italic') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <Italic className="w-3.5 h-3.5" /><span>Italic</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().toggleUnderline().run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive('underline') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <UnderlineIcon className="w-3.5 h-3.5" /><span>Underline</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().toggleStrike().run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive('strike') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <Strikethrough className="w-3.5 h-3.5" /><span>Strikethrough</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().toggleHighlight().run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive('highlight') ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <Highlighter className="w-3.5 h-3.5" /><span>Highlight</span>
                </button>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <label className="flex items-center gap-3 px-3 py-2 cursor-pointer text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Text Color</span>
                    <input
                      type="color"
                      className="ml-auto w-5 h-5 rounded cursor-pointer border-0 p-0 overflow-hidden"
                      value={editor.getAttributes('textStyle').color || '#000000'}
                      onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Align Dropdown */}
          <div className="relative flex-none">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'align' ? null : 'align')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${openDropdown === 'align' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Align</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === 'align' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl py-1 z-[500] w-44 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().setTextAlign('left').run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <AlignLeft className="w-3.5 h-3.5" /><span>Align Left</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().setTextAlign('center').run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <AlignCenter className="w-3.5 h-3.5" /><span>Align Center</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().setTextAlign('right').run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <AlignRight className="w-3.5 h-3.5" /><span>Align Right</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().setTextAlign('justify').run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <AlignJustify className="w-3.5 h-3.5" /><span>Justify</span>
                </button>
              </div>
            )}
          </div>

          {/* Lists Dropdown */}
          <div className="relative flex-none">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'lists' ? null : 'lists')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${openDropdown === 'lists' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lists</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === 'lists' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl py-1 z-[500] w-44 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().toggleBulletList().run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive('bulletList') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <List className="w-3.5 h-3.5" /><span>Bullet List</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().toggleOrderedList().run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive('orderedList') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <ListOrdered className="w-3.5 h-3.5" /><span>Numbered List</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 mx-1 flex-none" />

          {/* Insert Dropdown */}
          <div className="relative flex-none">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'insert' ? null : 'insert')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${openDropdown === 'insert' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Insert</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === 'insert' && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl py-1 z-[500] w-44 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => { setShowLinkModal(true); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive('link') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <LinkIcon className="w-3.5 h-3.5" /><span>Hyperlink</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setImageUploadTab('url'); setShowImageModal(true); setOpenDropdown(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" /><span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowTableModal(true); setOpenDropdown(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <TableIcon className="w-3.5 h-3.5" /><span>Table</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().toggleBlockquote().run(); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${editor.isActive('blockquote') ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <Quote className="w-3.5 h-3.5" /><span>Blockquote</span>
                </button>
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().setHorizontalRule().run(); setOpenDropdown(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" /><span>Divider</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-1" />

          {/* Actions */}
          <div className="flex items-center gap-1 flex-none translate-x-[-4px]">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${previewMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              title={previewMode ? 'Editor' : 'Preview'}
            >
              {previewMode ? <FileText className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </button>

            <button
              type="button"
              onClick={clearContent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
              title="Clear"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative z-0 flex-1 bg-slate-50/30">
        {previewMode ? (
          <div className="p-4 md:p-8 h-full overflow-y-auto animate-in fade-in duration-500 custom-scrollbar">
            <div className="max-w-4xl mx-auto premium-card bg-white min-h-125 overflow-hidden flex flex-col rounded-3xl border border-slate-100 shadow-2xl">
              <div className="bg-slate-50/50 backdrop-blur-md border-b border-slate-100 flex-none px-6 py-3.5 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-slate-200 shadow-inner"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-200 shadow-inner"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-200 shadow-inner"></div>
                </div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-xs">
                  Email Content Canvas
                </div>
              </div>
              <div
                className="flex-1 p-8 md:p-10 lg:p-12 max-w-none text-slate-800 mail-content-html leading-normal"
                dangerouslySetInnerHTML={{
                  __html: (value || '').replace(
                    /\{\{\s*sender_name\s*\}\}/g,
                    senderName || '[Sender Name]'
                  )
                }}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              <EditorContent editor={editor} />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white/80 backdrop-blur-md text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>{' '}
                  {editor.getText().length} Characters
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>{' '}
                  {editor.getText().split(/\s+/).filter(Boolean).length} Words
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>{' '}
                  {((value || '').match(/\{\{([^}]+)\}\}/g) || []).length} Variables
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-blue-500/60 lowercase italic font-medium tracking-normal text-xs">
                use internal tokens via {'{{'} trigger
              </div>
            </div>
          </div>
        )}

        {/* Modals & Overlays */}
        {showLinkModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 w-full max-w-sm animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                  {' '}
                  <LinkIcon className="w-5 h-5 text-blue-600" />{' '}
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                  Insert Link
                </h3>
              </div>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://hyperlink.io"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={setLink}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Inject
                </button>
              </div>
            </div>
          </div>
        )}

        {showImageModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 w-full max-w-sm animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Insert Image</h3>
              </div>
              {/* Tabs */}
              <div className="flex gap-2 mb-5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageUploadTab('url')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${imageUploadTab === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadTab('file')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${imageUploadTab === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Upload
                </button>
              </div>
              {imageUploadTab === 'url' ? (
                <>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowImageModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
                    <button onClick={() => addImage(imageUrl)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Insert</button>
                  </div>
                </>
              ) : (
                <>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer bg-blue-50/30 hover:bg-blue-50 transition-all mb-6">
                    <ImageIcon className="w-8 h-8 text-blue-400 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Click to choose file</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFileUpload} />
                  </label>
                  <button onClick={() => setShowImageModal(false)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
                </>
              )}
            </div>
          </div>
        )}

        {showTableModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 w-full max-w-sm animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  {' '}
                  <TableIcon className="w-5 h-5 text-indigo-600" />{' '}
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                  Insert Table
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Rows
                  </label>
                  <input
                    type="number"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Cols
                  </label>
                  <input
                    type="number"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTableModal(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={insertTable}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  Build
                </button>
              </div>
            </div>
          </div>
        )}

        {showTokens && (
          <div
            ref={tokenRef}
            className="absolute z-[600] animate-in slide-in-from-top-1 duration-300 w-48 shadow-2xl"
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              // Ensure it doesn't go off screen horizontally
              maxWidth: 'calc(100vw - 40px)'
            }}
          >
            <PersonalizationTokens
              onInsertToken={insertToken}
              userFields={userFields}
              onClose={() => setShowTokens(false)}
              externalQuery={tokenQuery}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HtmlEmailEditor;
