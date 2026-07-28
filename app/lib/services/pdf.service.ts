import type { PDFDocumentProxy } from "pdfjs-dist";

import { MAX_FILE_SIZE, PDF_MIME_TYPE } from "~/constants";
import { ApplicationError, toApplicationError } from "~/lib/errors";

interface PdfProcessingResult {
    text: string;
    previewFile: File;
    previewUrl: string;
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

export const pdfService = {
    validatePdf,
    processPdf,
};
