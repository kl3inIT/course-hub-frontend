import { Button } from '@/components/ui/button'

export function Pagination({
  page,
  totalPages,
  size,
  onPageChange,
  onSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: {
  page: number
  totalPages: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        background: '#fff',
        width: '100%',
      }}
    >
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        Previous
      </Button>
      <span style={{ minWidth: 80, textAlign: 'center' }}>
        Page {page + 1} of {totalPages}
      </span>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
      >
        Next
      </Button>
      <select
        value={size}
        onChange={e => onSizeChange(Number(e.target.value))}
        style={{
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: '4px 8px',
        }}
      >
        {pageSizeOptions.map(opt => (
          <option key={opt} value={opt}>
            {opt} / page
          </option>
        ))}
      </select>
    </div>
  )
}
