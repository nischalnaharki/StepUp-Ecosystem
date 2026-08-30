"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function BookViewer() {
  const container = useRef<HTMLDivElement>(null);
  const pages = useRef<HTMLDivElement[]>([]);
  const currentPageRef = useRef(1);
  const [message, setMessage] = useState("Loading book…");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  const savePage = useCallback((page: number) => {
    void fetch("/api/book/progress", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page }), keepalive: true });
  }, []);
  const setActivePage = useCallback((page: number, save = true) => {
    currentPageRef.current = page;
    setCurrentPage(page);
    setPageInput(String(page));
    if (save) savePage(page);
  }, [savePage]);
  const goToPage = useCallback((page: number) => {
    const safePage = Math.max(1, Math.min(totalPages, page));
    pages.current[safePage - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActivePage(safePage);
  }, [setActivePage, totalPages]);

  useEffect(() => {
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    async function render() {
      try {
        const [response, progressResponse] = await Promise.all([
          fetch("/api/book/view", { credentials: "same-origin", cache: "no-store" }),
          fetch("/api/book/progress", { credentials: "same-origin", cache: "no-store" }),
        ]);
        if (!response.ok) throw new Error(response.status === 404 ? "The book has not been uploaded yet." : "You do not have access to this book.");
        const savedPage = progressResponse.ok ? Number((await progressResponse.json()).page) || 1 : 1;
        const data = new Uint8Array(await response.arrayBuffer());
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
        const pdf = await pdfjs.getDocument({ data }).promise;
        if (cancelled || !container.current) return;

        const saved = Math.max(1, Math.min(pdf.numPages, savedPage));
        container.current.replaceChildren();
        pages.current = [];
        setTotalPages(pdf.numPages);
        setActivePage(saved, false);
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.6 });
          const pageElement = document.createElement("div");
          pageElement.className = "book-page";
          pageElement.dataset.page = String(pageNumber);
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.setAttribute("aria-label", `Book page ${pageNumber}`);
          pageElement.append(canvas);
          const context = canvas.getContext("2d");
          if (context) await page.render({ canvas, canvasContext: context, viewport }).promise;
          if (!cancelled) { pages.current.push(pageElement); container.current?.append(pageElement); }
        }
        if (cancelled) return;
        observer = new IntersectionObserver((entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          const page = Number((visible?.target as HTMLElement | undefined)?.dataset.page);
          if (page && page !== currentPageRef.current) setActivePage(page);
        }, { threshold: [0.25, 0.5, 0.75] });
        pages.current.forEach((page) => observer?.observe(page));
        requestAnimationFrame(() => pages.current[saved - 1]?.scrollIntoView({ block: "start" }));
        setMessage("");
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Unable to load the book.");
      }
    }
    render();
    return () => { cancelled = true; observer?.disconnect(); savePage(currentPageRef.current); };
  }, [savePage, setActivePage]);

  const submitPage = (event: React.FormEvent) => {
    event.preventDefault();
    const page = Number(pageInput);
    if (Number.isInteger(page)) goToPage(page); else setPageInput(String(currentPage));
  };

  return <section className="book-viewer" onContextMenu={(event) => event.preventDefault()}>
    {totalPages > 0 && <div className="book-navigation" aria-label="Book navigation">
      <button type="button" className="secondary small" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>← Previous</button>
      <form onSubmit={submitPage}><label htmlFor="book-page">Page</label><input id="book-page" type="number" inputMode="numeric" min="1" max={totalPages} value={pageInput} onChange={(event) => setPageInput(event.target.value)} aria-label={`Current page, of ${totalPages}`} /><span>of {totalPages}</span></form>
      <button type="button" className="secondary small" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next →</button>
      <p aria-live="polite">Page {currentPage} of {totalPages}</p>
    </div>}
    {message && <p className="book-message">{message}</p>}
    <div ref={container} className="book-pages" />
  </section>;
}
