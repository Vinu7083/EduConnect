import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import { Message } from '../../types';
import { ApiResponse } from '../../types';

const PendingApprovalPage = () => {
  const { showSuccess, showError } = useToast();
  
  const [pendingResponses, setPendingResponses] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  
  // Fetch pending AI responses
  useEffect(() => {
    const fetchPendingResponses = async () => {
      try {
        const response = await api.get<ApiResponse<Message[]>>('/ai/pending');
        
        if (response.data?.data) {
          setPendingResponses(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching pending responses:', error);
        showError('Failed to load pending responses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingResponses();
  }, [showError]);
  
  // Handle approve response
  const handleApprove = async (messageId: string) => {
    setApproving(messageId);
    
    try {
      await api.post<ApiResponse<Message>>('/ai/approve', { messageId });
      
      // Remove from list
      setPendingResponses((prevResponses) =>
        prevResponses.filter((response) => response._id !== messageId)
      );
      
      showSuccess('Response approved successfully');
    } catch (error) {
      console.error('Error approving response:', error);
      showError('Failed to approve response');
    } finally {
      setApproving(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-600 font-semibold">Loading pending approvals...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h1 className="text-2xl font-bold mb-2">Pending AI Response Approvals</h1>
        <p className="text-neutral-600">
          Review and approve AI-generated responses before they're shown to students.
        </p>
      </div>
      
      {/* Pending approvals list */}
      <div className="space-y-4">
        {pendingResponses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-success-50 rounded-full">
                <CheckCircle size={24} className="text-success-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No pending approvals</h3>
            <p className="text-neutral-600">
              All AI responses have been reviewed. Check back later for new items.
            </p>
          </div>
        ) : (
          pendingResponses.map((response) => (
            <div key={response._id} className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="p-4 bg-secondary-50 border-b border-secondary-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-secondary-700">
                      Course: {response.courseId?.title} ({response.courseId?.code})
                    </span>
                    <h3 className="text-lg font-semibold mt-1">
                      Thread: {response.threadId?.title}
                    </h3>
                  </div>
                  <div className="badge badge-secondary">
                    AI Response
                  </div>
                </div>
              </div>
              
              {/* Student question */}
              {response.replyTo && (
                <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">
                    Student Question:
                  </h4>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                        <MessageSquare size={16} className="text-neutral-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">
                        From: {response.replyTo.userId?.name}
                      </p>
                      <p className="text-neutral-800">{response.replyTo.content}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* AI response */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-neutral-700 mb-2">
                  AI Generated Response:
                </h4>
                <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-100">
                  <p className="text-neutral-800 whitespace-pre-line">{response.content}</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
                <button
                  className="btn btn-ghost text-error-600 hover:bg-error-50 mr-2"
                  onClick={() => {
                    // Future implementation: Reject or edit the response
                    showError('This feature is not implemented yet');
                  }}
                >
                  <XCircle size={18} className="mr-2" />
                  Reject
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleApprove(response._id)}
                  disabled={approving === response._id}
                >
                  {approving === response._id ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Approving...
                    </span>
                  ) : (
                    <>
                      <CheckCircle size={18} className="mr-2" />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingApprovalPage;