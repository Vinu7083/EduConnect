import { format } from 'date-fns';
import { User, MessageSquare, FileText, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';
import { Message } from '../../types';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  showApprovalStatus?: boolean;
}

const MessageItem = ({ message, isCurrentUser, showApprovalStatus = false }: MessageItemProps) => {
  const isAI = message.role === 'ai';
  const isProfessor = message.role === 'professor';
  const isImage = message.fileType?.startsWith('image/');
  
  return (
    <div
      className={`flex ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-lg p-3 ${
          isCurrentUser
            ? 'bg-primary-100 text-primary-900'
            : isAI
            ? 'bg-secondary-100 text-secondary-900'
            : isProfessor
            ? 'bg-accent-100 text-accent-900'
            : 'bg-white border border-neutral-200'
        }`}
      >
        {!isCurrentUser && (
          <div className="flex items-center mb-1 gap-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-neutral-200 text-neutral-700 text-xs">
              {isAI ? (
                <MessageSquare size={12} />
              ) : (
                message.user?.name?.charAt(0)?.toUpperCase() || <User size={12} />
              )}
            </div>
            <p className="text-xs font-medium">
              {isAI ? 'AI Assistant' : message.user?.name || 'Unknown User'}
              <span className="ml-1 text-neutral-500 font-normal">
                • {format(new Date(message.createdAt), 'MMM d, h:mm a')}
              </span>
            </p>
          </div>
        )}
        
        {message.fileUrl ? (
          <div className="mb-2">
            {isImage ? (
              <div className="rounded-md overflow-hidden mb-2">
                <img 
                  src={message.fileUrl} 
                  alt="Shared image" 
                  className="max-w-full h-auto"
                />
              </div>
            ) : (
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-neutral-50 rounded-md border border-neutral-200 hover:bg-neutral-100 transition-colors"
              >
                <FileText size={24} className="mr-2 text-neutral-500" />
                <div>
                  <p className="text-sm font-medium">File attachment</p>
                  <p className="text-xs text-neutral-500">
                    Click to download or view
                  </p>
                </div>
              </a>
            )}
          </div>
        ) : null}
        
        {message.content && <p className="text-sm">{message.content}</p>}
        
        {showApprovalStatus && (
          <div className="mt-2 flex items-center text-xs">
            {message.approved ? (
              <span className="flex items-center text-success-600">
                <CheckCircle size={12} className="mr-1" />
                Approved by professor
              </span>
            ) : (
              <span className="flex items-center text-warning-600">
                <Clock size={12} className="mr-1" />
                Awaiting professor approval
              </span>
            )}
          </div>
        )}
        
        {isCurrentUser && (
          <div className="mt-1 flex justify-end">
            <span className="text-xs text-neutral-500">
              {format(new Date(message.createdAt), 'h:mm a')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;