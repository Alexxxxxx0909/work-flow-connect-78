
import React from 'react';
import { useJobs } from '@/contexts/JobContext';
import { JobCard } from '@/components/JobCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookmarkPlus, PlusCircle } from 'lucide-react';

const SavedJobsPage = () => {
  const { savedJobs, isLoading } = useJobs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-wfc-purple rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Propuestas Guardadas</h1>
        <Link to="/create-job">
          <Button className="bg-wfc-purple hover:bg-wfc-purple-medium">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Propuesta
          </Button>
        </Link>
      </div>

      {savedJobs.length > 0 ? (
        <div className="grid gap-6">
          {savedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <BookmarkPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
            No tienes propuestas guardadas
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Guarda propuestas que te interesen para verlas más tarde
          </p>
          <Link to="/jobs">
            <Button variant="outline">
              Explorar propuestas
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
