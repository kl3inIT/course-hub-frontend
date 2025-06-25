export const DEFAULT_EXPORT_OPTIONS = {
  category: { checked: true, rowCount: 10 },
  course: { checked: true, rowCount: 10 },
  student: { checked: true, rowCount: 10 },
  revenue: { checked: true, rowCount: 10 },
}

export const EXPORT_FORMATS = {
  EXCEL: 'excel' as const,
  CSV: 'csv' as const,
  PDF: 'pdf' as const,
}

export const TIME_RANGES = {
  '7d': 'for the last 7 days',
  '30d': 'for the last 30 days',
  '90d': 'for the last 90 days',
  '6m': 'for the last 6 months',
  '1y': 'for the last year',
} as const

export const EXPORT_SETTINGS = {
  MAX_EXPORT_SIZE: 1000,
  DEFAULT_TIME_RANGE: '6m',
  DEFAULT_FORMAT: 'excel' as const,
}

export const PDF_STYLES = {
  MAIN_TITLE_FONT_SIZE: 16,
  SUBTITLE_FONT_SIZE: 12,
  SECTION_TITLE_FONT_SIZE: 14,
  TABLE_FONT_SIZE: 8,
  FOOTER_FONT_SIZE: 10,
  CELL_PADDING: 3,
  PAGE_MARGIN: 20,
  NEW_PAGE_THRESHOLD: 250,
  HEADER_COLOR: [230, 243, 255] as [number, number, number],
  TEXT_COLOR: [0, 0, 0] as [number, number, number],
}

export const COLUMN_WIDTHS = {
  CATEGORY: {
    ID: 15,
    NAME: 35,
    DESCRIPTION: 45,
    COURSES: 20,
    STUDENTS: 20,
    REVENUE: 35,
    SHARE: 25,
  },
  COURSE: {
    ID: 15,
    NAME: 50,
    STUDENTS: 20,
    RATING: 18,
    REVENUE: 35,
    SHARE: 20,
    REVIEWS: 18,
    LEVEL: 18,
  },
  STUDENT: {
    ID: 15,
    NAME: 50,
    NEW_STUDENTS: 25,
    PREVIOUSLY: 25,
    GROWTH: 25,
    REVIEWS: 20,
    AVG_RATING: 25,
  },
  REVENUE: {
    ID: 15,
    NAME: 40,
    REVENUE: 30,
    PREVIOUSLY: 30,
    GROWTH: 20,
    ORDERS: 18,
    NEW_STUDENTS: 22,
    SHARE: 20,
  },
} 