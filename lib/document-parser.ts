import { UploadedDocument, DocumentType } from '@/types';

/**
 * Detect document type from filename
 */
export function detectDocumentType(filename: string): DocumentType {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') return 'pdf';
  if (ext === 'md' || ext === 'markdown') return 'markdown';

  return 'markdown'; // Default
}

/**
 * Parse PDF file to text using pdfjs-dist
 */
export async function parsePDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source for client-side
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('PDF 파싱에 실패했습니다');
  }
}

/**
 * Parse Markdown file to text
 */
export async function parseMarkdown(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다'));
    reader.readAsText(file);
  });
}

/**
 * Parse uploaded document to text
 */
export async function parseDocument(
  uploadedDoc: UploadedDocument
): Promise<string> {
  const { file, type } = uploadedDoc;

  if (type === 'pdf') {
    return parsePDF(file);
  }

  return parseMarkdown(file);
}

/**
 * Create UploadedDocument from File
 */
export async function createUploadedDocument(
  file: File
): Promise<UploadedDocument> {
  const type = detectDocumentType(file.name);
  const text = await parseDocument({ file, type });

  return {
    file,
    type,
    text,
  };
}

/**
 * Truncate text to max length for AI processing
 */
export function truncateText(text: string, maxLength = 15000): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
