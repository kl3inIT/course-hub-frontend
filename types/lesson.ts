// types/lesson.ts
export interface LessonRequestDTO {
    title: string;
    description: string;
    type: 'VIDEO' | 'DOCUMENT' | 'ASSIGNMENT';
    duration?: number;
    content?: string;
    orderNumber: number;
}

export interface LessonResponseDTO {
    id: string;
    title: string;
    description: string;
    type: 'VIDEO' | 'DOCUMENT' | 'ASSIGNMENT';
    duration?: number;
    content?: string;
    orderNumber: number;
    moduleId: string;
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