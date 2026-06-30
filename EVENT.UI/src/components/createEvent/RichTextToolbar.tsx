import React from 'react';
import { Box } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import LinkIcon from '@mui/icons-material/Link';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { EP } from './theme';

// Presentational toolbar matching the EventPro rich-text editor chrome.
// Formatting is decorative for now (no RTE dependency in the project).
const icons = [
  FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon, StrikethroughSIcon,
  FormatListBulletedIcon, FormatListNumberedIcon, FormatIndentDecreaseIcon,
  FormatIndentIncreaseIcon, LinkIcon, ImageOutlinedIcon, FormatClearIcon,
];

export const RichTextToolbar: React.FC = () => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap',
      px: 1.5, py: 1, borderBottom: `1px solid ${EP.line}`, bgcolor: '#FCFCFD',
    }}
  >
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, mr: 0.5,
        border: `1px solid ${EP.line}`, borderRadius: 1, fontSize: '0.8rem', color: EP.muted, cursor: 'default',
      }}
    >
      Normal <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
    </Box>
    {icons.map((Icon, i) => (
      <Box
        key={i}
        sx={{
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 1, color: EP.muted, cursor: 'default',
          '&:hover': { bgcolor: '#F3F4F6' },
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
    ))}
  </Box>
);

export default RichTextToolbar;
