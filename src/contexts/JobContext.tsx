
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Tipo para respuestas a comentarios
export type ReplyType = {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userPhoto: string;
  timestamp: number;
};

// Tipo para comentarios
export type CommentType = {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userPhoto: string;
  timestamp: number;
  replies: ReplyType[];
};

// Tipo para trabajos
export type JobType = {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  userId: string;
  userName: string;
  userPhoto?: string;
  status: 'open' | 'in-progress' | 'completed';
  timestamp: number;
  comments: CommentType[];
  likedBy: string[]; // Array de IDs de usuarios que dieron like
  likesCount: number; // Contador de likes
  savedBy: string[]; // Array de IDs de usuarios que guardaron el trabajo
};

// Interfaz para el contexto de trabajos
interface JobContextType {
  jobs: JobType[];
  savedJobs: JobType[];
  isLoading: boolean;
  error: string | null;
  addJob: (newJob: Omit<JobType, 'id' | 'timestamp' | 'comments' | 'likedBy' | 'savedBy' | 'likesCount'>) => Promise<string>;
  getJob: (jobId: string) => JobType | undefined;
  updateJob: (jobId: string, updates: Partial<JobType>) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
  addCommentToJob: (jobId: string, content: string, user: any) => Promise<void>;
  addReplyToComment: (jobId: string, commentId: string, content: string, user: any) => Promise<void>;
  toggleJobLike: (jobId: string) => Promise<void>;
  toggleSaveJob: (jobId: string) => Promise<void>;
  isJobLikedByCurrentUser: (jobId: string) => boolean;
  isJobSavedByCurrentUser: (jobId: string) => boolean;
  getLikesCount: (jobId: string) => number;
}

// Crear el contexto
const JobContext = createContext<JobContextType | undefined>(undefined);

// Hook personalizado para utilizar el contexto
export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs debe ser utilizado dentro de un JobProvider');
  }
  return context;
};

