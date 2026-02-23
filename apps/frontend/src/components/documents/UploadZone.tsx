import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/format';
import { documentsApi } from '@/services/api';
import toast from 'react-hot-toast';

interface Props {
  onUploadComplete?: () => void;
}

interface FileItem {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export default function UploadZone({ onUploadComplete }: Props) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({ file, status: 'pending' as const })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.webp'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending');
    if (pending.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading' } : f))
      );

      try {
        await documentsApi.upload(files[i].file);
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'done' } : f))
        );
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Upload failed';
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'error', error: msg } : f))
        );
      }
    }

    setIsUploading(false);
    toast.success('Upload complete! Documents are being processed.');
    onUploadComplete?.();
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop files here…</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium">Drag & drop documents here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
            <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG, DOCX up to 50 MB each</p>
          </>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
                {item.error && <p className="text-xs text-red-500">{item.error}</p>}
              </div>
              <div className="shrink-0">
                {item.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
                )}
                {item.status === 'done' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {(item.status === 'pending' || item.status === 'error') && (
                  <button onClick={() => removeFile(index)}>
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={uploadAll}
            disabled={isUploading || files.every((f) => f.status !== 'pending')}
            className="btn-primary w-full justify-center"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {files.filter((f) => f.status === 'pending').length} file(s)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
