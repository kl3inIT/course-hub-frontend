// types/lesson.ts
export interface LessonRequestDTO {
    title: string;
    description?: string;
    duration?: number;
    orderNumber?: number;
    isPreview?: boolean;
  }
  
  export interface LessonResponseDTO {
    id: number;
    title: string;
    description?: string;
    videoUrl?: string;
    duration?: number;
    orderNumber: number;
    isPreview: boolean;
    isActive: boolean;
    moduleId: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface LessonUploadRequestDTO {
    title: string;
    fileName: string;
    fileType: string;
  }
  
  export interface LessonUploadResponseDTO {
    lessonId: number;
    preSignedPutUrl: string;
    s3Key: string;
  }
  
  export interface LessonConfirmRequestDTO {
    description?: string;
    duration?: number;
    orderNumber?: number;
    isPreview?: boolean;
  }