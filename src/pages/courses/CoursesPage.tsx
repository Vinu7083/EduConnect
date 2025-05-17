import React from 'react';

const CoursesPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Course list will be implemented later */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">No courses available yet.</p>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;