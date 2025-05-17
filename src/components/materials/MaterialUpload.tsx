import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';

interface MaterialUploadProps {
  onSuccess: () => void;
}

interface UploadFormData {
  title: string;
  description: string;
}

const MaterialUpload = ({ onSuccess }: MaterialUploadProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { showSuccess, showError } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadFormData>({
    defaultValues: {
      title: '',
      description: '',
    },
  });
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'video/mp4': ['.mp4'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    onDropRejected: (rejections) => {
      if (rejections.length > 0) {
        const { code } = rejections[0].errors[0];
        
        if (code === 'file-too-large') {
          showError('File is too large. Maximum size is 50MB.');
        } else if (code === 'file-invalid-type') {
          showError('Invalid file type. Please upload PDF, DOC, DOCX, PPT, PPTX, JPG, PNG or MP4.');
        } else {
          showError('Error uploading file. Please try again.');
        }
      }
    },
  });
  
  const onSubmit = async (data: UploadFormData) => {
    if (!file || !courseId) {
      showError('Please select a file to upload.');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('file', file);
      formData.append('courseId', courseId);
      
      await api.upload('/materials', formData);
      
      showSuccess('Material uploaded successfully!');
      
      // Reset form and file
      reset();
      setFile(null);
      
      // Trigger refresh in parent component
      onSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload material. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const removeFile = () => {
    setFile(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Course Material</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="Enter material title"
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters',
              },
            })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className={`input ${errors.description ? 'input-error' : ''}`}
            placeholder="Enter material description"
            {...register('description', {
              required: 'Description is required',
              minLength: {
                value: 10,
                message: 'Description must be at least 10 characters',
              },
            })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            File
          </label>
          
          {file ? (
            <div className="mt-2 flex items-center p-4 bg-primary-50 border border-primary-200 rounded-md">
              <FileText className="w-8 h-8 text-primary-500 mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-primary-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="ml-4 p-1 rounded-full text-primary-500 hover:bg-primary-100"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-300 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'
              } ${isDragReject ? 'border-error-300 bg-error-50' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="space-y-1 text-center">
                <Upload
                  className={`mx-auto h-12 w-12 ${
                    isDragActive ? 'text-primary-500' : 'text-neutral-400'
                  }`}
                />
                <div className="flex text-sm text-center text-neutral-600">
                  <p className="relative">
                    <span className="font-medium text-primary-600 hover:text-primary-500">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                </div>
                <p className="text-xs text-neutral-500">
                  PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, MP4 up to 50MB
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading || !file}
          >
            {uploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload size={16} className="mr-2" />
                Upload Material
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialUpload;