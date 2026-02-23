/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import HardBreak from "@tiptap/extension-hard-break";

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Quote,
  Code as CodeIcon,
  Code2,
  Eye,
  Copy,
  Trash2,
  Tag,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Table as TableIcon,
  Pilcrow,
  Strikethrough,
  Undo,
  Redo,
  Eraser,
  Highlighter,
  Palette,
  TypeOutline,
  CornerDownRight,
  Hash,
  FileText,
} from "lucide-react";
import PersonalizationTokens from "./personalization-tokens";

const FONTS = [
  "Arial",
  "Helvetica",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Courier New",
  "Brush Script MT",
];

const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
];

const COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
  "#dd7e6b",
  "#ea9999",
  "#f9cb9c",
  "#ffe599",
  "#b6d7a8",
  "#a2c4c9",
  "#9fc5e8",
  "#9fc5e8",
  "#b4a7d6",
  "#d5a6bd",
  "#cc4125",
  "#e06666",
  "#f6b26b",
  "#ffd966",
  "#93c47d",
  "#76a5af",
  "#6d9eeb",
  "#6d9eeb",
  "#8e7cc3",
  "#c27ba0",
  "#a61c00",
  "#cc0000",
  "#e69138",
  "#f1c232",
  "#6aa84f",
  "#45818e",
  "#3c78d8",
  "#3c78d8",
  "#674ea7",
  "#a64d79",
  "#85200c",
  "#990000",
  "#b45f06",
  "#bf9000",
  "#38761d",
  "#134f5c",
  "#1155cc",
  "#1155cc",
  "#351c75",
  "#741b47",
  "#5b0f00",
  "#660000",
  "#783f04",
  "#7f6000",
  "#274e13",
  "#0c343d",
  "#1c4587",
  "#1c4587",
  "#20124d",
  "#4c1130",
];

// 🔴 Custom font size extension
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize.replace(/['"]/g, ""),
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
            return chain().setMark("textStyle", { fontSize }).run();
          },
      unsetFontSize:
        () =>
          ({ chain }) => {
            return chain()
              .setMark("textStyle", { fontSize: null })
              .removeEmptyTextStyle()
              .run();
          },
    };
  },
});

