"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImagePlus,
} from "lucide-react";
import {
  publishBlogPost,
  saveBlogPost,
  unpublishBlogPost,
  archiveBlogPost,
  uploadBlogImage,
  type BlogActionResult,
} from "@/lib/actions/blog";
import { slugify } from "@/lib/blog/slugify";
import type { AdminPost, PostCover } from "@/lib/content/types";

type SaveState = "idle" | "saving" | "saved" | "error";

const inputClass =
  "mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-ink outline-none focus-visible:border-primary";
const labelClass = "block font-body text-sm font-semibold text-ink";
const primaryBtn =
  "inline-flex min-h-11 items-center justify-center rounded-pill bg-primary px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60";
const ghostBtn =
  "inline-flex min-h-11 items-center justify-center rounded-pill px-4 py-2 font-body text-sm font-semibold text-charcoal-700 shadow-[inset_0_0_0_2px_var(--rise-line)] transition-colors hover:bg-surface-sunk disabled:cursor-not-allowed disabled:opacity-60";

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex size-9 items-center justify-center rounded-md transition-colors ${
        active ? "bg-evergreen-50 text-evergreen-700" : "text-muted hover:bg-surface-sunk"
      }`}
    >
      {children}
    </button>
  );
}

export function BlogEditor({ post }: { post: AdminPost | null }) {
  const router = useRouter();
  const [id, setId] = useState(post?.id ?? null);
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [author, setAuthor] = useState(post?.author ?? "RISE Initiative");
  const [cover, setCover] = useState<PostCover | null>(post?.cover ?? null);
  const [status, setStatus] = useState(post?.status ?? "draft");
  // Tracks whether the post has ever been published, in state so an in-session
  // publish locks the slug immediately (the prop alone would be stale).
  const [firstPublished, setFirstPublished] = useState(
    Boolean(post?.firstPublishedAt),
  );
  // The URL slug is always derived from the title — never an input the author
  // fills. It tracks the title until first publish, then stays fixed (locked)
  // so links that have been shared never break.
  const slugLocked = firstPublished;
  const derivedSlug = slugLocked ? (post?.slug ?? "") : slugify(title);
  const publishedDate = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadingCover, setUploadingCover] = useState(false);
  const dirtyRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer nofollow" },
      }),
      Image.configure({ inline: false }),
    ],
    content: post?.bodyHtml ?? "",
    editorProps: {
      attributes: {
        class:
          "post-body min-h-72 max-w-none rounded-b-lg border border-t-0 border-line bg-surface px-4 py-4 font-body text-ink outline-none",
      },
    },
    onUpdate: () => {
      dirtyRef.current = true;
    },
  });

  function handleTitleChange(value: string) {
    setTitle(value);
    dirtyRef.current = true;
  }

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const buildFormData = useCallback((): FormData => {
    const fd = new FormData();
    if (id) fd.set("id", id);
    fd.set("title", title);
    fd.set("slug", derivedSlug);
    fd.set("excerpt", excerpt);
    fd.set("author", author);
    fd.set("bodyHtml", editor?.getHTML() ?? "");
    if (cover) {
      fd.set("coverSrc", cover.src);
      fd.set("coverAlt", cover.alt);
      fd.set("coverWidth", String(cover.width));
      fd.set("coverHeight", String(cover.height));
    }
    return fd;
  }, [id, title, derivedSlug, excerpt, author, cover, editor]);

  const applyResult = useCallback(
    (result: BlogActionResult, publishedNow?: boolean) => {
      if (result.ok) {
        setError(null);
        setFieldError(null);
        setSaveState("saved");
        dirtyRef.current = false;
        if (publishedNow) {
          setStatus("published");
          setFirstPublished(true);
        }
        if (!id) {
          setId(result.id);
          // Move to the post's own URL so subsequent saves update in place.
          router.replace(`/admin/blog/${result.id}`);
        }
        router.refresh();
      } else {
        setSaveState("error");
        setError(result.error);
        setFieldError(result.field ?? null);
      }
    },
    [id, router],
  );

  const runSave = useCallback(() => {
    if (!title.trim()) {
      setSaveState("error");
      setFieldError("title");
      setError("A title is required.");
      return;
    }
    setSaveState("saving");
    startTransition(async () => {
      const result = await saveBlogPost(null, buildFormData());
      applyResult(result);
    });
  }, [title, buildFormData, applyResult]);

  const runPublish = useCallback(() => {
    setSaveState("saving");
    startTransition(async () => {
      const result = await publishBlogPost(null, buildFormData());
      applyResult(result, true);
    });
  }, [buildFormData, applyResult]);

  const runStatusAction = useCallback(
    (
      action: typeof unpublishBlogPost | typeof archiveBlogPost,
      nextStatus: AdminPost["status"],
    ) => {
      if (!id) return;
      const fd = new FormData();
      fd.set("id", id);
      startTransition(async () => {
        const result = await action(null, fd);
        if (result.ok) {
          setStatus(nextStatus);
          router.refresh();
        } else {
          setError(result.error);
        }
      });
    },
    [id, router],
  );

  // Auto-save drafts on blur (never a published post — those update only on an
  // explicit Save, so half-finished edits never reach the public site).
  const autoSaveDraft = useCallback(() => {
    if (status !== "draft" || !id || !dirtyRef.current || isPending) return;
    runSave();
  }, [status, id, isPending, runSave]);

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadBlogImage(null, fd);
    setUploadingCover(false);
    if (result.ok) {
      setCover({ src: result.url, alt: cover?.alt ?? "", width: result.width, height: result.height });
      dirtyRef.current = true;
    } else {
      setError(result.error);
    }
  }

  async function handleInlineImage(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadBlogImage(null, fd);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!editor) return;
    // Require alt text so inline images match the cover's accessibility bar.
    const alt = window.prompt("Describe this image (alt text):")?.trim() ?? "";
    if (!alt) {
      setError("An image needs alt text. Nothing was inserted.");
      return;
    }
    editor.chain().focus().setImage({ src: result.url, alt }).run();
    dirtyRef.current = true;
  }

  const saveMessage =
    saveState === "saving"
      ? "Saving…"
      : saveState === "saved"
        ? "Saved."
        : saveState === "error"
          ? (error ?? "Could not save.")
          : status !== "draft"
            ? ""
            : id
              ? "Draft — changes save automatically."
              : "Save to create this draft.";

  const fieldErr = (name: string) =>
    fieldError === name ? (
      <p className="mt-1 font-body text-xs text-danger">{error}</p>
    ) : null;

  return (
    <div className="space-y-6">
      {status === "published" ? (
        <p className="rounded-lg border border-primary/30 bg-primary-tint/40 px-4 py-3 font-body text-sm text-ink">
          This post is live. Saving updates the public post immediately.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={autoSaveDraft}
            maxLength={200}
            className={inputClass}
          />
          {fieldErr("title")}
        </div>

        <div>
          <p className={labelClass}>
            Post URL {slugLocked ? "(locked)" : ""}
          </p>
          <p className="mt-1 rounded-lg border border-line bg-surface-sunk px-3 py-2 font-body text-sm text-muted">
            /blog/{derivedSlug || "…"}
          </p>
          <p className="mt-1 font-body text-xs text-muted">
            {slugLocked
              ? "Set from the title when first published; fixed now so shared links keep working."
              : "Created automatically from the title."}
          </p>
          {fieldErr("slug")}
        </div>

        <div>
          <p className={labelClass}>Date shown on the post</p>
          <p className="mt-1 rounded-lg border border-line bg-surface-sunk px-3 py-2 font-body text-sm text-muted">
            {publishedDate ?? "Set automatically when you publish."}
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => { setExcerpt(e.target.value); dirtyRef.current = true; }}
            onBlur={autoSaveDraft}
            rows={2}
            maxLength={300}
            placeholder="A one or two sentence summary shown in the blog list and link previews."
            className={inputClass}
          />
          {fieldErr("excerpt")}
        </div>

        <div>
          <label className={labelClass} htmlFor="author">Author</label>
          <input
            id="author"
            value={author}
            onChange={(e) => { setAuthor(e.target.value); dirtyRef.current = true; }}
            onBlur={autoSaveDraft}
            maxLength={120}
            className={inputClass}
          />
        </div>
      </div>

      {/* Cover image */}
      <div>
        <p className={labelClass}>Cover image</p>
        {cover ? (
          <div className="mt-2 space-y-2">
            {/* A plain img: this is an admin-only preview of a freshly uploaded
                asset, not a public LCP image, so next/image's optimization and
                remote-pattern constraints add no value here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover.src} alt={cover.alt} className="max-h-48 rounded-lg border border-line" />
            <div>
              <label className="font-body text-xs font-semibold text-muted" htmlFor="coverAlt">
                Alt text (required)
              </label>
              <input
                id="coverAlt"
                value={cover.alt}
                onChange={(e) => { setCover({ ...cover, alt: e.target.value }); dirtyRef.current = true; }}
                onBlur={autoSaveDraft}
                placeholder="Describe the cover image for screen readers."
                className={inputClass}
              />
              {fieldErr("coverAlt")}
            </div>
            <button type="button" className={ghostBtn} onClick={() => { setCover(null); dirtyRef.current = true; }}>
              Remove cover
            </button>
          </div>
        ) : (
          <label className={`${ghostBtn} mt-2 cursor-pointer`}>
            {uploadingCover ? "Uploading…" : "Upload cover image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCoverUpload(f);
              }}
            />
          </label>
        )}
      </div>

      {/* Body editor */}
      <div>
        <p className={labelClass}>Body</p>
        {editor ? (
          <>
            <div className="mt-1 flex flex-wrap items-center gap-1 rounded-t-lg border border-line bg-surface-sunk px-2 py-1.5">
              <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="size-4" /></ToolbarButton>
              <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="size-4" /></ToolbarButton>
              <ToolbarButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="size-4" /></ToolbarButton>
              <ToolbarButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="size-4" /></ToolbarButton>
              <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="size-4" /></ToolbarButton>
              <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-4" /></ToolbarButton>
              <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="size-4" /></ToolbarButton>
              <ToolbarButton label="Link" active={editor.isActive("link")} onClick={() => {
                const url = window.prompt("Link URL (https://…):") ?? "";
                if (!url) { editor.chain().focus().unsetLink().run(); return; }
                editor.chain().focus().setLink({ href: url }).run();
              }}><Link2 className="size-4" /></ToolbarButton>
              <label className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-surface-sunk" aria-label="Insert image">
                <ImagePlus className="size-4" />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleInlineImage(f); }} />
              </label>
            </div>
            <EditorContent editor={editor} onBlur={autoSaveDraft} />
            {fieldErr("bodyHtml")}
          </>
        ) : (
          <p className="mt-2 font-body text-sm text-muted">Loading editor…</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="button" className={primaryBtn} onClick={runSave} disabled={isPending}>
          Save
        </button>
        {status === "published" ? (
          <button type="button" className={ghostBtn} disabled={isPending} onClick={() => {
            if (window.confirm("Remove this post from the public site?")) {
              runStatusAction(unpublishBlogPost, "draft");
            }
          }}>
            Unpublish
          </button>
        ) : (
          <button type="button" className={primaryBtn} onClick={runPublish} disabled={isPending}>
            Publish
          </button>
        )}
        {id ? (
          <a href={`/admin/blog/${id}/preview`} target="_blank" rel="noopener noreferrer" className={ghostBtn}>
            Preview
          </a>
        ) : null}
        {id && status !== "archived" ? (
          <button type="button" className={`${ghostBtn} text-danger`} disabled={isPending} onClick={() => {
            if (window.confirm("Archive this post? It will be removed from the public site (recoverable).")) {
              runStatusAction(archiveBlogPost, "archived");
            }
          }}>
            Archive
          </button>
        ) : null}
        {status === "published" && post ? (
          <a href={`/blog/${derivedSlug}`} target="_blank" rel="noopener noreferrer" className="font-body text-sm font-semibold text-primary hover:underline">
            View live post →
          </a>
        ) : null}
        <span
          className={`ms-auto font-body text-xs ${saveState === "error" ? "text-danger" : "text-muted"}`}
          aria-live="polite"
        >
          {saveMessage}
        </span>
      </div>
    </div>
  );
}
