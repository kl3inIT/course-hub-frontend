'use client'

import { useCallback, useState } from 'react'

interface CompletionCertificateProps {
  courseTitle: string
  instructor: string
  completionDate: Date | undefined
  studentName: string
  certificateId?: string
  elementId?: string
  isPdfVersion?: boolean
}

export function CompletionCertificate({
  courseTitle,
  instructor,
  completionDate,
  studentName,
  certificateId,
  elementId = 'pdf-wrapper',
  isPdfVersion = false,
}: CompletionCertificateProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not available'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formattedDate = formatDate(completionDate)

  const [showShareMenu, setShowShareMenu] = useState(false)
  const shareUrl = `https://course.learnhub.academy/verify/${certificateId}`
  const shareText = encodeURIComponent(
    `I just completed the course: ${courseTitle} on LearnHub! Check out my certificate.`
  )

  const handleShareFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${shareText}`
    window.open(url, '_blank', 'width=600,height=600')
    setShowShareMenu(false)
  }, [shareUrl, shareText])

  const handleShareLinkedIn = useCallback(() => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=600')
    setShowShareMenu(false)
  }, [shareUrl])

  // Khi export PDF, render layout giống hệt web (có watermark, SVG, ...)
  return (
    <div className='flex flex-col items-center gap-6'>
      {/* Modern Certificate */}
      <div
        id={elementId}
        className='w-[1024px] h-[724px] font-serif bg-white text-gray-800 relative shadow-2xl overflow-hidden border border-gray-200'
        style={{ width: 1024, height: 724 }}
      >
        {/* Ribbon with circle and web name - improved style */}
        <div className='absolute top-0 right-8 h-full w-60 flex items-start justify-center pointer-events-none select-none'>
          {/* Ribbon */}
          <div className='relative w-full h-full'>
            <div className='absolute left-1/2 -translate-x-1/2 top-0 z-0'>
              <svg
                width='480'
                height='600'
                viewBox='0 0 176 450'
                className='block'
              >
                <defs>
                  <linearGradient
                    id='ribbonGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='0%' stopColor='#4ade80' />
                    <stop offset='100%' stopColor='#22c55e' />
                  </linearGradient>
                </defs>
                <polygon
                  points='0,0 176,0 176,340 88,400 0,340'
                  fill='url(#ribbonGradient)'
                  filter='drop-shadow(0 8px 24px rgba(34,197,94,0.2))'
                />
              </svg>
            </div>
            {/* Circle */}
            <div className='absolute left-1/2 -translate-x-1/2 top-10 z-10 flex flex-col items-center justify-center'>
              <div className='w-44 h-44 bg-white border-4 border-green-600 rounded-full flex flex-col items-center justify-center shadow-2xl relative'>
                <span className='absolute inset-0 flex items-center justify-center text-green-700 font-extrabold text-2xl text-center leading-tight drop-shadow-sm z-10'>
                  IT4Beginner
                </span>
                <svg
                  width='176'
                  height='176'
                  viewBox='0 0 176 176'
                  className='absolute left-0 top-0'
                >
                  <defs>
                    <circle
                      id='circlePath'
                      cx='88'
                      cy='88'
                      r='72'
                      fill='none'
                    />
                  </defs>
                  {/* Slogan nửa trên */}
                  <text
                    fill='#9ca3af'
                    fontSize='14'
                    fontWeight='500'
                    letterSpacing='2'
                  >
                    <textPath
                      href='#circlePath'
                      startOffset='10%'
                      textAnchor='middle'
                      dominantBaseline='middle'
                    >
                      EDUCATION & TRAINING
                    </textPath>
                  </text>
                  {/* Slogan nửa dưới */}
                  <text
                    fill='#9ca3af'
                    fontSize='14'
                    fontWeight='500'
                    letterSpacing='2'
                  >
                    <textPath
                      href='#circlePath'
                      startOffset='60%'
                      textAnchor='middle'
                      dominantBaseline='middle'
                    >
                      EDUCATION & TRAINING
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Watermark tạm thời tắt để test export PDF */}
        {false && !isPdfVersion && (
          <div
            className='absolute inset-0 bg-repeat bg-center opacity-[0.02]'
            style={{ backgroundImage: "url('/assets/watermark-logo.svg')" }}
          ></div>
        )}

        {/* Left Content Area */}
        <div className='absolute top-0 left-0 w-2/3 h-full p-16 flex flex-col'>
          <header className='mb-10'>
            <div className='text-green-700 font-bold text-2xl'>IT4Beginner</div>
            <p className='text-[10px] text-gray-500 tracking-[0.2em] ml-1'>
              EDUCATION &amp; TRAINING
            </p>
          </header>

          <main className='flex-grow pl-4'>
            <p className='text-sm text-gray-500 mb-8'>{formattedDate}</p>
            <h2 className='text-4xl font-mono font-medium text-gray-800 tracking-wide mb-6'>
              {studentName}
            </h2>
            <p className='text-sm text-gray-600 mb-2'>
              has successfully completed
            </p>
            <h1 className='text-3xl font-bold text-gray-900 mb-4'>
              {courseTitle}
            </h1>
            <p className='text-xs text-gray-500 max-w-md'>
              an online non-credit course authorized by {instructor} and offered
              through LearnHub.
            </p>
          </main>
        </div>

        {/* Right Ribbon Area tạm thời bỏ SVG để test export PDF */}
        {/* <div className='absolute top-0 right-8 h-4/5 w-48'>
          <div className='relative w-full h-full bg-slate-300'>
            ... SVG ...
          </div>
        </div> */}

        {/* Footer Elements */}
        <div className='absolute bottom-8 left-20'>
          <div className='text-left'>
            <div className="font-['Ms_Madi',_cursive] text-green-700 text-4xl -mb-1">
              IT4Beginner
            </div>
            <div className='border-t border-gray-300 pt-1'>
              <p className='text-[10px] text-gray-500 tracking-[0.2em] ml-1'>
                EDUCATION &amp; TRAINING
              </p>
            </div>
          </div>
        </div>
        <div className='absolute bottom-8 right-20 text-right'>
          <p className='text-[10px] text-gray-600'>
            Verify at course.learnhub.academy/verify/{certificateId}
          </p>
          <p className='text-[9px] text-gray-500 mt-1 max-w-[400px]'>
            LearnHub has confirmed the identity of this individual and their
            participation in the course.
          </p>
        </div>
      </div>
    </div>
  )
}
