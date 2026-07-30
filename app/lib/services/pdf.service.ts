import type { PDFDocumentProxy } from "pdfjs-dist";

import { MAX_FILE_SIZE, PDF_MIME_TYPE } from "~/constants";
import { ApplicationError, toApplicationError } from "~/lib/errors";

interface PdfProcessingResult {
    text: string;
    previewFile: File;
    previewUrl: string;
}

interface HighlightedPdfOptions {
    source: string;
    container: HTMLElement;
    keywords: KeywordInsight[];
    width: number;
    signal: AbortSignal;
}

type PdfJsLibrary = typeof import("pdfjs-dist");

let pdfLibraryPromise: Promise<PdfJsLibrary> | null = null;

const loadPdfLibrary = async (): Promise<PdfJsLibrary> => {
    if (!pdfLibraryPromise) {
        pdfLibraryPromise = import("pdfjs-dist").then((library) => {
            library.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
            return library;
        });
    }

    return pdfLibraryPromise;
};

const validatePdf = (file: File): void => {
    const isPdf =
        file.type === PDF_MIME_TYPE || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
        throw new ApplicationError("INVALID_FILE", "Select a PDF file.");
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
        throw new ApplicationError(
            "INVALID_FILE",
            "The PDF must be smaller than 20 MB and cannot be empty.",
        );
    }
};

const escapeRegularExpression = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightTextRun = (
    element: HTMLElement,
    text: string,
    keywords: KeywordInsight[],
): void => {
    const insightsByKeyword = new Map<string, KeywordInsight>();
    keywords.forEach((insight) => {
        const keyword = insight.keyword.trim();
        if (keyword.length > 1) {
            insightsByKeyword.set(keyword.toLocaleLowerCase(), {
                keyword,
                explanation: insight.explanation,
            });
        }
    });

    const terms = [...insightsByKeyword.keys()].sort(
        (left, right) => right.length - left.length,
    );
    if (terms.length === 0) return;

    const pattern = new RegExp(
        `(?<![\\p{L}\\p{N}_])(${terms.map(escapeRegularExpression).join("|")})(?![\\p{L}\\p{N}_])`,
        "giu",
    );
    const parts = text.split(pattern);
    if (parts.length === 1) return;

    const fragment = document.createDocumentFragment();
    parts.forEach((part) => {
        const insight = insightsByKeyword.get(part.toLocaleLowerCase());
        if (!insight) {
            fragment.append(document.createTextNode(part));
            return;
        }

        const mark = document.createElement("mark");
        mark.className = "pdf-keyword-mark";
        mark.title = insight.explanation;
        mark.textContent = part;
        fragment.append(mark);
    });
    element.replaceChildren(fragment);
};

const extractText = async (pdf: PDFDocumentProxy): Promise<string> => {
    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ")
            .trim();
        pageTexts.push(text);
    }

    const resumeText = pageTexts.filter(Boolean).join("\n\n");
    if (!resumeText) {
        throw new ApplicationError(
            "PDF_PARSE_FAILED",
            "No readable text was found in this PDF.",
        );
    }

    return resumeText;
};

const renderPreview = async (pdf: PDFDocumentProxy, name: string): Promise<File> => {
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        throw new ApplicationError(
            "PDF_PARSE_FAILED",
            "Your browser could not create a resume preview.",
        );
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
            if (value) {
                resolve(value);
            } else {
                reject(
                    new ApplicationError(
                        "PDF_PARSE_FAILED",
                        "The resume preview could not be generated.",
                    ),
                );
            }
        }, "image/png");
    });

    return new File([blob], `${name.replace(/\.pdf$/i, "")}-preview.png`, {
        type: "image/png",
    });
};

const processPdf = async (file: File): Promise<PdfProcessingResult> => {
    validatePdf(file);

    try {
        const library = await loadPdfLibrary();
        const source = new Uint8Array(await file.arrayBuffer());
        const pdf = await library.getDocument({ data: source }).promise;
        const [text, previewFile] = await Promise.all([
            extractText(pdf),
            renderPreview(pdf, file.name),
        ]);

        return {
            text,
            previewFile,
            previewUrl: URL.createObjectURL(previewFile),
        };
    } catch (error) {
        throw toApplicationError(
            error,
            "PDF_PARSE_FAILED",
            "The PDF could not be processed.",
        );
    }
};

const renderHighlightedPdf = async ({
    source,
    container,
    keywords,
    width,
    signal,
}: HighlightedPdfOptions): Promise<void> => {
    const library = await loadPdfLibrary();
    if (signal.aborted) return;

    const loadingTask = library.getDocument(source);
    const abortLoading = () => {
        void loadingTask.destroy();
    };
    signal.addEventListener("abort", abortLoading, { once: true });

    let pdf: PDFDocumentProxy | null = null;
    try {
        pdf = await loadingTask.promise;
        container.replaceChildren();

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            if (signal.aborted) return;

            const page = await pdf.getPage(pageNumber);
            const baseViewport = page.getViewport({ scale: 1 });
            const availableWidth = Math.max(280, width - 24);
            const scale = Math.min(2, availableWidth / baseViewport.width);
            const viewport = page.getViewport({ scale });
            const outputScale = Math.min(2, window.devicePixelRatio || 1);

            const pageElement = document.createElement("section");
            pageElement.className = "pdf-keyword-page";
            pageElement.style.width = `${viewport.width}px`;
            pageElement.style.height = `${viewport.height}px`;
            pageElement.style.setProperty("--scale-factor", `${scale}`);
            pageElement.setAttribute("aria-label", `Resume page ${pageNumber}`);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) {
                throw new ApplicationError(
                    "PDF_PARSE_FAILED",
                    "Your browser could not render the highlighted resume.",
                );
            }
            canvas.className = "pdf-keyword-canvas";
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = `${viewport.width}px`;
            canvas.style.height = `${viewport.height}px`;
            canvas.setAttribute("aria-hidden", "true");

            const textLayerElement = document.createElement("div");
            textLayerElement.className = "pdf-keyword-text-layer";

            pageElement.append(canvas, textLayerElement);
            container.append(pageElement);

            const renderTask = page.render({
                canvasContext: context,
                viewport,
                transform:
                    outputScale === 1
                        ? undefined
                        : [outputScale, 0, 0, outputScale, 0, 0],
            });
            const cancelRender = () => renderTask.cancel();
            signal.addEventListener("abort", cancelRender, { once: true });
            try {
                await renderTask.promise;
            } finally {
                signal.removeEventListener("abort", cancelRender);
            }

            if (signal.aborted) return;
            const textContent = await page.getTextContent();
            const textLayer = new library.TextLayer({
                textContentSource: textContent,
                container: textLayerElement,
                viewport,
            });
            const cancelTextLayer = () => textLayer.cancel();
            signal.addEventListener("abort", cancelTextLayer, { once: true });
            try {
                await textLayer.render();
            } finally {
                signal.removeEventListener("abort", cancelTextLayer);
            }

            textLayer.textDivs.forEach((element, index) => {
                highlightTextRun(
                    element,
                    textLayer.textContentItemsStr[index] ?? "",
                    keywords,
                );
            });
        }
    } finally {
        signal.removeEventListener("abort", abortLoading);
        await pdf?.destroy();
    }
};

export const pdfService = {
    validatePdf,
    processPdf,
    renderHighlightedPdf,
};
