import { Badge } from '@/components/ui/badge'
import { Shield, Users, GraduationCap } from 'lucide-react'

interface RoleBadgeProps {
  role: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function RoleBadge({
  role,
  size = 'md',
  showIcon = true,
}: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          variant: 'destructive' as const,
          icon: Shield,
          className: 'bg-red-500 text-white',
        }
      case 'manager':
        return {
          label: 'Manager',
          variant: 'default' as const,
          icon: Users,
          className: 'bg-blue-500 text-white',
        }
      case 'learner':
        return {
          label: 'Learner',
          variant: 'secondary' as const,
          icon: GraduationCap,
          className: 'bg-green-500 text-white',
        }
      default:
        return {
          label: 'Unknown',
          variant: 'outline' as const,
          icon: Shield,
          className: '',
        }
    }
  }

  const config = getRoleConfig(role)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1`}
    >
      {showIcon && (
        <Icon
          className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`}
        />
      )}
      {config.label}
    </Badge>
  )
}
