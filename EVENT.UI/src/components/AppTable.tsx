import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, InputAdornment, Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = React.useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  return (
    <Box>
      {searchKey && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                style: { borderRadius: 8, maxWidth: 300 }
              }
            }}
          />
        </Box>
      )}

      <TableContainer component={Paper} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Table>
          <TableHead style={{ backgroundColor: '#f9fafb' }}>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell key={index} align={col.align || 'left'} style={{ fontWeight: 600, color: '#4b5563' }}>
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex} hover>
                  {columns.map((col, colIndex) => {
                    const value = typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode);
                    return (
                      <TableCell key={colIndex} align={col.align || 'left'} style={{ color: '#1f2937' }}>
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <NoDataFound message="No records found" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}
export default AppTable;
