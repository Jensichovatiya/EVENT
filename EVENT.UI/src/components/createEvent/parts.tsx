import React from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { EP, cardSx, sectionTitleSx, fieldLabelSx, helperSx } from './theme';

// A labelled field wrapper that renders the small bold label + optional helper.
export const Field: React.FC<{
  label?: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
  sx?: any;
}> = ({ label, required, helper, children, sx }) => (
  <Box sx={sx}>
    {label && (
      <Typography component="label" sx={fieldLabelSx}>
        {label}
        {required && <Box component="span" sx={{ color: EP.red, ml: 0.4 }}>*</Box>}
      </Typography>
    )}
    {children}
    {helper && <Typography sx={helperSx}>{helper}</Typography>}
  </Box>
);

// A step section header: purple title + subtitle.
export const StepHeading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <Box sx={{ mb: 3 }}>
    <Typography sx={sectionTitleSx}>{title}</Typography>
    {subtitle && (
      <Typography sx={{ color: EP.muted, fontSize: '0.85rem', mt: 0.5 }}>{subtitle}</Typography>
    )}
  </Box>
);

// Right-rail card used for summaries / steps overview.
export const SidebarCard: React.FC<{
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: any;
}> = ({ title, action, children, sx }) => (
  <Box sx={{ ...cardSx, p: 2.5, ...sx }}>
    {(title || action) && (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {title && <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem' }}>{title}</Typography>}
        {action}
      </Box>
    )}
    {children}
  </Box>
);

// Tips card with bulleted hints (matches the EventPro "Tips" panel).
export const TipsCard: React.FC<{ tips: string[] }> = ({ tips }) => (
  <Box sx={{ ...cardSx, p: 2.5, background: '#FBFAFF', borderColor: EP.primarySoft }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <LightbulbOutlinedIcon sx={{ color: EP.primary, fontSize: 20 }} />
      <Typography sx={{ fontWeight: 700, color: EP.text, fontSize: '0.9rem' }}>Tips</Typography>
    </Box>
    <Box component="ul" sx={{ m: 0, pl: 2.2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {tips.map((t, i) => (
        <Typography key={i} component="li" sx={{ color: EP.muted, fontSize: '0.8rem', lineHeight: 1.5 }}>
          {t}
        </Typography>
      ))}
    </Box>
  </Box>
);

// A labelled toggle row (switch + title/subtitle).
export const ToggleRow: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  subtitle?: string;
}> = ({ checked, onChange, title, subtitle }) => (
  <FormControlLabel
    sx={{ alignItems: 'flex-start', ml: 0 }}
    control={
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{ mr: 1, '& .MuiSwitch-switchBase.Mui-checked': { color: EP.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: EP.primary } }}
      />
    }
    label={
      <Box sx={{ mt: 0.6 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: EP.text }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: '0.72rem', color: EP.faint }}>{subtitle}</Typography>}
      </Box>
    }
  />
);

// Summary line: icon + label + value (used in right rail).
export const SummaryLine: React.FC<{ icon: React.ReactNode; label: string; value?: React.ReactNode }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', gap: 1.5, py: 1 }}>
    <Box sx={{ color: EP.faint, mt: 0.2, display: 'flex' }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.72rem', color: EP.faint }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.85rem', color: EP.text, fontWeight: 600, wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
    </Box>
  </Box>
);

// Two-column step body: main content + sticky right rail.
export const StepLayout: React.FC<{ main: React.ReactNode; rail: React.ReactNode }> = ({ main, rail }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 340px' }, gap: 3, alignItems: 'start' }}>
    <Box sx={{ ...cardSx, p: { xs: 2.5, md: 3.5 } }}>{main}</Box>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: { lg: 'sticky' }, top: 16 }}>
      {rail}
    </Box>
  </Box>
);

// Grid helper for responsive form rows.
export const Grid: React.FC<{ cols?: number; children: React.ReactNode; sx?: any }> = ({ cols = 2, children, sx }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: `repeat(${cols}, 1fr)` },
      gap: 2.5,
      ...sx,
    }}
  >
    {children}
  </Box>
);
