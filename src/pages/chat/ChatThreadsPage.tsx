import React from 'react';
import { useParams } from 'react-router-dom';

const ChatThreadsPage = () => {
  const { courseId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Chat Threads</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          {/* Placeholder for chat threads list */}
          <p className="text-gray-600">Loading chat threads for course {courseId}...</p>
        </div>
      </div>
    </div>
  );
};

export default ChatThreadsPage;