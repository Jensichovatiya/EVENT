import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

interface AppUploadProps {
  label?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
}

export const AppUpload: React.FC<AppUploadProps> = ({
  label = 'Drag and drop files here, or click to browse',
  multiple = false,
  onChange
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newFiles = multiple ? [...selectedFiles, ...filesArray] : [filesArray[0]];
      setSelectedFiles(newFiles);
      onChange(newFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onChange(newFiles);
  };

  return (
    <Box>
      <Box
        sx={{
          border: '2px dashed #d1d5db',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#3b82f6',
            backgroundColor: '#f3f4f6'
          }
        }}
        component="label"
      >
        <input
          type="file"
          hidden
          multiple={multiple}
          onChange={handleFileChange}
        />
        <CloudUploadIcon style={{ fontSize: 48, color: '#9ca3af', marginBottom: 8 }} />
        <Typography variant="body2" color="textSecondary" style={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Button variant="outlined" size="small" style={{ marginTop: 12, textTransform: 'none' }}>
          Select File
        </Button>
      </Box>

      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {selectedFiles.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                mb: 1,
                border: '1px solid #e5e7eb',
                borderRadius: 1,
                backgroundColor: '#ffffff',
              }}
            >
              <Typography variant="caption" noWrap style={{ maxWidth: '80%' }}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Typography>
              <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                <DeleteIcon fontSize="small" style={{ color: '#ef4444' }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
export default AppUpload;
