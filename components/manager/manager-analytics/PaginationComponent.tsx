interface PaginationComponentProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (pageNum: number) => void
  dataLength: number
}

export function PaginationComponent({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  dataLength,
}: PaginationComponentProps) {
  // Ensure we have valid numbers
  const safeCurrentPage = currentPage || 0
  const safeTotalPages = totalPages || 1
  const safeTotalItems = totalItems || 0
  const safeItemsPerPage = itemsPerPage || 5
  const safeDataLength = dataLength || 0

  const startItem =
    safeTotalItems === 0
      ? 0
      : safeItemsPerPage === -1
        ? 1
        : safeCurrentPage * safeItemsPerPage + 1
  const endItem =
    safeItemsPerPage === -1
      ? safeTotalItems
      : Math.min((safeCurrentPage + 1) * safeItemsPerPage, safeTotalItems)

  return (
    <div className='mt-4 space-y-2'>
      {/* Item Count Info - Always visible */}
      <div className='text-sm text-gray-600 text-center'>
        {safeTotalItems === 0
          ? '  '
          : `Showing ${startItem} to ${endItem} of ${safeTotalItems} items`}
      </div>

      {/* Pagination Controls - Only visible if more than 1 page */}
      {safeTotalPages > 1 && safeDataLength > 0 && (
        <div className='flex items-center gap-2 justify-center'>
          <button
            className='px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm bg-white text-gray-700 hover:bg-gray-50'
            disabled={safeCurrentPage === 0}
            onClick={() => onPageChange(safeCurrentPage - 1)}
          >
            Previous
          </button>
          {Array.from({ length: safeTotalPages }, (_, idx) => (
            <button
              key={idx}
              className={`px-3 py-2 border rounded text-sm ${
                safeCurrentPage === idx
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onPageChange(idx)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className='px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm bg-white text-gray-700 hover:bg-gray-50'
            disabled={safeCurrentPage === safeTotalPages - 1}
            onClick={() => onPageChange(safeCurrentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
