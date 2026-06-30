import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/Ui/table';
import { Input } from '@/Ui/input';
import { Button } from '@/Ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import NoDataFound from './NoDataFound.tsx';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
}

interface AppTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
}

export function AppTable<T>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchKey,
}: AppTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const filteredData = React.useMemo(() => {
    if (!searchQuery || !searchKey) return data;
    return data.filter((row) => {
      const val = row[searchKey];
      if (typeof val === 'string') {
        return val.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (typeof val === 'number') {
        return val.toString().includes(searchQuery);
      }
      return false;
    });
  }, [data, searchQuery, searchKey]);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = React.useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="flex flex-col gap-4">
      {searchKey && (
        <div className="flex justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 h-9"
            />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index} className={`font-semibold text-muted-foreground h-11 px-6 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/30">
                  {columns.map((col, colIndex) => {
                    const value = typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode);
                    return (
                      <TableCell key={colIndex} className={`px-6 py-3.5 text-foreground ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}>
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <NoDataFound message="No records found" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {filteredData.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="h-8 rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleChangePage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppTable;
