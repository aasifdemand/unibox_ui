import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import PersonalizationTokens from './personalization-tokens';

// Real-time variable highlighting
const findVariables = (doc) => {
    const decorations = [];
    const regex = /\{\{[^{}]+\}\}/g;

    doc.descendants((node, pos) => {
        if (node.isText) {
            let match;
            while ((match = regex.exec(node.text))) {
                decorations.push(
                    Decoration.inline(pos + match.index, pos + match.index + match[0].length, {
                        class: 'bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-lg font-mono text-xs font-medium border border-amber-200/60 shadow-sm',
                        style: 'background-color: rgba(254, 243, 199, 0.8); color: #78350f; padding: 2px 6px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; border: 1px solid rgba(253, 230, 138, 0.6); font-size: 0.75rem; font-weight: 500;',
                    }),
                );
            }
        }
    });

    return DecorationSet.create(doc, decorations);
};

const VariableHighlight = Extension.create({
    name: 'variableHighlight',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('variableHighlight'),
                state: {
                    init(_, { doc }) { return findVariables(doc); },
                    apply(tr, oldState) {
                        if (tr.docChanged) return findVariables(tr.doc);
                        return oldState.map(tr.mapping, tr.doc);
                    },
                },
                props: {
                    decorations(state) { return this.getState(state); },
                },
            }),
        ];
    },
});

const SingleLine = Extension.create({
    name: 'singleLine',
    addKeyboardShortcuts() {
        return {
            Enter: () => true,
            'Shift-Enter': () => true,
        };
    },
});

const HighlightedInput = React.forwardRef(({ value, onChange, placeholder, userFields = [] }, ref) => {
    const [showTokens, setShowTokens] = useState(false);
    const [tokenQuery, setTokenQuery] = useState('');
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const containerRef = useRef(null);
    const tokenRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                blockquote: false,
                codeBlock: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
                horizontalRule: false,
                history: true,
            }),
            SingleLine,
            VariableHighlight,
            Placeholder.configure({
                placeholder: placeholder || 'Type something...',
            }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            onChange(text);

            const { from } = editor.state.selection;
            const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from);
            const lastTokenStart = textBefore.lastIndexOf('{{');

            if (lastTokenStart !== -1) {
                const query = textBefore.substring(lastTokenStart + 2);
                if (!query.includes('}}') && !query.includes(' ')) {
                    setShowTokens(true);
                    setTokenQuery(query);

                    if (containerRef.current) {
                        const { view } = editor;
                        const coords = view.coordsAtPos(from);
                        const containerRect = containerRef.current.getBoundingClientRect();
                        setDropdownPos({
                            top: coords.bottom - containerRect.top + 8,
                            left: coords.left - containerRect.left,
                        });
                    }
                } else {
                    setShowTokens(false);
                }
            } else {
                setShowTokens(false);
            }
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-500 transition-all min-h-[58px] flex items-center',
            },
        },
        immediatelyRender: false,
    });

    useImperativeHandle(ref, () => ({
        editor
    }));

    useEffect(() => {
        if (editor && value !== editor.getText() && !editor.isFocused) {
            editor.commands.setContent(value || '', false);
        }
    }, [value, editor]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tokenRef.current && !tokenRef.current.contains(event.target)) {
                setShowTokens(false);
            }
        };
        if (showTokens) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTokens]);

    const insertToken = (tokenObj) => {
        if (!editor) return;
        const { from } = editor.state.selection;
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from);
        const lastTokenStart = textBefore.lastIndexOf('{{');

        if (lastTokenStart !== -1) {
            const startPos = from - (textBefore.length - lastTokenStart);
            editor.chain().focus().insertContentAt({ from: startPos, to: from }, tokenObj.token).run();
        } else {
            editor.chain().focus().insertContent(tokenObj.token).run();
        }
        setShowTokens(false);
        setTokenQuery('');
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <EditorContent editor={editor} />
            {showTokens && (
                <div
                    ref={tokenRef}
                    className="absolute z-[600] animate-in slide-in-from-top-1 duration-300 w-48 shadow-2xl"
                    style={{
                        top: `${dropdownPos.top}px`,
                        left: `${dropdownPos.left}px`,
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
    );
});

export default HighlightedInput;
