import { Button } from '@/components/ui/button'
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Announcement } from '@/types/announcement'
import { NotificationDTO } from '@/types/notification'
import { X } from 'lucide-react'
import Link from 'next/link'

interface NotificationDropdownProps {
  items: any[]
  loading: boolean
  onMarkAllAsRead: () => void
  onDeleteAll: () => void
  onMarkAsRead: (item: any) => void
  onDelete: (item: any) => void
}

export function notificationDropdown({
  items,
  loading,
  onMarkAllAsRead,
  onDeleteAll,
  onMarkAsRead,
  onDelete,
}: NotificationDropdownProps) {
  function isNotification(item: any): item is NotificationDTO {
    return 'message' in item
  }
  function isAnnouncement(item: any): item is Announcement {
    return 'title' in item && 'content' in item
  }
  const allRead = items.length > 0 && items.every(i => i.isRead === 1)
  const unreadCount = items.filter(i => i.isRead !== 1).length

  return (
    <DropdownMenuContent className='w-80' align='end' forceMount>
      <div className='flex items-center justify-between p-2 border-b'>
        <h4 className='font-medium'>Notifications</h4>
        <div className='flex gap-2'>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-7 text-xs'
              onClick={onMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
          {allRead && (
            <Button
              variant='ghost'
              size='sm'
              className='h-7 text-xs text-destructive'
              onClick={onDeleteAll}
            >
              Delete all
            </Button>
          )}
        </div>
      </div>
      <div className='max-h-[300px] overflow-y-auto'>
        {loading ? (
          <div className='p-4 text-center text-sm text-muted-foreground'>
            Loading notifications...
          </div>
        ) : items.length === 0 ? (
          <div className='p-4 text-center text-sm text-muted-foreground'>
            No notifications
          </div>
        ) : (
          items.map(item => (
            <DropdownMenuItem
              key={item.type + '-' + item.id}
              className={`flex flex-col items-start p-3 gap-1 cursor-pointer hover:bg-muted ${item.isRead !== 1 ? 'bg-slate-200' : ''}`}
              onClick={() => onMarkAsRead(item)}
            >
              <div className='flex items-center justify-between w-full'>
                <div className='flex-1 min-w-0'>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mr-2 ${item.type === 'announcement' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
                  >
                    {item.type === 'announcement'
                      ? 'Announcement'
                      : 'Notification'}
                  </span>
                  {item.link ? (
                    <Link
                      href={item.link}
                      className='text-sm text-blue-600 hover:underline'
                    >
                      {isNotification(item)
                        ? item.message
                        : isAnnouncement(item)
                          ? item.title
                          : ''}
                    </Link>
                  ) : (
                    <p className='text-sm'>
                      {isNotification(item)
                        ? item.message
                        : isAnnouncement(item)
                          ? item.title
                          : ''}
                    </p>
                  )}
                  {isAnnouncement(item) && (
                    <div className='text-xs text-muted-foreground mt-1'>
                      {item.content}
                    </div>
                  )}
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='ml-2 h-5 w-5 text-destructive'
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(item)
                  }}
                  title={
                    item.type === 'announcement'
                      ? 'Delete announcement'
                      : 'Delete notification'
                  }
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
              <span className='text-xs text-muted-foreground'>
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </div>
    </DropdownMenuContent>
  )
}
