
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';

type JobProps = {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  userId: string;
  userName: string;
  timestamp: number;
  status: 'open' | 'in-progress' | 'completed';
  comments: any[];
  likedBy?: string[];
  likesCount?: number;
};

export const JobCard = ({ job }: { job: JobProps }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:border-wfc-purple transition-colors w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">{job.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Publicado por {job.userName} • {formatDate(job.timestamp)}
            </p>
          </div>
          <div className={`
            text-xs px-2 py-1 rounded-full
            ${job.status === 'open' ? 'bg-green-100 text-green-800' : 
              job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
              'bg-gray-100 text-gray-800'}
          `}>
            {job.status === 'open' ? 'Abierto' : 
            job.status === 'in-progress' ? 'En progreso' : 
            'Completado'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium mb-1">Descripción</h3>
            <p className="text-sm text-gray-700 line-clamp-3">{job.description}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Habilidades requeridas</h3>
            <div className="flex flex-wrap gap-1">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-sm font-medium">
                Presupuesto: ${job.budget}
              </div>
              <div className="flex space-x-3 text-xs text-muted-foreground mt-1">
                <div className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {job.comments.length}
                </div>
                <div className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {job.likesCount || 0}
                </div>
              </div>
            </div>
            <Link to={`/jobs/${job.id}`}>
              <Button variant="outline" size="sm">Ver detalles</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
