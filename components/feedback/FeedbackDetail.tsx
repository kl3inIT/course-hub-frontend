import { Calendar, Mail, MessageSquare, Tag, User } from 'lucide-react'

export default function FeedbackDetail({ feedback }: { feedback: any }) {
  if (!feedback) return null

  return (
    <div className='space-y-6'>
      {/* Thông tin cơ bản */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <User className='h-4 w-4' />
          <span className='font-medium'>Người gửi:</span>
          <span>{feedback.fullName || feedback.userEntity?.name || 'N/A'}</span>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <Mail className='h-4 w-4' />
          <span className='font-medium'>Email:</span>
          <span>{feedback.email || feedback.userEntity?.email || 'N/A'}</span>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <Tag className='h-4 w-4' />
          <span className='font-medium'>Danh mục:</span>
          <span className='capitalize'>
            {feedback.category?.toLowerCase().replace('_', ' ') || 'N/A'}
          </span>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <Calendar className='h-4 w-4' />
          <span className='font-medium'>Ngày gửi:</span>
          <span>
            {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Tiêu đề */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>Tiêu đề</h3>
        <p className='text-gray-700 bg-gray-50 p-3 rounded-lg'>
          {feedback.subject}
        </p>
      </div>

      {/* Nội dung feedback */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2'>
          <MessageSquare className='h-5 w-5' />
          Nội dung bạn gửi
        </h3>
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <p className='text-gray-800 whitespace-pre-wrap'>
            {feedback.message}
          </p>
        </div>
      </div>

      {/* Phản hồi từ Admin */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2'>
          <MessageSquare className='h-5 w-5 text-green-600' />
          Phản hồi từ Admin
        </h3>
        <div
          className={`rounded-lg p-4 ${
            feedback.adminReply
              ? 'bg-green-50 border border-green-200'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          {feedback.adminReply ? (
            <p className='text-gray-800 whitespace-pre-wrap'>
              {feedback.adminReply}
            </p>
          ) : (
            <p className='text-gray-500 italic'>Chưa có phản hồi từ Admin</p>
          )}
        </div>
      </div>
    </div>
  )
}
