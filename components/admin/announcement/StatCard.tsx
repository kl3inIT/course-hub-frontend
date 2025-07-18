import { ReactNode } from 'react'

export function StatCard({
  title,
  value,
  icon,
  iconColor = 'text-gray-400',
  valueColor = 'text-black',
}: {
  title: string
  value: number | string
  icon: ReactNode
  iconColor?: string
  valueColor?: string
}) {
  return (
    <div className='flex flex-col justify-between rounded-xl border bg-white px-6 py-4 shadow-sm min-w-[200px] h-[110px]'>
      <div className='flex items-center justify-between'>
        <span className='font-medium text-gray-600'>{title}</span>
        <span className={iconColor + ' text-2xl'}>{icon}</span>
      </div>
      <div className={`mt-2 text-3xl font-bold ${valueColor}`}>{value}</div>
    </div>
  )
}
