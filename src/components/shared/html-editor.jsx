/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
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

const HtmlEmailEditor = ({ value, onChange, userFields = [] }) => {
  const [showTokens, setShowTokens] = useState(false);
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
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
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

  const insertToken = (token) => {
    if (!editor) return;
    editor.chain().focus().insertContent(token).run();
    setShowTokens(false);
  };

  const clearContent = () => {
    editor?.commands.clearContent();
    setPreviewContent("");
  };

  const copyHTML = () => {
    navigator.clipboard.writeText(editor?.getHTML() || "");
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

    // ✅ FIXED: Better paragraph handling
    html = html.replace(/<p><\/p>/g, "<br>");
    html = html.replace(/<p>/g, '<div style="margin-bottom: 16px;">');
    html = html.replace(/<\/p>/g, "</div>");

    // Add spacing around lists
    html = html.replace(
      /(<ul[^>]*>)/g,
      `<div style="margin-top:16px;"></div>$1`,
    );
    html = html.replace(
      /(<\/ul>)/g,
      `$1<div style="margin-bottom:16px;"></div>`,
    );
    html = html.replace(
      /(<ol[^>]*>)/g,
      `<div style="margin-top:16px;"></div>$1`,
    );
    html = html.replace(
      /(<\/ol>)/g,
      `$1<div style="margin-bottom:16px;"></div>`,
    );

    // Fix list items
    html = html.replace(/<li>/g, '<li style="margin-bottom: 8px;">');

    return `
    <div style="background:#f9fafb; font-family:Arial, Helvetica, sans-serif; padding:20px;">
      <div style="
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border rounded-lg bg-gray-50 sticky top-0 z-10 shadow-sm">
        {/* Undo/Redo - Now working! */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Family */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontPicker(!showFontPicker)}
            title="Font Family"
            className="p-2 rounded-md hover:bg-gray-200 text-gray-700 flex items-center gap-1"
          >
            <TypeOutline className="w-4 h-4" />
            <span className="text-xs hidden md:inline">Font</span>
          </button>
          {showFontPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-2 z-50 w-48 max-h-60 overflow-y-auto">
              {FONTS.map((font) => (
                <button
                  key={font}
                  onClick={() => {
                    editor.chain().focus().setFontFamily(font).run();
                    setShowFontPicker(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded"
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontSizePicker(!showFontSizePicker)}
            title="Font Size"
            className="p-2 rounded-md hover:bg-gray-200 text-gray-700 flex items-center gap-1"
          >
            <Hash className="w-4 h-4" />
            <span className="text-xs hidden md:inline">Size</span>
          </button>
          {showFontSizePicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-2 z-50 w-24 max-h-60 overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    editor.chain().focus().setFontSize(`${size}px`).run();
                    setShowFontSizePicker(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded"
                >
                  {size}px
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
            className="p-2 rounded-md hover:bg-gray-200 text-gray-700 flex items-center gap-1"
          >
            <Palette className="w-4 h-4" />
            <span className="text-xs hidden md:inline">Color</span>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-3 z-50 w-64">
              <div className="grid grid-cols-10 gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-md ${
            editor.isActive("bold")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-md ${
            editor.isActive("italic")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-md ${
            editor.isActive("underline")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-md ${
            editor.isActive("strike")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded-md ${
            editor.isActive("highlight")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded-md ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded-md ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 rounded-md ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-2 rounded-md ${
            editor.isActive("paragraph")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Paragraph"
        >
          <Pilcrow className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded-md ${
            editor.isActive({ textAlign: "left" })
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded-md ${
            editor.isActive({ textAlign: "center" })
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded-md ${
            editor.isActive({ textAlign: "right" })
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-2 rounded-md ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-md ${
            editor.isActive("bulletList")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-md ${
            editor.isActive("orderedList")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Insert Elements */}
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className={`p-2 rounded-md ${
            editor.isActive("link")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded-md ${
            editor.isActive("code")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Inline Code"
        >
          <CodeIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-md ${
            editor.isActive("codeBlock")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-md ${
            editor.isActive("blockquote")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowTableModal(true)}
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
          title="Line Break"
        >
          <CornerDownRight className="w-4 h-4" />
        </button>

        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setShowTokens(!showTokens)}
            className={`p-2 rounded-md ${
              showTokens
                ? "bg-purple-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
            title="Personalization Tokens"
          >
            <Tag className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`p-2 rounded-md ${
              previewMode
                ? "bg-green-600 text-white"
                : "hover:bg-gray-200 text-gray-700"
            }`}
            title="Toggle Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={copyHTML}
            className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
            title="Copy HTML"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={clearContent}
            className="p-2 rounded-md hover:bg-red-50 text-red-600"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
            title="Clear Formatting"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={setLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Table</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={insertTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {showTokens && (
        <PersonalizationTokens
          onInsertToken={insertToken}
          userFields={userFields}
        />
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {previewMode ? (
          <div className="p-6 max-h-150 overflow-y-auto">
            <div
              dangerouslySetInnerHTML={{
                __html: renderEmailPreview(previewContent),
              }}
            />
          </div>
        ) : (
          <>
            <EditorContent editor={editor} />
            <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50 text-sm text-gray-600">
              <div>
                Characters: {editor.getText().length}
                <span className="mx-2">•</span>
                Words: {editor.getText().split(/\s+/).filter(Boolean).length}
                <span className="mx-2">•</span>
                Tokens:{" "}
                {(previewContent.match(/\{\{([^}]+)\}\}/g) || []).length}
              </div>
              <div className="text-xs text-gray-500">
                Use{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">
                  {"{{token}}"}
                </code>{" "}
                for personalization
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HtmlEmailEditor;
