export interface LessonProgressDTO {
  lessonId: number
  currentTime: number // in seconds
  watchedTime: number // in seconds
  isCompleted: number // 0 or 1
}

export interface UpdateLessonProgressRequestDTO {
  currentTime: string // in seconds, matches backend Long type
  watchedDelta: string // in seconds, matches backend Long type
}
