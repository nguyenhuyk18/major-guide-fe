import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import '../assets/css/RichTextEditor.css';

const MenuButton = ({ onClick, isActive, isDisabled, title, children, className = '' }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        title={title}
        className={`rte-menu-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''} ${className}`}
    >
        {children}
    </button>
);

const MenuDivider = () => <div className="rte-menu-divider" />;

export default function RichTextEditor({ value, onChange, placeholder = 'Bắt đầu viết bài viết của bạn...', error }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: {},
                orderedList: {},
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            TextStyle,
            Color,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
            }),
            Placeholder.configure({ placeholder }),
            Image.configure({ inline: false, allowBase64: true }),
            Highlight.configure({ multicolor: true }),
            Subscript,
            Superscript,
            TaskList,
            TaskItem.configure({ nested: true }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'rte-content',
            },
        },
    });

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Nhập URL:', previousUrl || 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt('Nhập URL hình ảnh:', 'https://');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    if (!editor) return null;

    return (
        <div className={`rte-wrapper ${error ? 'has-error' : ''}`}>
            {/* Toolbar */}
            <div className="rte-toolbar">
                {/* Undo/Redo */}
                <div className="rte-toolbar-group">
                    <MenuButton
                        onClick={() => editor.chain().focus().undo().run()}
                        isDisabled={!editor.can().undo()}
                        title="Hoàn tác (Ctrl+Z)"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().redo().run()}
                        isDisabled={!editor.can().redo()}
                        title="Làm lại (Ctrl+Y)"
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                    </MenuButton>
                </div>

                <MenuDivider />

                {/* Headings */}
                <div className="rte-toolbar-group">
                    <select
                        className="rte-select-heading"
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'p') {
                                editor.chain().focus().setParagraph().run();
                            } else {
                                editor.chain().focus().toggleHeading({ level: parseInt(val) }).run();
                            }
                        }}
                        value={
                            editor.isActive('heading', { level: 1 }) ? '1' :
                            editor.isActive('heading', { level: 2 }) ? '2' :
                            editor.isActive('heading', { level: 3 }) ? '3' : 'p'
                        }
                        title="Định dạng đoạn văn"
                    >
                        <option value="p">Văn bản</option>
                        <option value="1">Tiêu đề 1</option>
                        <option value="2">Tiêu đề 2</option>
                        <option value="3">Tiêu đề 3</option>
                    </select>
                </div>

                <MenuDivider />

                {/* Text Formatting */}
                <div className="rte-toolbar-group">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="In đậm (Ctrl+B)"
                    >
                        <i className="bi bi-type-bold"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="In nghiêng (Ctrl+I)"
                    >
                        <i className="bi bi-type-italic"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Gạch chân (Ctrl+U)"
                    >
                        <i className="bi bi-type-underline"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Gạch ngang"
                    >
                        <i className="bi bi-type-strikethrough"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        isActive={editor.isActive('highlight')}
                        title="Tô đậm nền"
                    >
                        <i className="bi bi-highlighter"></i>
                    </MenuButton>
                </div>

                <MenuDivider />

                {/* Color */}
                <div className="rte-toolbar-group">
                    <div className="rte-color-picker-wrapper">
                        <button
                            type="button"
                            className="rte-menu-btn"
                            title="Màu chữ"
                            onClick={() => {
                                const color = window.prompt('Nhập mã màu (VD: #ff0000 hoặc red):', '#000000');
                                if (color !== null) {
                                    editor.chain().focus().setColor(color).run();
                                }
                            }}
                        >
                            <i className="bi bi-palette"></i>
                        </button>
                    </div>
                </div>

                <MenuDivider />

                {/* Lists */}
                <div className="rte-toolbar-group">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Danh sách không thứ tự"
                    >
                        <i className="bi bi-list-ul"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Danh sách có thứ tự"
                    >
                        <i className="bi bi-list-ol"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        isActive={editor.isActive('taskList')}
                        title="Danh sách công việc"
                    >
                        <i className="bi bi-check2-square"></i>
                    </MenuButton>
                </div>

                <MenuDivider />

                {/* Alignment */}
                <div className="rte-toolbar-group">
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        title="Canh trái"
                    >
                        <i className="bi bi-text-left"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        title="Canh giữa"
                    >
                        <i className="bi bi-text-center"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        title="Canh phải"
                    >
                        <i className="bi bi-text-right"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        title="Canh đều"
                    >
                        <i className="bi bi-justify-left"></i>
                    </MenuButton>
                </div>

                <MenuDivider />

                {/* Subscript/Superscript */}
                <div className="rte-toolbar-group">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleSubscript().run()}
                        isActive={editor.isActive('subscript')}
                        title="Chỉ số dưới (VD: H₂O)"
                    >
                        <i className="bi bi-subscript"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        isActive={editor.isActive('superscript')}
                        title="Chỉ số trên (VD: m²)"
                    >
                        <i className="bi bi-superscript"></i>
                    </MenuButton>
                </div>

                <MenuDivider />

                {/* Blockquote & Code */}
                <div className="rte-toolbar-group">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Trích dẫn"
                    >
                        <i className="bi bi-quote"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        title="Khối mã"
                    >
                        <i className="bi bi-code-slash"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Đường kẻ ngang"
                    >
                        <i className="bi bi-hr"></i>
                    </MenuButton>
                </div>

                <MenuDivider />

                {/* Link & Image */}
                <div className="rte-toolbar-group">
                    <MenuButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        title="Chèn liên kết"
                    >
                        <i className="bi bi-link-45deg"></i>
                    </MenuButton>
                    <MenuButton
                        onClick={addImage}
                        title="Chèn hình ảnh"
                    >
                        <i className="bi bi-image"></i>
                    </MenuButton>
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} className="rte-editor-content" />

            {/* Error message */}
            {error && <span className="rte-error-text">{error}</span>}
        </div>
    );
}
