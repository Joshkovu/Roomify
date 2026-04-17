import { CheckCircle2, UploadIcon, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react"
import { useOutletContext } from "react-router";
import {
  ACCEPTED_FILE_TYPES,
  MAX_UPLOAD_SIZE,
  PROGRESS_INCREMENT,
  PROGRESS_INTERVAL_MS,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

interface UploadProps {
  onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete = () => {} }: UploadProps) => {
    const [file,setFile]= useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
    const {isSignedIn} = useOutletContext<AuthContext>();
    const uploadIntervalRef = useRef<number | null>(null);
    const redirectTimeoutRef = useRef<number | null>(null);

    const clearUploadTimers = () => {
      if (uploadIntervalRef.current !== null) {
        window.clearInterval(uploadIntervalRef.current);
        uploadIntervalRef.current = null;
      }

      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };

    useEffect(() => {
      return () => {
        clearUploadTimers();
      };
    }, []);

    const validateFile = (nextFile: File): string | null => {
      if (nextFile.size > MAX_UPLOAD_SIZE) {
        return "File exceeds the 50MB upload limit.";
      }

      if (!ACCEPTED_FILE_TYPES.includes(nextFile.type as (typeof ACCEPTED_FILE_TYPES)[number])) {
        return "Unsupported file type. Please upload a JPG or PNG image.";
      }

      return null;
    };

    const processFile = (nextFile: File) => {
      if (!isSignedIn) return;

      const validationError = validateFile(nextFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      clearUploadTimers();
      setError(null);
      setFile(nextFile);
      setProgress(0);
      setIsDragging(false);

      const reader = new FileReader();

      reader.onload = () => {
        const base64Data = typeof reader.result === "string" ? reader.result : "";

        if (!base64Data) return;

        uploadIntervalRef.current = window.setInterval(() => {
          setProgress((currentProgress) => {
            const nextProgress = Math.min(currentProgress + PROGRESS_INCREMENT, 100);

            if (nextProgress === 100) {
              clearUploadTimers();
              redirectTimeoutRef.current = window.setTimeout(() => {
                onComplete(base64Data);
              }, REDIRECT_DELAY_MS);
            }

            return nextProgress;
          });
        }, PROGRESS_INTERVAL_MS);
      };

      reader.readAsDataURL(nextFile);
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isSignedIn) return;

      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      processFile(selectedFile);
    };

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!isSignedIn) return;
      setIsDragging(true);
    };

    const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!isSignedIn) return;
      setIsDragging(false);
    };

    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!isSignedIn) return;

      setIsDragging(false);
      const droppedFile = event.dataTransfer.files?.[0];
      if (!droppedFile) return;

      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      processFile(droppedFile);
    };

  return (
    <div className="upload">
  {!file?(
    <>
    <div
      className={`dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
        <input
          type="file"
          className="drop-input "
          accept=".jpg,.jpeg,.png,.webp"
          disabled={!isSignedIn}
          onChange={onFileChange}
        />
         
         <div className="drop-content">
     <div className="drop-icon">
        <UploadIcon size={22} />
     </div>
     <p>
        {isSignedIn ? "Drag and drop your floor plan here, or click to select a file" : "Please log in to upload your floor plan"}
     </p>
     <p className="help">
        Maximum-file-size: 50MB
     </p>
      {error && <p className="help">{error}</p>}
         </div>
         </div>
         </>
  ):(
    <div className="upload-status">
        <div className="status-content">
            <div className="status-icon">
                {progress === 100 ? (
                    <CheckCircle2 className="check"/>
                ):(
                    <ImageIcon className="image"/>
                )}
            </div>
            <h3>{file.name}</h3>
            <div className="progress">
                <div className="bar" style={{width: `${progress}%`}}/>
                <p className="status-text">
                    {progress < 100 ? `Uploading... ${progress}%` : "Upload complete!"}
                </p>

            </div>
        </div>
    </div>
  )}
    </div>
  )
}

export default Upload