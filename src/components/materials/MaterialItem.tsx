import { FileText, File, Image, Video } from 'lucide-react';
import { format } from 'date-fns';
import { Material } from '../../types';

interface MaterialItemProps {
  material: Material;
}

const MaterialItem = ({ material }: MaterialItemProps) => {
  const getFileIcon = () => {
    const fileType = material.fileType.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return <FileText size={24} className="text-error-600" />;
    } else if (fileType.includes('image')) {
      return <Image size={24} className="text-primary-600" />;
    } else if (fileType.includes('video')) {
      return <Video size={24} className="text-warning-600" />;
    } else {
      return <File size={24} className="text-secondary-600" />;
    }
  };
  
  const getFileTypeLabel = () => {
    const fileType = material.fileType.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return 'PDF';
    } else if (fileType.includes('word')) {
      return 'DOC';
    } else if (fileType.includes('powerpoint')) {
      return 'PPT';
    } else if (fileType.includes('image')) {
      return 'Image';
    } else if (fileType.includes('video')) {
      return 'Video';
    } else {
      return 'File';
    }
  };
  
  const getFileTypeColor = () => {
    const fileType = material.fileType.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return 'bg-error-100 text-error-800';
    } else if (fileType.includes('word')) {
      return 'bg-primary-100 text-primary-800';
    } else if (fileType.includes('powerpoint')) {
      return 'bg-warning-100 text-warning-800';
    } else if (fileType.includes('image')) {
      return 'bg-accent-100 text-accent-800';
    } else if (fileType.includes('video')) {
      return 'bg-secondary-100 text-secondary-800';
    } else {
      return 'bg-neutral-100 text-neutral-800';
    }
  };
  
  return (
    <a
      href={material.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Preview section */}
      <div className="h-32 bg-neutral-100 flex items-center justify-center overflow-hidden">
        {material.fileType.includes('image') ? (
          <img
            src={material.fileUrl}
            alt={material.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            {getFileIcon()}
            <p className="text-sm text-neutral-500 mt-2">{getFileTypeLabel()} Document</p>
          </div>
        )}
      </div>
      
      {/* Info section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate" title={material.title}>
            {material.title}
          </h3>
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor()}`}>
            {getFileTypeLabel()}
          </span>
        </div>
        
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2" title={material.description}>
          {material.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>By {material.uploadedBy.name}</span>
          <span>{format(new Date(material.uploadedAt), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </a>
  );
};

export default MaterialItem;