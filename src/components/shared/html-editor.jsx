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
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import HardBreak from '@tiptap/extension-hard-break';

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
              'bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-lg font-mono text-xs font-bold border border-amber-200/60 shadow-sm',
            style:
              'background-color: rgba(254, 243, 199, 0.8); color: #78350f; padding: 2px 6px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; border: 1px solid rgba(253, 230, 138, 0.6); font-size: 0.75rem; font-weight: 700;',
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
      // ✅ StarterKit with History ENABLED (don't disable it)
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        hardBreak: false,
        // ❌ REMOVED: history: false - this was the problem!
      }),
      Underline,
      Strike,
      Code,
      CodeBlock.configure({
        language: 'html',
      }),
      Blockquote,
      HorizontalRule,
      HardBreak,
      // ❌ REMOVED: History import completely - StarterKit provides it
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
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkModal(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageModal(false);
    }
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
    <div className="flex flex-col h-full overflow-hidden bg-white group/editor">
      {/* Single-Line Professional Toolbar - No Overflow Clip for Dropdowns */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20 backdrop-blur-3xl min-h-[50px]">
        {/* Navigation */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/40 shadow-xs flex-none">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1 rounded-md hover:bg-slate-50 text-slate-500 disabled:opacity-20 transition-all"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1 rounded-md hover:bg-slate-50 text-slate-500 disabled:opacity-20 transition-all"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200/60 flex-none mx-0.5" />

        {/* Typography */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/40 shadow-xs flex-none">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFontPicker(!showFontPicker);
                setShowFontSizePicker(false);
              }}
              className={`px-2 py-1 rounded-md flex items-center gap-1.5 transition-all ${showFontPicker ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <TypeOutline className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold truncate max-w-[60px] hidden lg:inline">
                {editor.getAttributes('textStyle').fontFamily?.split(',')[0] || 'Font'}
              </span>
            </button>
            {showFontPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl p-1 z-[100] w-48 border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                  {FONTS.map((font) => (
                    <button
                      key={font}
                      onClick={() => { editor.chain().focus().setFontFamily(font).run(); setShowFontPicker(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors ${editor.isActive('textStyle', { fontFamily: font }) ? 'bg-blue-50 text-blue-600 font-bold' : ''}`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFontSizePicker(!showFontSizePicker);
                setShowFontPicker(false);
              }}
              className={`px-2 py-1 rounded-md flex items-center gap-1.5 transition-all ${showFontSizePicker ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold hidden lg:inline">
                {editor.getAttributes('textStyle').fontSize?.replace('px', '') || '16'}
              </span>
            </button>
            {showFontSizePicker && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl p-1 z-[100] w-20 border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => { editor.chain().focus().setFontSize(`${size}px`).run(); setShowFontSizePicker(false); }}
                      className={`w-full text-center px-2 py-1.5 text-[11px] font-bold hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors ${editor.getAttributes('textStyle').fontSize === `${size}px` ? 'bg-indigo-50 text-indigo-600' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-5 bg-slate-200/60 flex-none mx-0.5" />

        {/* Basic Formatting */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/40 shadow-xs flex-none">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('bold') ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('italic') ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('underline') ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('highlight') ? 'bg-amber-400 text-amber-950 shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200/60 flex-none mx-0.5" />

        {/* Lists & Alignment */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/40 shadow-xs flex-none">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('bulletList') ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive('orderedList') ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-slate-100 mx-0.5" />
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded-md transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 min-w-1" />

        {/* Actions */}
        <div className="flex items-center gap-1 flex-none">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`p-1.5 rounded-xl transition-all ${previewMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50'}`}
            title={previewMode ? "Editor" : "Preview"}
          >
            {previewMode ? <FileText className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={clearContent}
            className="p-1.5 rounded-lg bg-white border border-slate-200/60 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative flex-1 bg-slate-50/30">
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
                className="flex-1 p-8 md:p-10 lg:p-12 prose prose-slate prose-lg max-w-none text-slate-800 mail-content-html leading-normal"
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
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  {' '}
                  <ImageIcon className="w-5 h-5 text-emerald-600" />{' '}
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                  Insert Image
                </h3>
              </div>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://asset-source.com/img.jpg"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={addImage}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Sync
                </button>
              </div>
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
            className="absolute z-50 animate-in slide-in-from-top-1 duration-300 w-48 shadow-2xl"
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
