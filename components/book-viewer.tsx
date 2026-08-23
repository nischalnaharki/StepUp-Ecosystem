"use client";

import { useEffect, useRef, useState } from "react";

export function BookViewer() {
  const container = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("Loading book…");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const response = await fetch("/api/book/view", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "The book has not been uploaded yet."
              : "You do not have access to this book."
          );
        }

        const data = new Uint8Array(await response.arrayBuffer());

        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const pdf = await pdfjs.getDocument({ data }).promise;
        if (cancelled || !container.current) return;

        container.current.replaceChildren();

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.6 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.setAttribute("aria-label", `Book page ${pageNumber}`);

          const context = canvas.getContext("2d");
          if (context) {
            await page.render({ canvas, canvasContext: context, viewport }).promise;
          }

          if (!cancelled) {
            container.current?.append(canvas);
          }
        }

        if (!cancelled) setMessage("");
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Unable to load the book.");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="book-viewer"
      onContextMenu={(event) => event.preventDefault()}
    >
      {message && <p className="book-message">{message}</p>}
      <div ref={container} className="book-pages" />
    </section>
  );
}