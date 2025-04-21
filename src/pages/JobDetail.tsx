
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { JobType, useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { CommentItem } from '@/components/Comments/CommentItem';
import EditJobForm from '@/components/EditJobForm';
import { Pencil, Trash2, Heart, BookmarkPlus, Send, ArrowLeft, MessageSquare } from 'lucide-react';

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getJob, updateJob, deleteJob, addCommentToJob, toggleJobLike, toggleSaveJob, isJobLikedByCurrentUser, isJobSavedByCurrentUser, getLikesCount } = useJobs();
  
  const [job, setJob] = useState<JobType | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Estados para likes y guardados
  const [liked, setLiked] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  // Cargar trabajo
  useEffect(() => {
    if (jobId) {
      const jobData = getJob(jobId);
      setJob(jobData);
      setLoading(false);
      
      if (jobData) {
        setLiked(isJobLikedByCurrentUser(jobId));
        setSaved(isJobSavedByCurrentUser(jobId));
        setLikesCount(getLikesCount(jobId));
      }
    }
  }, [jobId, getJob, isJobLikedByCurrentUser, isJobSavedByCurrentUser, getLikesCount]);

  // Manejar envío de comentario
  const handleSubmitComment = async () => {
    if (!job || !comment.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      await addCommentToJob(job.id, comment, currentUser);
      setComment('');
      
      // Actualizar trabajo después de añadir comentario
      const updatedJob = getJob(job.id);
      setJob(updatedJob);
      
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el comentario"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar actualización del trabajo
  const handleUpdateJob = async (updatedData: Partial<JobType>) => {
    if (!job) return;
    
    try {
      await updateJob(job.id, updatedData);
      
      // Actualizar el trabajo en el estado local
      const updatedJob = getJob(job.id);
      setJob(updatedJob);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar trabajo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el trabajo"
      });
    }
  };

  // Manejar eliminación del trabajo
  const handleDeleteJob = async () => {
    if (!job) return;
    
    try {
      await deleteJob(job.id);
      toast({
        title: "Trabajo eliminado",
        description: "El trabajo ha sido eliminado correctamente"
      });
      navigate('/jobs');
    } catch (error) {
      console.error('Error al eliminar trabajo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el trabajo"
      });
    }
  };

  // Manejar like del trabajo
  const handleLikeJob = async () => {
    if (!job) return;
    
    try {
      await toggleJobLike(job.id);
      
      // Actualizar estado local
      setLiked(!liked);
      setLikesCount(getLikesCount(job.id));
      
      // Actualizar el trabajo en el estado local
      const updatedJob = getJob(job.id);
      setJob(updatedJob);
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  // Manejar guardado del trabajo
  const handleSaveJob = async () => {
    if (!job) return;
    
    try {
      await toggleSaveJob(job.id);
      
      // Actualizar estado local
      setSaved(!saved);
      
      // Actualizar el trabajo en el estado local
      const updatedJob = getJob(job.id);
      setJob(updatedJob);
    } catch (error) {
      console.error('Error al guardar trabajo:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-wfc-purple rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Trabajo no encontrado</h1>
          <p className="mb-4">El trabajo que estás buscando no existe o ha sido eliminado.</p>
          <Button 
            onClick={() => navigate('/jobs')}
            className="bg-wfc-purple hover:bg-wfc-purple-medium"
          >
            Volver a trabajos
          </Button>
        </div>
      </div>
    );
  }

  // Verificar si el usuario actual es el propietario
  const isOwner = currentUser && currentUser.id === job.userId;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate('/jobs')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a trabajos
      </Button>

      {/* Sección principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <span>Publicado por {job.userName} • {formatDate(job.timestamp)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                      </DialogHeader>
                      <p>¿Estás seguro de que quieres eliminar este trabajo? Esta acción no se puede deshacer.</p>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleting(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteJob}
                        >
                          Eliminar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              
              {/* Botones de like y guardar */}
              {currentUser && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLikeJob}
                    className={liked ? "bg-red-50 text-red-500 border-red-200" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-red-500" : ""}`} />
                    <span>{likesCount}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveJob}
                    className={saved ? "bg-blue-50 text-blue-500 border-blue-200" : ""}
                  >
                    <BookmarkPlus className={`h-4 w-4 ${saved ? "fill-blue-500" : ""}`} />
                    {saved ? "Guardado" : "Guardar"}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="comments">
                Comentarios 
                <span className="ml-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2">
                  {job.comments.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Descripción</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Detalles del proyecto</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Presupuesto:</span>
                        <span className="font-semibold">${job.budget}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Categoría:</span>
                        <span>{job.category}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${job.status === 'open' ? 'bg-green-100 text-green-800' : 
                          job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}
                        >
                          {job.status === 'open' ? 'Abierto' : 
                          job.status === 'in-progress' ? 'En progreso' : 
                          'Completado'}
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Habilidades requeridas</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Cliente</h3>
                  <Link to={`/user/${job.userId}`}>
                    <Card className="hover:border-wfc-purple transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={job.userPhoto} alt={job.userName} />
                            <AvatarFallback>{job.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{job.userName}</h4>
                            <p className="text-sm text-gray-500">Ver perfil</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comments">
              <div className="space-y-4">
                {/* Formulario de comentario */}
                {currentUser && (
                  <div className="flex space-x-4">
                    <Avatar>
                      <AvatarImage src={currentUser.photoURL} alt={currentUser.name} />
                      <AvatarFallback className="bg-wfc-purple-medium text-white">
                        {currentUser.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Añade un comentario..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitComment}
                          disabled={!comment.trim() || isSubmitting}
                          className="bg-wfc-purple hover:bg-wfc-purple-medium"
                        >
                          {isSubmitting ? (
                            <>Enviando...</>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" /> Comentar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Lista de comentarios */}
                {job.comments.length > 0 ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {job.comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} jobId={job.id} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No hay comentarios aún.</p>
                    <p className="text-gray-500 text-sm">Sé el primero en comentar.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de edición */}
      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar propuesta</DialogTitle>
            </DialogHeader>
            <EditJobForm
              job={job}
              onSubmit={handleUpdateJob}
              onCancel={() => setIsEditing(false)}
              isSubmitting={false}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default JobDetail;
