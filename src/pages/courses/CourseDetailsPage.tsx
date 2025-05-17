import React from 'react';
import { useParams } from 'react-router-dom';

const CourseDetailsPage = () => {
  const { courseId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Course Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Course ID: {courseId}</p>
        {/* Course details will be implemented later */}
      </div>
    </div>
  );
};

export default CourseDetailsPage;