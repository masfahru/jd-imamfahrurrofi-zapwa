import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemPerPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function DataTablePagination({
                                      currentPage,
                                      totalPages,
                                      totalCount,
                                      itemPerPage,
                                      onPageChange,
                                      onPerPageChange,
                                    }: DataTablePaginationProps) {
  const startItem = totalCount > 0 ? (currentPage - 1) * itemPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemPerPage, totalCount);

  return (
    <div className="flex items-center justify-between px-2 pt-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalCount} row(s).
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${itemPerPage}`}
            onValueChange={(value) => {
              onPerPageChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemPerPage}/>
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
