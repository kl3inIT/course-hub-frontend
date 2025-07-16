// Learning hooks
export { useVideoPlayer } from './useVideoPlayer'
export type {
  UseVideoPlayerProps,
  UseVideoPlayerReturn,
} from './useVideoPlayer'

export { useLessonProgress } from './useLessonProgress'
export type {
  UseLessonProgressProps,
  UseLessonProgressReturn,
} from './useLessonProgress'

export { useCourseData } from './useCourseData'
export type { UseCourseDataProps, UseCourseDataReturn } from './useCourseData'

export { useCourseMeta } from './use-course-meta'
export type { UseCourseMeta } from './use-course-meta'

// Auth hooks
export { useAuthGuard } from './use-auth-guard'

// Existing hooks
export { useAvailableCoupons } from './use-available-coupons'
export { useCoupon } from './use-coupon'
export { useDebounce } from './use-debounce'
export { useIsMobile } from './use-mobile'
export { useToast, toast } from './use-toast'
export { useTransactionCheck } from './useTransactionCheck'
