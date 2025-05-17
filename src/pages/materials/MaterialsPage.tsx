import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import { Material, Course } from '../../types';
import MaterialUpload from '../../components/materials/MaterialUpload';
import MaterialItem from '../../components/materials/MaterialItem';
import { FileText, Filter, Search } from 'lucide-react';
import { ApiResponse } from '../../types';

const MaterialsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { showError } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  
  // Fetch course and materials
  useEffect(() => {
    if (!courseId) return;
    
    const fetchData = async () => {
      try {
        const [courseResponse, materialsResponse] = await Promise.all([
          api.get<ApiResponse<Course>>(`/courses/${courseId}`),
          api.get<ApiResponse<Material[]>>(`/materials?courseId=${courseId}`),
        ]);
        
        if (courseResponse.data?.data) {
          setCourse(courseResponse.data.data);
        }
        
        if (materialsResponse.data?.data) {
          setMaterials(materialsResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching materials data:', error);
        showError('Failed to load materials data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, showError]);
  
  // Handle material upload success
  const handleUploadSuccess = async () => {
    setShowUpload(false);
    
    // Reload materials
    try {
      const response = await api.get<ApiResponse<Material[]>>(`/materials?courseId=${courseId}`);
      
      if (response.data?.data) {
        setMaterials(response.data.data);
      }
    } catch (error) {
      console.error('Error reloading materials:', error);
    }
  };
  
  // Filter materials by search term
  const filteredMaterials = materials.filter(
    (material) =>
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-600 font-semibold">Loading materials...</p>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-lg text-neutral-600">Course not found</p>
      </div>
    );
  }
  
  const isProfessor = user?.role === 'professor';
  const isCourseProfessor = isProfessor && course.professor === user?._id;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h1 className="text-2xl font-bold mb-2">{course.title} - Materials</h1>
        <p className="text-neutral-600 mb-4">{course.code}</p>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search materials..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
          </div>
          
          {/* Filters (placeholder) */}
          <div className="flex items-center">
            <button className="btn btn-ghost">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
            
            {isCourseProfessor && (
              <button
                className="btn btn-primary ml-2"
                onClick={() => setShowUpload(!showUpload)}
              >
                {showUpload ? 'Cancel' : 'Upload Material'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Upload form for professors */}
      {isCourseProfessor && showUpload && (
        <MaterialUpload onSuccess={handleUploadSuccess} />
      )}
      
      {/* Materials list */}
      <div className="space-y-4">
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-primary-100 rounded-full">
                <FileText size={24} className="text-primary-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No materials available</h3>
            {isCourseProfessor ? (
              <p className="text-neutral-600 mb-4">
                Start by uploading your first course material
              </p>
            ) : (
              <p className="text-neutral-600 mb-4">
                No materials have been uploaded to this course yet
              </p>
            )}
            {isCourseProfessor && !showUpload && (
              <button
                className="btn btn-primary"
                onClick={() => setShowUpload(true)}
              >
                Upload Material
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => (
              <MaterialItem key={material._id} material={material} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;