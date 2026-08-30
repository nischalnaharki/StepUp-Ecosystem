import { del, get, put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const LOCAL_STORAGE_DIRECTORY = path.join(process.cwd(), "storage");

export class BookStorageConfigurationError extends Error {
  constructor() {
    super("Book storage is not configured.");
  }
}

function usesBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isBlobUrl(storageFilename: string) {
  return storageFilename.startsWith("https://");
}

/** Stores the PDF and returns the value persisted in BookAsset.storageFilename. */
export async function saveBookPdf(courseId: string, file: File) {
  if (usesBlobStorage()) {
    const blob = await put(`books/${courseId}/${crypto.randomUUID()}.pdf`, file, {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/pdf",
      multipart: true,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new BookStorageConfigurationError();
  }

  await mkdir(LOCAL_STORAGE_DIRECTORY, { recursive: true });
  const storageFilename = `course-book-${courseId}.pdf`;
  await writeFile(path.join(LOCAL_STORAGE_DIRECTORY, storageFilename), Buffer.from(await file.arrayBuffer()));
  return storageFilename;
}

export async function readBookPdf(storageFilename: string) {
  if (isBlobUrl(storageFilename)) {
    const result = await get(storageFilename, { access: "private" });
    if (!result || result.statusCode !== 200) throw new Error("Book not found");
    return result.stream;
  }

  return readFile(path.join(LOCAL_STORAGE_DIRECTORY, storageFilename));
}

/** Blob replacement should not fail a successful upload if cleanup is unavailable. */
export async function removeBookPdf(storageFilename: string | null | undefined) {
  if (storageFilename && isBlobUrl(storageFilename) && usesBlobStorage()) {
    await del(storageFilename);
  }
}