// 🔴 Custom variable highlighting extension
const VariableHighlight = Extension.create({
  name: "variableHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("variableHighlight"),
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
          Decoration.inline(
            pos + match.index,
            pos + match.index + match[0].length,
            {
              class:
                "bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded font-mono border border-yellow-200",
              style:
                "background-color: #fef3c7; color: #92400e; padding: 2px 4px; border-radius: 4px; font-family: monospace; border: 1px solid #fde68a;",
            },
          ),
        );
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

const HtmlEmailEditor = ({ value, onChange, userFields = [] }) => {
  const [showTokens, setShowTokens] = useState(false);
  const tokenRef = useRef(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewContent, setPreviewContent] = useState(value || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
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
        language: "html",
      }),
      Blockquote,
      HorizontalRule,
      HardBreak,
      // ❌ REMOVED: History import completely - StarterKit provides it
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Placeholder.configure({
        placeholder:
          "Start writing your email… Use {{first_name}} for personalization",
      }),
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
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
          class: "list-disc ml-4",
        },
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: true,
        HTMLAttributes: {
          class: "list-decimal ml-4",
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
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-4 py-2",
        },
      }),
      VariableHighlight,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      // Real-time suggestion trigger
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 2),
        from,
      );
      if (textBefore === "{{") {
        setShowTokens(true);
      }

      onChange(html);
      setPreviewContent(html);
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[400px] p-6 bg-white text-gray-900 prose prose-lg max-w-none overflow-y-auto",
        spellcheck: "false",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
      setPreviewContent(value || "");
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
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTokens]);

  const insertToken = (token) => {
    if (!editor) return;
    editor.chain().focus().insertContent(token).run();
    setShowTokens(false);
  };

  const clearContent = () => {
    editor?.commands.clearContent();
    setPreviewContent("");
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkModal(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
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
    if (!content || content.trim() === "") {
      return `
      <div style="padding:40px; color:#9ca3af; font-style:italic; text-align:center;">
        No content to preview
      </div>
    `;
    }

    let html = content;

    // Highlight tokens
    html = html.replace(
      /\{\{([^}]+)\}\}/g,
      `<span style="
      background:#FEF3C7;
      color:#92400E;
      padding:2px 4px;
      border-radius:4px;
      font-family:monospace;
      font-size:0.9em;
    ">$&</span>`,
    );

    // Filter out trailing empty paragraphs that add extra space
    html = html.trim().replace(/(<p>&nbsp;<\/p>|<p><\/p>)+$/, "");

    return `
    <div style="background:#f9fafb; font-family:Arial, Helvetica, sans-serif; padding:20px;">
      <style>
        .preview-body p { margin-top: 0; margin-bottom: 16px; }
        .preview-body p:last-child { margin-bottom: 0; }
        .preview-body ul, .preview-body ol { margin-top: 16px; margin-bottom: 16px; }
        .preview-body li { margin-bottom: 8px; }
      </style>
      <div class="preview-body" style="
        max-width:600px;
        margin:0 auto;
        padding:32px;
        background:#ffffff;
        color:#111827;
        font-size:16px;
        line-height:1.6;
        border-radius:8px;
        box-shadow:0 2px 8px rgba(0,0,0,0.05);
      ">
        ${html}
      </div>
    </div>
  `;
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
    <div className="flex flex-col rounded-3xl border border-slate-200/60 overflow-hidden shadow-2xl bg-white group/editor">
      {/* Premium Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-3xl">
        {/* Navigation Group */}
        <div className="flex items-center gap-1 bg-white/80 p-1.5 rounded-2xl border border-slate-200/40 shadow-xs">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Typography & Design Group */}
        <div className="flex items-center gap-1 bg-white/80 p-1.5 rounded-2xl border border-slate-200/40 shadow-xs">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontPicker(!showFontPicker)}
              className={`p-2.5 rounded-xl flex items-center gap-2.5 transition-all active:scale-95 ${showFontPicker ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "hover:bg-slate-100 text-slate-600"}`}
              title="Font Family"
            >
              <TypeOutline className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">
                Font
              </span>
            </button>
            {showFontPicker && (
              <div className="absolute top-full left-0 mt-3 bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-4xl shadow-2xl p-3 z-50 w-64 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 py-3 border-b border-slate-50 mb-2">
                  {" "}
                  protocols{" "}
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {FONTS.map((font) => (
                    <button
                      key={font}
                      onClick={() => {
                        editor.chain().focus().setFontFamily(font).run();
                        setShowFontPicker(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
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
              onClick={() => setShowFontSizePicker(!showFontSizePicker)}
              className={`p-2.5 rounded-xl flex items-center gap-2.5 transition-all active:scale-95 ${showFontSizePicker ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "hover:bg-slate-100 text-slate-600"}`}
              title="Font Size"
            >
              <Hash className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">
                Size
              </span>
            </button>
            {showFontSizePicker && (
              <div className="absolute top-full left-0 mt-3 bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-4xl shadow-2xl p-3 z-50 w-32 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 py-3 border-b border-slate-50 mb-2">
                  {" "}
                  unit{" "}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        editor.chain().focus().setFontSize(`${size}px`).run();
                        setShowFontSizePicker(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-black hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-2xl"
                    >
                      {size}PX
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`p-2.5 rounded-xl flex items-center gap-2.5 transition-all active:scale-95 ${showColorPicker ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "hover:bg-slate-100 text-slate-600"}`}
              title="Text Color"
            >
              <Palette className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">
                Color
              </span>
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-3 bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-4xl shadow-2xl p-4 z-50 w-72 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded-full border border-slate-100 hover:scale-125 transition-all"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Format Group */}
        <div className="flex items-center gap-1 bg-white/80 p-1.5 rounded-2xl border border-slate-200/40 shadow-xs">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2.5 rounded-xl transition-all ${editor.isActive("bold") ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2.5 rounded-xl transition-all ${editor.isActive("italic") ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2.5 rounded-xl transition-all ${editor.isActive("underline") ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2.5 rounded-xl transition-all ${editor.isActive("highlight") ? "bg-amber-400 text-amber-950" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Integration Group */}
        <div className="flex items-center gap-1 bg-white/80 p-1.5 rounded-2xl border border-slate-200/40 shadow-xs">
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className={`p-2.5 rounded-xl transition-all ${editor.isActive("link") ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "hover:bg-slate-100 text-slate-500"}`}
            title="Link Integration"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-500 transition-all"
            title="Image Asset"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-500 transition-all"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowTokens(!showTokens)}
            className={`p-2.5 rounded-xl transition-all ${showTokens ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "hover:bg-slate-100 text-slate-500"}`}
            title="Insert Variables"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${previewMode ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {previewMode ? (
              <FileText className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span>{previewMode ? "Editor" : "Preview"}</span>
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={clearContent}
              className="p-2.5 text-slate-400 hover:text-rose-600 transition-colors"
              title="Clear Content"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-slate-50/30">
        {previewMode ? (
          <div className="p-8 h-full overflow-y-auto animate-in fade-in duration-500">
            <div
              className="max-w-3xl mx-auto"
              dangerouslySetInnerHTML={{
                __html: renderEmailPreview(previewContent),
              }}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              <EditorContent editor={editor} />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white/80 backdrop-blur-md text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] select-none">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>{" "}
                  {editor.getText().length} Characters
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>{" "}
                  {editor.getText().split(/\s+/).filter(Boolean).length} Words
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>{" "}
                  {
                    (previewContent.match(/\{\{([^}]+)\}\}/g) || []).length
                  }{" "}
                  Variables
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-blue-500/60 lowercase italic font-medium tracking-normal text-xs">
                use internal tokens via {"{{"} trigger
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
                  {" "}
                  <LinkIcon className="w-5 h-5 text-blue-600" />{" "}
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
                  {" "}
                  <ImageIcon className="w-5 h-5 text-emerald-600" />{" "}
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
                  {" "}
                  <TableIcon className="w-5 h-5 text-indigo-600" />{" "}
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
                    onChange={(e) =>
                      setTableRows(parseInt(e.target.value) || 1)
                    }
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
                    onChange={(e) =>
                      setTableCols(parseInt(e.target.value) || 1)
                    }
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
            className="absolute bottom-16 right-6 z-50 animate-in slide-in-from-bottom-6 duration-300 w-full max-w-sm md:max-w-md lg:max-w-xl"
          >
            <PersonalizationTokens
              onInsertToken={insertToken}
              userFields={userFields}
              onClose={() => setShowTokens(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HtmlEmailEditor;
