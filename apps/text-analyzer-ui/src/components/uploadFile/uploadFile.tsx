import { useState } from 'react';
import { Upload } from 'lucide-react';
import styles from './uploadFile.module.css';

type UploadFileProps = {
  acceptedFormats?: string[];
  onSelect: (file: File) => void;
  onSelectError: (error: Error) => void;
  isBusy?: boolean;
};

export function UploadFile({
  acceptedFormats = ['.txt'],
  onSelect,
  onSelectError,
  isBusy = false,
}: UploadFileProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const formats = acceptedFormats.join(', ');
  const normalizedFormats = acceptedFormats.map((format) => format.toLowerCase());
  const titleText = isDragActive
    ? 'Release to upload your file'
    : `Drop your ${formats} file here`;

  const validateAndSelectFile = (file: File) => {
    if (isBusy) {
      return;
    }

    const isValid =
      !acceptedFormats ||
      normalizedFormats.some((format) => file.name.toLowerCase().endsWith(format));

    if (isValid) {
      onSelect(file);
      return;
    }

    onSelectError(new Error('Invalid file format'));
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
    } 
    e.target.value = '';
  };

  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isBusy) {
      setIsDragActive(true);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isBusy) {
      setIsDragActive(true);
    }
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    if (isBusy) {
      return;
    }

    const file = event.dataTransfer.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };
  
  return (
    <section className={styles.uploadCard}>
      <div
        className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${
          isBusy ? styles.dropzoneDisabled : ''
        }`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-disabled={isBusy}
      >
        <div className={styles.dropIcon}>
          <Upload size={28} />
        </div>
        <p className={styles.dropTitle}>{titleText}</p>
        <p className={styles.dropSubtitle}>or click to browse</p>
        <div className={styles.dropButton}>Choose file</div>
        <p className={styles.dropHelper}>Accepted format: {formats}</p>
        <input
          className={styles.dropInput}
          type="file"
          accept={formats}
          onChange={onFileSelect}
          disabled={isBusy}
          aria-busy={isBusy}
        />
      </div>
    </section>
  );
}

export default UploadFile;