// Proveedor del contexto
export const JobProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar trabajos
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Intentar cargar desde la API
      const response = await fetch('http://localhost:5000/api/jobs', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.jobs) {
          const formattedJobs = data.jobs.map((job: any) => ({
            ...job,
            comments: job.comments || [],
            likedBy: job.likedBy?.map((user: any) => user.id) || [],
            savedBy: job.savedBy?.map((user: any) => user.id) || [],
            likesCount: job.likedBy?.length || 0,
          }));
          setJobs(formattedJobs);
          console.log('Trabajos cargados desde la API:', formattedJobs.length);
        }
      } else {
        throw new Error('Error al cargar trabajos desde la API');
      }
    } catch (error) {
      console.error('Error al obtener trabajos desde la API:', error);
      
      // Si falla, cargar desde localStorage
      try {
        const storedJobs = localStorage.getItem('wfc_jobs');
        if (storedJobs) {
          setJobs(JSON.parse(storedJobs));
        } else {
          // Si no hay datos en localStorage, cargar datos ficticios
          const mockJobs = getMockJobs();
          setJobs(mockJobs);
          localStorage.setItem('wfc_jobs', JSON.stringify(mockJobs));
          console.log('Trabajos mock cargados');
        }
      } catch (error) {
        console.error('Error al cargar trabajos desde localStorage:', error);
        setError('No se pudieron cargar los trabajos');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para actualizar los trabajos guardados
  const updateSavedJobs = useCallback(() => {
    if (currentUser) {
      const userSavedJobs = jobs.filter(job => 
        job.savedBy.includes(currentUser.id)
      );
      setSavedJobs(userSavedJobs);
    } else {
      setSavedJobs([]);
    }
  }, [jobs, currentUser]);

  // Cargar trabajos al iniciar
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Actualizar trabajos guardados cuando cambien los trabajos o el usuario
  useEffect(() => {
    updateSavedJobs();
  }, [jobs, currentUser, updateSavedJobs]);

  // Guardar trabajos en localStorage cuando cambien
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem('wfc_jobs', JSON.stringify(jobs));
    }
  }, [jobs]);

  // Función para refrescar los trabajos
  const refreshJobs = async () => {
    await fetchJobs();
  };

  // Función para obtener un trabajo por ID
  const getJob = (jobId: string): JobType | undefined => {
    return jobs.find(job => job.id === jobId);
  };

  // Función para agregar un nuevo trabajo
  const addJob = async (newJob: Omit<JobType, 'id' | 'timestamp' | 'comments' | 'likedBy' | 'savedBy' | 'likesCount'>): Promise<string> => {
    try {
      // Generar ID único
      const jobId = Date.now().toString();
      
      // Crear objeto del trabajo
      const job: JobType = {
        ...newJob,
        id: jobId,
        timestamp: Date.now(),
        comments: [],
        likedBy: [],
        savedBy: [],
        likesCount: 0
      };
      
      // Actualizar estado
      setJobs(prevJobs => [job, ...prevJobs]);
      
      toast({
        title: "Trabajo creado",
        description: "El trabajo se ha creado correctamente"
      });
      
      return jobId;
    } catch (error) {
      console.error('Error al crear trabajo:', error);
      setError('No se pudo crear el trabajo');
      throw error;
    }
  };

  // Función para actualizar un trabajo
  const updateJob = async (jobId: string, updates: Partial<JobType>): Promise<void> => {
    try {
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, ...updates } : job
        )
      );
      
      toast({
        title: "Trabajo actualizado",
        description: "El trabajo se ha actualizado correctamente"
      });
    } catch (error) {
      console.error('Error al actualizar trabajo:', error);
      setError('No se pudo actualizar el trabajo');
      throw error;
    }
  };

  // Función para eliminar un trabajo
  const deleteJob = async (jobId: string): Promise<void> => {
    try {
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      toast({
        title: "Trabajo eliminado",
        description: "El trabajo se ha eliminado correctamente"
      });
    } catch (error) {
      console.error('Error al eliminar trabajo:', error);
      setError('No se pudo eliminar el trabajo');
      throw error;
    }
  };

  // Función para agregar un comentario a un trabajo
  const addCommentToJob = async (jobId: string, content: string, user: any): Promise<void> => {
    try {
      const commentId = Date.now().toString();
      
      const newComment: CommentType = {
        id: commentId,
        content,
        userId: user.id,
        userName: user.name,
        userPhoto: user.photoURL || '',
        timestamp: Date.now(),
        replies: []
      };
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, comments: [newComment, ...job.comments] } 
            : job
        )
      );
      
      toast({
        title: "Comentario añadido",
        description: "Tu comentario ha sido publicado"
      });
    } catch (error) {
      console.error('Error al añadir comentario:', error);
      setError('No se pudo añadir el comentario');
      throw error;
    }
  };

  // Función para agregar una respuesta a un comentario
  const addReplyToComment = async (jobId: string, commentId: string, content: string, user: any): Promise<void> => {
    try {
      const replyId = Date.now().toString();
      
      const newReply: ReplyType = {
        id: replyId,
        content,
        userId: user.id,
        userName: user.name,
        userPhoto: user.photoURL || '',
        timestamp: Date.now()
      };
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? {
                ...job,
                comments: job.comments.map(comment => 
                  comment.id === commentId
                    ? { ...comment, replies: [...comment.replies, newReply] }
                    : comment
                )
              } 
            : job
        )
      );
      
      toast({
        title: "Respuesta añadida",
        description: "Tu respuesta ha sido publicada"
      });
    } catch (error) {
      console.error('Error al añadir respuesta:', error);
      setError('No se pudo añadir la respuesta');
      throw error;
    }
  };

  // Función para dar/quitar like a un trabajo
  const toggleJobLike = async (jobId: string): Promise<void> => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para dar like"
      });
      return;
    }
    
    try {
      setJobs(prevJobs => 
        prevJobs.map(job => {
          if (job.id === jobId) {
            const userLiked = job.likedBy.includes(currentUser.id);
            
            if (userLiked) {
              // Quitar like
              return {
                ...job,
                likedBy: job.likedBy.filter(id => id !== currentUser.id),
                likesCount: Math.max(0, job.likesCount - 1)
              };
            } else {
              // Añadir like
              return {
                ...job,
                likedBy: [...job.likedBy, currentUser.id],
                likesCount: job.likesCount + 1
              };
            }
          }
          return job;
        })
      );
      
      toast({
        title: isJobLikedByCurrentUser(jobId) ? "Like eliminado" : "Like añadido",
        description: isJobLikedByCurrentUser(jobId) 
          ? "Has quitado tu like de esta propuesta"
          : "Has dado like a esta propuesta"
      });
    } catch (error) {
      console.error('Error al gestionar like:', error);
      setError('No se pudo procesar la acción');
      throw error;
    }
  };

  // Función para guardar/quitar de guardados un trabajo
  const toggleSaveJob = async (jobId: string): Promise<void> => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para guardar propuestas"
      });
      return;
    }
    
    try {
      setJobs(prevJobs => 
        prevJobs.map(job => {
          if (job.id === jobId) {
            const isSaved = job.savedBy.includes(currentUser.id);
            
            if (isSaved) {
              // Quitar de guardados
              return {
                ...job,
                savedBy: job.savedBy.filter(id => id !== currentUser.id)
              };
            } else {
              // Añadir a guardados
              return {
                ...job,
                savedBy: [...job.savedBy, currentUser.id]
              };
            }
          }
          return job;
        })
      );
      
      // Actualizar la lista de trabajos guardados
      updateSavedJobs();
      
      toast({
        title: isJobSavedByCurrentUser(jobId) ? "Propuesta eliminada" : "Propuesta guardada",
        description: isJobSavedByCurrentUser(jobId) 
          ? "Has eliminado esta propuesta de tus guardados"
          : "Has guardado esta propuesta"
      });
    } catch (error) {
      console.error('Error al guardar/quitar trabajo:', error);
      setError('No se pudo procesar la acción');
      throw error;
    }
  };

  // Verificar si un trabajo está guardado por el usuario actual
  const isJobSavedByCurrentUser = (jobId: string): boolean => {
    if (!currentUser) return false;
    
    const job = jobs.find(job => job.id === jobId);
    return job ? job.savedBy.includes(currentUser.id) : false;
  };

  // Verificar si un trabajo tiene like del usuario actual
  const isJobLikedByCurrentUser = (jobId: string): boolean => {
    if (!currentUser) return false;
    
    const job = jobs.find(job => job.id === jobId);
    return job ? job.likedBy.includes(currentUser.id) : false;
  };

  // Obtener el número de likes de un trabajo
  const getLikesCount = (jobId: string): number => {
    const job = jobs.find(job => job.id === jobId);
    return job ? job.likesCount : 0;
  };

  // Datos de ejemplo
  const getMockJobs = (): JobType[] => {
    return [
      {
        id: '1',
        title: 'Desarrollo de aplicación web con React',
        description: 'Necesito un desarrollador para crear una aplicación web completa utilizando React, Node.js y MongoDB. La aplicación debe tener funcionalidades de autenticación, gestión de usuarios y un panel de administración.',
        budget: 2500,
        category: 'Desarrollo Web',
        skills: ['React', 'Node.js', 'MongoDB', 'Express'],
        userId: 'user1',
        userName: 'Carlos Martínez',
        userPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
        status: 'open',
        timestamp: Date.now() - 86400000 * 2, // 2 días atrás
        comments: [
          {
            id: 'c1',
            content: 'Me interesa este proyecto. Tengo experiencia en proyectos similares.',
            userId: 'user2',
            userName: 'Laura Gómez',
            userPhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
            timestamp: Date.now() - 43200000, // 12 horas atrás
            replies: [
              {
                id: 'r1',
                content: 'Gracias por tu interés, por favor envíame un mensaje para discutir los detalles.',
                userId: 'user1',
                userName: 'Carlos Martínez',
                userPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
                timestamp: Date.now() - 36000000, // 10 horas atrás
              }
            ]
          }
        ],
        likedBy: [],
        savedBy: [],
        likesCount: 0
      },
      {
        id: '2',
        title: 'Diseño de logotipo para startup de tecnología',
        description: 'Somos una startup en el sector de la tecnología y necesitamos un logotipo moderno y profesional que refleje nuestra identidad de marca. Queremos algo minimalista pero impactante.',
        budget: 500,
        category: 'Diseño Gráfico',
        skills: ['Illustrator', 'Photoshop', 'Diseño de Logos', 'Branding'],
        userId: 'user3',
        userName: 'Ana Rodríguez',
        userPhoto: 'https://randomuser.me/api/portraits/women/3.jpg',
        status: 'open',
        timestamp: Date.now() - 86400000, // 1 día atrás
        comments: [],
        likedBy: [],
        savedBy: [],
        likesCount: 0
      },
      {
        id: '3',
        title: 'Traducción de documentos técnicos inglés-español',
        description: 'Necesito traducir manuales técnicos de ingeniería del inglés al español. Son aproximadamente 200 páginas con terminología especializada.',
        budget: 800,
        category: 'Traducción',
        skills: ['Inglés', 'Español', 'Traducción Técnica'],
        userId: 'user4',
        userName: 'Roberto Sánchez',
        userPhoto: 'https://randomuser.me/api/portraits/men/4.jpg',
        status: 'in-progress',
        timestamp: Date.now() - 86400000 * 5, // 5 días atrás
        comments: [],
        likedBy: [],
        savedBy: [],
        likesCount: 0
      },
      {
        id: '4',
        title: 'Desarrollo de aplicación móvil para Android e iOS',
        description: 'Buscamos un desarrollador con experiencia en React Native para crear una aplicación móvil que funcione tanto en Android como en iOS. La aplicación debe tener funcionalidades de geolocalización y notificaciones push.',
        budget: 3000,
        category: 'Desarrollo Móvil',
        skills: ['React Native', 'Android', 'iOS', 'Firebase'],
        userId: 'user5',
        userName: 'Elena Torres',
        userPhoto: 'https://randomuser.me/api/portraits/women/5.jpg',
        status: 'open',
        timestamp: Date.now() - 86400000 * 3, // 3 días atrás
        comments: [],
        likedBy: [],
        savedBy: [],
        likesCount: 0
      },
      {
        id: '5',
        title: 'Edición y postproducción de video corporativo',
        description: 'Tenemos material grabado para un video corporativo de 5 minutos y necesitamos un profesional para la edición y postproducción. Se requiere experiencia en After Effects para animaciones y efectos.',
        budget: 1200,
        category: 'Video y Animación',
        skills: ['Premiere Pro', 'After Effects', 'Edición de Video', 'Postproducción'],
        userId: 'user1',
        userName: 'Carlos Martínez',
        userPhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
        status: 'completed',
        timestamp: Date.now() - 86400000 * 10, // 10 días atrás
        comments: [],
        likedBy: [],
        savedBy: [],
        likesCount: 0
      }
    ];
  };

  // Valor del contexto
  const value = {
    jobs,
    savedJobs,
    isLoading,
    error,
    addJob,
    getJob,
    updateJob,
    deleteJob,
    refreshJobs,
    addCommentToJob,
    addReplyToComment,
    toggleJobLike,
    toggleSaveJob,
    isJobLikedByCurrentUser,
    isJobSavedByCurrentUser,
    getLikesCount
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
