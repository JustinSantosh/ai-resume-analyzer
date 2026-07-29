import { useCallback } from "react";

import { useDropzone } from "react-dropzone";

import { MAX_FILE_SIZE, PDF_MIME_TYPE } from "~/constants";
import { formatSize } from "~/lib/utils";

interface FileUploaderProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
    disabled?: boolean;
}

const FileUploader = ({ file, onFileSelect, disabled = false }: FileUploaderProps) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => onFileSelect(acceptedFiles[0] ?? null),
        [onFileSelect],
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        disabled,
        multiple: false,
        accept: { [PDF_MIME_TYPE]: [".pdf"] },
        maxSize: MAX_FILE_SIZE,
    });

    return (
        <div className="gradient-border w-full">
            <div
                {...getRootProps({
                    className:
                        "min-h-52 cursor-pointer rounded-xl bg-white p-8 text-center focus-visible:outline-2 focus-visible:outline-brand-blue",
                })}
            >
                <input {...getInputProps({ "aria-label": "Select a PDF resume" })} />
                {file ? (
                    <div className="uploader-selected-file" onClick={(event) => event.stopPropagation()}>
                        <img src="/images/pdf.png" alt="" className="size-10" />
                        <div className="min-w-0 text-left">
                            <p className="truncate text-sm font-medium text-gray-700">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                        </div>
                        <button
                            type="button"
                            className="cursor-pointer rounded p-2 focus-visible:outline-2 focus-visible:outline-brand-blue"
                            onClick={() => onFileSelect(null)}
                            aria-label={`Remove ${file.name}`}
                        >
                            <img src="/icons/cross.svg" alt="" className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div>
                        <img src="/icons/info.svg" alt="" className="mx-auto mb-2 size-20" />
                        <p className="text-lg text-gray-500">
                            <span className="font-semibold">
                                {isDragActive ? "Drop your PDF here" : "Click to upload"}
                            </span>
                            {!isDragActive && " or drag and drop"}
                        </p>
                        <p className="text-gray-500">PDF (max {formatSize(MAX_FILE_SIZE)})</p>
                    </div>
                )}
            </div>
            {fileRejections.length > 0 && (
                <p className="mt-2 text-sm text-red-700" role="alert">
                    Choose a PDF smaller than {formatSize(MAX_FILE_SIZE)}.
                </p>
            )}
        </div>
    );
};

export default FileUploader;
