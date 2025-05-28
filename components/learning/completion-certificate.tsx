"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Calendar, User, BookOpen } from "lucide-react"

interface CompletionCertificateProps {
  courseTitle: string
  instructor: string
  completionDate: Date
  studentName: string
  certificateId?: string
}

export function CompletionCertificate({
  courseTitle,
  instructor,
  completionDate,
  studentName,
  certificateId,
}: CompletionCertificateProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 print:shadow-none print:border-gray-300">
      <CardContent className="p-12 print:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full">
              <Award className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Certificate of Completion</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto"></div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-8">
          <div>
            <p className="text-lg text-gray-600 mb-4">This is to certify that</p>
            <div className="bg-white p-4 rounded-lg border-2 border-blue-200 inline-block min-w-[300px]">
              <h2 className="text-3xl font-bold text-gray-800">{studentName}</h2>
            </div>
          </div>

          <div>
            <p className="text-lg text-gray-600 mb-4">has successfully completed the course</p>
            <div className="bg-white p-6 rounded-lg border-2 border-blue-200 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">{courseTitle}</h3>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Instructed by {instructor}</span>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Completion Date</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{formatDate(completionDate)}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Course Type</span>
              </div>
              <p className="text-lg font-bold text-gray-800">Online Course</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mt-12">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mb-2">
                <p className="font-bold text-gray-800">{instructor}</p>
              </div>
              <p className="text-sm text-gray-600">Course Instructor</p>
            </div>

            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mb-2">
                <p className="font-bold text-gray-800">LearnHub Academy</p>
              </div>
              <p className="text-sm text-gray-600">Learning Platform</p>
            </div>
          </div>

          {/* Certificate ID */}
          {certificateId && (
            <div className="mt-8">
              <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                Certificate ID: {certificateId}
              </Badge>
            </div>
          )}

          {/* Verification */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              This certificate can be verified at learnhub.academy/verify/{certificateId}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 opacity-10 print:hidden">
          <Award className="h-16 w-16 text-blue-500" />
        </div>
        <div className="absolute top-4 right-4 opacity-10 print:hidden">
          <Award className="h-16 w-16 text-indigo-500" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-10 print:hidden">
          <Award className="h-16 w-16 text-purple-500" />
        </div>
        <div className="absolute bottom-4 right-4 opacity-10 print:hidden">
          <Award className="h-16 w-16 text-blue-500" />
        </div>
      </CardContent>
    </Card>
  )
}
