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
  const formats = acceptedFormats.join(', ');

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      // validate file extension
      const file = e.target.files[0];
      if (!acceptedFormats || acceptedFormats.some(format => file.name.endsWith(format))) {
        onSelect(file);
      } else {
        onSelectError(new Error('Invalid file format'));
      }      
    } 
    e.target.value = '';
  };
  
  return (
    <section className={styles.uploadCard}>
      <div className={styles.dropzone}>
        <div className={styles.dropIcon}>
          <Upload size={28} />
        </div>
        <p className={styles.dropTitle}>Drop your {formats} file here</p>
        <p className={styles.dropSubtitle}>or click to browse</p>
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
