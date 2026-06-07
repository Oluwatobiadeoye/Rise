"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import type { GallerySchool } from "@/lib/projects";

type Photo = GallerySchool["photos"][number];

type LightboxProps = {
  photos: Photo[];
  /** Used to label the thumbnail grid for assistive tech. */
  label: string;
};

/**
 * Clickable thumbnail grid plus a fullscreen overlay viewer. The only client
 * component in the Projects section: it owns the open/close state, keyboard
 * navigation, focus trap, and scroll lock. No browser dialogs are triggered.
 */
export function Lightbox({ photos, label }: LightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // The thumbnail that opened the viewer, so focus returns to it on close.
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);

  const go = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + photos.length) % photos.length;
      });
    },
    [photos.length],
  );

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      } else if (event.key === "Tab") {
        // Trap focus within the overlay's controls.
        const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
          "button",
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        // If focus has slipped outside the overlay, pull it back in.
        if (!overlayRef.current?.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
          return;
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, go]);

  if (photos.length === 0) return null;

  const active = openIndex !== null ? photos[openIndex] : null;

  return (
    <>
      <ul
        aria-label={label}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {photos.map((photo, index) => (
          <li key={photo.alt}>
            <Reveal>
              <button
                type="button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setOpenIndex(index);
                }}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg shadow-evergreen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  placeholder="blur"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            </Reveal>
          </li>
        ))}
      </ul>

      {active ? (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${label}: image ${(openIndex ?? 0) + 1} of ${photos.length}`}
          onClick={(event) => {
            // Click outside the image (on the backdrop) dismisses.
            if (event.target === event.currentTarget) close();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xl sm:p-8"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="size-6" aria-hidden="true" />
          </button>

          {photos.length > 1 ? (
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
            >
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
          ) : null}

          <Image
            src={active.src}
            alt={active.alt}
            sizes="100vw"
            placeholder="blur"
            className="h-auto max-h-[85vh] w-auto rounded-lg object-contain"
          />

          {photos.length > 1 ? (
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
            >
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
