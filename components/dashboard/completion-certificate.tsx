'use client'


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
  elementId = "pdf-wrapper",
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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Modern Certificate */}
      <div
        id={elementId}
        className={`${isPdfVersion ? 'w-[1024px] h-[724px]' : 'w-[1024px] min-h-[724px]'} font-serif bg-white text-gray-800 relative shadow-2xl overflow-hidden border border-gray-200`}
      >
        {/* Watermark */}
        <div
          className="absolute inset-0 bg-repeat bg-center opacity-[0.02]"
          style={{ backgroundImage: "url('/assets/watermark-logo.svg')" }}
        ></div>

        {/* Left Content Area */}
        <div className="absolute top-0 left-0 w-2/3 h-full p-16 flex flex-col">
          <header className="mb-10">
            <div className="text-green-700 font-bold text-2xl">iT4Beginner</div>
            <p className="text-[10px] text-gray-500 tracking-[0.2em] ml-1">
              EDUCATION &amp; TRAINING
            </p>
          </header>

          <main className="flex-grow pl-4">
            <p className="text-sm text-gray-500 mb-8">{formattedDate}</p>
            <h2 className="text-4xl font-mono font-medium text-gray-800 tracking-wide mb-6">
              {studentName}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              has successfully completed
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {courseTitle}
            </h1>
            <p className="text-xs text-gray-500 max-w-md">
              an online non-credit course authorized by {instructor} and offered
              through LearnHub.
            </p>
          </main>
        </div>

        {/* Right Ribbon Area */}
        <div className="absolute top-0 right-8 h-4/5 w-48">
          <div className="relative w-full h-full bg-slate-300">
            {/* The pointed tip using an SVG shape for PDF compatibility */}
            <div className="absolute -bottom-12 left-0 w-full h-12">
              <svg viewBox="0 0 192 48" preserveAspectRatio="none" className="w-full h-full">
                <path d="M 0,0 L 96,48 L 192,0 Z" fill="#cbd5e1" />
              </svg>
            </div>

            {/* Ribbon Content */}
            <div className="text-center pt-20 relative z-10">
              <p className="font-semibold tracking-[0.3em] text-gray-700">
                COURSE
              </p>
              <p className="font-semibold tracking-[0.3em] text-gray-700 mb-12">
                CERTIFICATE
              </p>
              {/* Seal */}
              <div className="w-36 h-36 rounded-full mx-auto flex items-center justify-center relative p-2 bg-gray-100 border-4 border-gray-300">
                <div className="text-xl font-bold text-gray-700">LearnHub</div>
                <svg
                  className="absolute top-0 left-0 w-full h-full"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <path
                      id="circlePath"
                      d="M 50, 50 m -40, 0 a 40, 40 0 1, 1 80, 0 a 40, 40 0 1, 1 -80, 0"
                    ></path>
                  </defs>
                  <text
                    fill="#6b7280"
                    style={{ fontSize: '8px', letterSpacing: '0.1em' }}
                  >
                    <textPath href="#circlePath">
                      EDUCATION FOR EVERYONE • COURSE CERTIFICATE •
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Elements */}
        <div className="absolute bottom-8 left-20">
          <div className="text-left">
            <div className="font-['Ms_Madi',_cursive] text-green-700 text-4xl -mb-1">
              iT4Begginer
            </div>
            <div className="border-t border-gray-300 pt-1">
              <p className="text-[10px] text-gray-500 tracking-[0.2em] ml-1">
                EDUCATION &amp; TRAINING
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 right-20 text-right">
          <p className="text-[10px] text-gray-600">
            Verify at course.learnhub.academy/verify/{certificateId}
          </p>
          <p className="text-[9px] text-gray-500 mt-1 max-w-[400px]">
            LearnHub has confirmed the identity of this individual and their
            participation in the course.
          </p>
        </div>
      </div>
    </div>
  )
}