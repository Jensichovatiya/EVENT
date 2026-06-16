import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { Button } from '../ui/button';
import { EP, WIZARD_STEPS } from './theme';

interface HeaderProps {
  isEdit: boolean;
  isLast: boolean;
  saving: boolean;
  onSaveDraft: () => void;
  onPrimary: () => void;
  onClose: () => void;
}

export const WizardHeader: React.FC<HeaderProps> = ({ isEdit, isLast, saving, onSaveDraft, onPrimary, onClose }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: EP.ink }}>
        {isEdit ? 'Edit Event' : 'Create New Event'}
      </Typography>
      <Typography sx={{ color: EP.muted, fontSize: '0.9rem', mt: 0.25 }}>
        Fill in the details step by step to create a successful event.
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Button variant="outline" onClick={onSaveDraft} disabled={saving}>Save as Draft</Button>
      <Button variant="default" onClick={onPrimary} disabled={saving} loading={saving}>
        {isLast ? 'Publish Event' : 'Save & Continue'}
      </Button>
      <IconButton onClick={onClose} sx={{ color: EP.faint }}>
        <CloseIcon />
      </IconButton>
    </Box>
  </Box>
);

interface StepperProps {
  activeStep: number;
  completed: Record<number, boolean>;
  onStepClick: (index: number) => void;
}

export const WizardStepper: React.FC<StepperProps> = ({ activeStep, completed, onStepClick }) => (
  <Box
    sx={{
      ...{ borderRadius: `${EP.radius}px`, border: `1px solid ${EP.line}`, background: EP.surface, boxShadow: EP.shadowCard },
      px: { xs: 2, md: 4 }, py: 3, mb: 3,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      overflowX: 'auto',
    }}
  >
    {WIZARD_STEPS.map((step, idx) => {
      const isActive = idx === activeStep;
      const isDone = !!completed[idx] && idx < activeStep;
      const reachable = idx <= activeStep || completed[idx];
      const circleBg = isActive ? EP.primary : isDone ? EP.primary : '#fff';
      const circleColor = isActive || isDone ? '#fff' : EP.faint;
      const circleBorder = isActive || isDone ? EP.primary : EP.line;
      return (
        <React.Fragment key={step.key}>
          <Box
            onClick={() => reachable && onStepClick(idx)}
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              minWidth: 90, cursor: reachable ? 'pointer' : 'default', flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 34, height: 34, borderRadius: '50%',
                bgcolor: circleBg, color: circleColor, border: `2px solid ${circleBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem', transition: 'all .2s',
              }}
            >
              {isDone ? <CheckIcon sx={{ fontSize: 18 }} /> : idx + 1}
            </Box>
            <Typography
              sx={{
                fontSize: '0.78rem', textAlign: 'center', whiteSpace: 'nowrap',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? EP.primary : EP.muted,
              }}
            >
              {step.label}
            </Typography>
          </Box>
          {idx < WIZARD_STEPS.length - 1 && (
            <Box sx={{ flex: 1, height: 2, bgcolor: idx < activeStep ? EP.primary : EP.line, mt: '17px', mx: 1, minWidth: 24 }} />
          )}
        </React.Fragment>
      );
    })}
  </Box>
);
