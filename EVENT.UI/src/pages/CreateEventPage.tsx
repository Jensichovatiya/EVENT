import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { toast } from 'sonner';
import { Button } from '@/Ui/button';

import DashboardLayout from '../layouts/DashboardLayout';
import AppLoader from '../components/AppLoader';
import { eventApi } from '../api/eventApi';
import { commonApi } from '../api/commonApi';
import { componentApi } from '../api/componentApi';
import { ROUTES } from '../constants/appConstants';

import { EP, WIZARD_STEPS } from '../components/createEvent/theme';
import { WizardHeader, WizardStepper } from '../components/createEvent/WizardChrome';
import { EventDraft, createEmptyDraft } from '../components/createEvent/types';
import { DDL } from '../components/createEvent/stepProps';
import { draftToEventRequest, eventToDraft } from '../components/createEvent/mappers';

import Step1BasicInfo from '../components/createEvent/Step1BasicInfo';
import Step2DateTime from '../components/createEvent/Step2DateTime';
import Step3Venue from '../components/createEvent/Step3Venue';
import Step4FloorPlan from '../components/createEvent/Step4FloorPlan';
import Step5Organizers from '../components/createEvent/Step5Organizers';
import Step6Tickets from '../components/createEvent/Step6Tickets';
import Step7Media from '../components/createEvent/Step7Media';
import Step8Review from '../components/createEvent/Step8Review';

const getCompletedSteps = (d: EventDraft): Record<number, boolean> => {
  const comp: Record<number, boolean> = {};

  // Step 1: Basic Info
  const step1Done = !!(d.basic.eventName && d.basic.slug && d.basic.categoryId && d.basic.eventType && d.basic.shortDescription && d.basic.about);
  if (step1Done) comp[0] = true;

  // Step 2: Date & Time
  const hasDatetimeFields = !!(d.datetime.startDate && d.datetime.endDate && d.datetime.startTime && d.datetime.endTime);
  const hasSlots = Array.isArray(d.datetime.slots) && d.datetime.slots.length > 0;
  const step2Done = hasDatetimeFields || hasSlots;
  if (step2Done) comp[1] = true;

  // Step 3: Venue
  const step3Done = !!(d.venue.venueName && d.venue.addressLine1 && d.venue.city && d.venue.state && d.venue.zip);
  if (step3Done) comp[2] = true;

  // Step 4: Floor Plan
  const step4Done = !!(d.details.hallName || d.details.components.length > 0);
  if (step4Done) comp[3] = true;

  // Step 5: Organizers
  const step5Done = !!(d.organizer.companyName || d.organizer.ownerEmail);
  if (step5Done) comp[4] = true;

  // Step 6: Tickets
  const step6Done = d.tickets.ticketTypes.length > 0 || d.tickets.passes.length > 0;
  if (step6Done) comp[5] = true;

  // Step 7: Media
  const step7Done = !!(d.media.shareTitle || d.media.shareDescription);
  if (step7Done) comp[6] = true;

  return comp;
};

const restoreCompletedFromResponse = (resData: any): { completed: Record<number, boolean>; activeStep?: number } => {
  const restoredCompleted: Record<number, boolean> = {};
  const progressData = resData.progress || resData.Progress;
  const metaStr = resData.metaJson || resData.MetaJson;

  const mergeCompleted = (completedMap: Record<number, boolean>, source: number[] | Record<number, boolean>) => {
    if (Array.isArray(source)) {
      source.forEach((s) => { if (typeof s === 'number') completedMap[s] = true; });
    } else {
      Object.entries(source).forEach(([k, v]) => {
        if (v) completedMap[Number(k)] = true;
      });
    }
  };

  const addMetaSteps = () => {
    if (!metaStr) return;
    try {
      const meta = JSON.parse(metaStr);
      if (meta?.completedSteps && Array.isArray(meta.completedSteps)) {
        mergeCompleted(restoredCompleted, meta.completedSteps);
      }
    } catch {
      // ignore invalid meta
    }
  };

  if (progressData) {
    if (Array.isArray(progressData)) {
      progressData.forEach((p: any) => {
        const sIdx = typeof p.stepIndex === 'number' ? p.stepIndex : p.StepIndex;
        const isComp = typeof p.isCompleted === 'boolean' ? p.isCompleted : p.IsCompleted;
        if (typeof sIdx === 'number' && !!isComp) restoredCompleted[sIdx] = true;
      });
    } else if (typeof progressData === 'object') {
      restoredCompleted[0] = !!(progressData.basicInformationCompleted ?? progressData.BasicInformationCompleted);
      restoredCompleted[1] = !!(progressData.dateTimeCompleted ?? progressData.DateTimeCompleted);
      restoredCompleted[2] = !!(progressData.venueLocationCompleted ?? progressData.VenueLocationCompleted);
      restoredCompleted[3] = !!(progressData.eventDetailsCompleted ?? progressData.EventDetailsCompleted);
      restoredCompleted[4] = !!(progressData.organizersCompleted ?? progressData.OrganizersCompleted);
      restoredCompleted[5] = !!(progressData.ticketsPricingCompleted ?? progressData.TicketsPricingCompleted);
      restoredCompleted[6] = !!(progressData.mediaBrandingCompleted ?? progressData.MediaBrandingCompleted);
      restoredCompleted[7] = !!(progressData.reviewPublishCompleted ?? progressData.ReviewPublishCompleted);
    }

    addMetaSteps();
    const inferredCompleted = getCompletedSteps(eventToDraft(resData));
    mergeCompleted(restoredCompleted, inferredCompleted);

    const activeStepVal = progressData.currentActiveStep ?? progressData.CurrentActiveStep ?? resData.currentActiveStep ?? resData.CurrentActiveStep;
    return { completed: restoredCompleted, activeStep: typeof activeStepVal === 'number' ? activeStepVal : undefined };
  }

  addMetaSteps();
  if (Object.keys(restoredCompleted).length > 0) {
    const inferredCompleted = getCompletedSteps(eventToDraft(resData));
    mergeCompleted(restoredCompleted, inferredCompleted);
    return { completed: restoredCompleted };
  }

  return { completed: {} };
};

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState<EventDraft>(() => {
    const saved = localStorage.getItem('eventpro_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch { }
    }
    return createEmptyDraft();
  });
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [ddl, setDdl] = useState<DDL>({
    categories: [],
    subCategories: [],
    eventTypes: [],
    currencies: [],
    timezones: [],
    venueTypes: [],
    venueCategories: [],
  });
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [dbComponents, setDbComponents] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const onChange = useCallback(<K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const loadedEventIdRef = useRef<string | null>(null);

  // ---- load dropdowns + (edit) existing event ----
  useEffect(() => {
    // If the event ID matches what we've already loaded/saved, don't reset restore progress flag or refetch
    if (id && loadedEventIdRef.current === String(id)) {
      return;
    }
    setHasRestoredProgress(false); // Reset auto-resume flag on ID changes
    (async () => {
      try {
        const dropRes = await commonApi.getEventDropdowns(id ? Number(id) : (draft.eventId ? Number(draft.eventId) : undefined));
        if (dropRes.success && dropRes.data) {
          setDdl((p) => ({
            ...p,
            eventTypes: dropRes.data.eventTypes || [],
            currencies: (dropRes.data.currencies || []).map((c: any) => ({ label: `${c.label} (${c.symbol})`, value: c.code })),
            timezones: dropRes.data.timezones || [],
            venueTypes: dropRes.data.venueTypes || [],
            venueCategories: dropRes.data.venueCategories || [],
            ticketCategories: (dropRes.data.ticketCategories || []).map((x: any) => ({ label: x.label, value: x.value })),
            addonRequired: (dropRes.data.addonRequired || []).map((x: any) => ({ label: x.label, value: x.value })),
            calculationTypes: (dropRes.data.calculationTypes || []).map((x: any) => ({ label: x.label, value: x.value })),
            chargeToOptions: (dropRes.data.chargeToOptions || []).map((x: any) => ({ label: x.label, value: x.value })),
            taxes: (dropRes.data.taxes || []).map((x: any) => ({ label: x.label, value: x.value })),
            passIncludes: (dropRes.data.passIncludes || []).map((x: any) => ({ label: x.label, value: x.value })),
            repeatsConfig: dropRes.data.repeatsConfig || [],
            eventZones: (dropRes.data.eventZones || []).map((x: any) => ({ label: x.label, value: x.value })),
            arrangementTypes: (dropRes.data.arrangementTypes || []).map((x: any) => ({ label: x.label, value: x.value })),
          }));
        }
        const catRes = await eventApi.getCategories();
        if (catRes.success && catRes.data) {
          setAllCategories(catRes.data);
          const parents = catRes.data.filter((c: any) => !c.parentCategoryId);
          setDdl((p) => ({ ...p, categories: parents.map((c: any) => ({ label: c.categoryName, value: c.categoryId })) }));
        }
        const compRes = await componentApi.getComponents();
        if (compRes.success && compRes.data) {
          setDbComponents(compRes.data);
        }
      } catch (e) { console.error(e); }
    })();

    if (id) {
      setInitialLoading(true);
      eventApi.getEvents(id)
        .then((res) => {
          if (res.success && res.data) {
            console.debug('Loaded event response for edit:', res.data);
            setDraft(eventToDraft(res.data));
            loadedEventIdRef.current = String(id);

            // --- Restore persisted step completion from API Progress / MetaJson fallback ---
            try {
              const progressState = restoreCompletedFromResponse(res.data);
              if (Object.keys(progressState.completed).length > 0) {
                setCompleted(progressState.completed);

                if (typeof progressState.activeStep === 'number') {
                  setActiveStep(progressState.activeStep);
                } else {
                  let nextStep = 0;
                  for (let i = 0; i < WIZARD_STEPS.length; i++) {
                    if (!progressState.completed[i]) { nextStep = i; break; }
                  }
                  setActiveStep(nextStep);
                }
                setHasRestoredProgress(true);
              }
            } catch {
              /* ignore parse errors */
            }
          }
        })
        .catch((e) => console.error(e))
        .finally(() => setInitialLoading(false));
    } else {
      loadedEventIdRef.current = null;
      // New event: try loading from local storage
      const saved = localStorage.getItem('eventpro_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setDraft(parsed);
            return;
          }
        } catch { }
      }
      setDraft(createEmptyDraft());
    }
  }, [id]);

  // Save progress to local storage for new events
  useEffect(() => {
    if (!id && draft && draft.eventId === 0) {
      localStorage.setItem('eventpro_draft', JSON.stringify(draft));
    }
  }, [draft, id]);

  // Auto-resume logic: find next pending step on mount or draft load
  useEffect(() => {
    if (initialLoading) return;

    if (!hasRestoredProgress && draft) {
      const initialCompleted = getCompletedSteps(draft);
      setCompleted(initialCompleted);

      // Find the first pending (incomplete) step
      let nextPendingStep = 0;
      for (let i = 0; i < WIZARD_STEPS.length; i++) {
        if (!initialCompleted[i]) {
          nextPendingStep = i;
          break;
        }
      }
      setActiveStep(nextPendingStep);
      setHasRestoredProgress(true);
    }
  }, [draft, initialLoading, hasRestoredProgress]);

  // sub-categories react to chosen category
  useEffect(() => {
    const cid = draft.basic.categoryId;
    if (cid !== '' && allCategories.length) {
      const subs = allCategories.filter((c: any) => c.parentCategoryId === Number(cid));
      setDdl((p) => ({ ...p, subCategories: subs.map((c: any) => ({ label: c.categoryName, value: c.categoryId })) }));
    } else {
      setDdl((p) => ({ ...p, subCategories: [] }));
    }
  }, [draft.basic.categoryId, allCategories]);

  const validateStep = (stepIdx: number): boolean => {
    const errs: Record<string, string> = {};

    if (stepIdx === 0) {
      if (!draft.basic.eventName?.trim()) errs.eventName = 'Event Title is required.';
      if (!draft.basic.slug?.trim()) errs.slug = 'Event Slug is required.';
      if (!draft.basic.categoryId) errs.categoryId = 'Event Category is required.';
      if (!draft.basic.eventType) errs.eventType = 'Event Type is required.';
      if (!draft.basic.eventFormat) errs.eventFormat = 'Event Format is required.';
      if (!draft.basic.shortDescription?.trim()) errs.shortDescription = 'Short Description is required.';
      if (!draft.basic.about?.trim()) errs.about = 'About Event description is required.';
      if (!draft.basic.purpose?.trim()) errs.purpose = 'Event Purpose is required.';
      if (!draft.basic.targetAudience?.trim()) errs.targetAudience = 'Target Audience is required.';
    }

    if (stepIdx === 1) {
      if (draft.datetime.mode === 'single') {
        if (!draft.datetime.slots || draft.datetime.slots.length === 0) {
          errs.slots = 'At least one event slot must be added.';
        }
      } else {
        if (!draft.datetime.startDate) errs.startDate = 'Start Date is required.';
        if (!draft.datetime.endDate) errs.endDate = 'End Date is required.';
        if (!draft.datetime.startTime) errs.startTime = 'Start Time is required.';
        if (!draft.datetime.endTime) errs.endTime = 'End Time is required.';
      }
      if (!draft.datetime.timezone) errs.timezone = 'Timezone is required.';
    }

    if (stepIdx === 2) {
      if (draft.basic.eventFormat === 'physical' || draft.basic.eventFormat === 'hybrid') {
        if (!draft.venue.venueName?.trim()) errs.venueName = 'Venue Name is required.';
        if (!draft.venue.addressLine1?.trim()) errs.addressLine1 = 'Address Line 1 is required.';
        if (!draft.venue.city?.trim()) errs.city = 'City is required.';
        if (!draft.venue.state?.trim()) errs.state = 'State is required.';
        if (!draft.venue.zip?.trim()) errs.zip = 'ZIP/Postal Code is required.';
      }
    }

    if (stepIdx === 4) {
      if (!draft.organizer.organizerType) errs.organizerType = 'Organiser Type is required.';
      if (!draft.organizer.companyName?.trim()) errs.companyName = 'Organisation / Company Name is required.';
      if (!draft.organizer.primaryEmail?.trim()) errs.primaryEmail = 'Primary Email is required.';
      if (!draft.organizer.primaryPhone?.trim()) errs.primaryPhone = 'Primary Phone is required.';
      if (!draft.organizer.address?.trim()) errs.address = 'Address is required.';
      if (!draft.organizer.city?.trim()) errs.city = 'City is required.';
      if (!draft.organizer.state) errs.state = 'State is required.';
      if (!draft.organizer.country) errs.country = 'Country is required.';
      if (!draft.organizer.zip?.trim()) errs.zip = 'PIN / ZIP Code is required.';
      if (!draft.organizer.ownerName?.trim()) errs.ownerName = 'Primary Contact Name is required.';
      if (!draft.organizer.ownerDesignation?.trim()) errs.ownerDesignation = 'Primary Contact Designation is required.';
      if (!draft.organizer.ownerEmail?.trim()) errs.ownerEmail = 'Primary Contact Email is required.';
      if (!draft.organizer.ownerPhone?.trim()) errs.ownerPhone = 'Primary Contact Phone is required.';
      if (!draft.organizer.emergencyName?.trim()) errs.emergencyName = 'Emergency Contact Name is required.';
      if (!draft.organizer.emergencyRelationship?.trim()) errs.emergencyRelationship = 'Emergency Contact Relationship is required.';
      if (!draft.organizer.emergencyPhone?.trim()) errs.emergencyPhone = 'Emergency Contact Phone is required.';
    }

    if (stepIdx === 5) {
      if (draft.tickets.ticketTypes.length === 0 && draft.tickets.passes.length === 0) {
        errs.tickets = 'At least one Ticket Type or Pass is required.';
      }
    }

    if (stepIdx === 6) {
      if (!draft.media.logoFile || draft.media.logoFile.length === 0) {
        errs.logoFile = 'Event Logo is required.';
      }
      if (!draft.media.coverFile || draft.media.coverFile.length === 0) {
        errs.coverFile = 'Cover Image is required.';
      }
      if (!draft.media.primaryColor?.trim()) {
        errs.primaryColor = 'Primary Color is required.';
      }
    }

    setValidationErrors(errs);

    const keys = Object.keys(errs);
    if (keys.length > 0) {
      const firstMsg = errs[keys[0]];
      toast.error(firstMsg);
      return false;
    }

    return true;
  };

  const goToStep = (i: number) => {
    if (i > activeStep) {
      for (let step = activeStep; step < i; step++) {
        if (!validateStep(step)) {
          return;
        }
      }
    }
    setValidationErrors({});
    setActiveStep(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guard against double-click / concurrent submissions
  const isSavingRef = useRef(false);

  const persist = async (publish: boolean, completedOverride?: Record<number, boolean>): Promise<boolean> => {
    if (isSavingRef.current) return false; // prevent duplicate concurrent saves
    isSavingRef.current = true;
    setSaving(true);
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = localStorage.getItem('email') || userObj?.emailId || userObj?.email || userObj?.userName || 'system';
      const userIdVal = Number(localStorage.getItem('userId') || 0);

      const inferredCompleted = getCompletedSteps(draft);
      const completedSource = completedOverride ?? { ...completed, ...inferredCompleted };
      const completedSteps = Object.entries(completedSource)
        .filter(([, v]) => v)
        .map(([k]) => Number(k));

      const payload = draftToEventRequest(draft, {
        userId: userIdVal > 0 ? userIdVal : null,
        isPublishActive: publish,
        createdBy: userEmail,
        createdFrom: 'WebUI',
        updatedBy: userEmail,
        updatedFrom: 'WebUI',
        completedSteps,
        currentActiveStep: completedOverride ? Math.min(activeStep + 1, WIZARD_STEPS.length - 1) : activeStep,
      }, dbComponents);

      const fd = new FormData();
      fd.append('model', JSON.stringify(payload));

      // Append files with specific category names
      draft.media.logoFile.filter((file: any) => !file.isExisting).forEach((file) => fd.append('logoFile', file));
      draft.media.coverFile.filter((file: any) => !file.isExisting).forEach((file) => fd.append('coverFile', file));
      draft.media.faviconFile.filter((file: any) => !file.isExisting).forEach((file) => fd.append('faviconFile', file));
      draft.media.bannerFile.filter((file: any) => !file.isExisting).forEach((file) => fd.append('bannerFile', file));
      draft.media.galleryFiles.filter((file: any) => !file.isExisting).forEach((file) => fd.append('galleryFiles', file));
      draft.media.documentFiles.filter((file: any) => !file.isExisting).forEach((file) => fd.append('documentFiles', file));
      draft.media.videoFiles.filter((file: any) => !file.isExisting).forEach((file) => fd.append('videoFiles', file));
      draft.media.audioFiles.filter((file: any) => !file.isExisting).forEach((file) => fd.append('audioFiles', file));
      if ((draft.media as any).shareImageFile) {
        ((draft.media as any).shareImageFile as File[]).filter((file: any) => !file.isExisting).forEach((file) => fd.append('shareImageFile', file));
      }

      (draft.organizer.logoFile || []).filter((file: any) => !file.isExisting).forEach((file) => fd.append('organizerLogo', file));
      (draft.organizer.gstCertificateFile || []).filter((file: any) => !file.isExisting).forEach((file) => fd.append('gstCertificate', file));
      (draft.organizer.panCardDocumentFile || []).filter((file: any) => !file.isExisting).forEach((file) => fd.append('panCardDocument', file));
      (draft.organizer.registrationCertificateFile || []).filter((file: any) => !file.isExisting).forEach((file) => fd.append('registrationCertificate', file));
      (draft.organizer.otherDocumentFile || []).filter((file: any) => !file.isExisting).forEach((file) => fd.append('otherDocument', file));

      const res = await eventApi.addEditEvent(fd);

      if (res.success) {
        let savedEventId: number = (res.data as any)?.eventId ?? (res.data as any)?.EventId ?? 0;
        let savedEventRId: string = (res.data as any)?.eventRId ?? (res.data as any)?.EventRId ?? '';

        // If the SP returned success but no event data (e.g. slot migration not run yet),
        // re-fetch the event so we at least get the correct EventId for future updates.
        if (!savedEventId && draft.eventRId) {
          try {
            const refetch = await eventApi.getEvents(draft.eventRId);
            if (refetch.success && refetch.data) {
              savedEventId = refetch.data.eventId ?? refetch.data.EventId ?? 0;
              savedEventRId = refetch.data.eventRId ?? refetch.data.EventRId ?? '';
            }
          } catch { /* best-effort */ }
        }

        if (savedEventId) {
          setDraft(eventToDraft(res.data));
          localStorage.removeItem('eventpro_draft');

          const progressState = restoreCompletedFromResponse(res.data);
          if (Object.keys(progressState.completed).length > 0) {
            setCompleted(progressState.completed);
          }

          if (!isEdit && savedEventId) {
            loadedEventIdRef.current = String(savedEventId);
            navigate(ROUTES.EVENT_EDIT.replace(':id', String(savedEventId)), { replace: true });
          }
          return true;
        }

        // success but could not determine eventId — still treat as success
        toast.error(res.message || 'Save succeeded but event ID was not returned.');
        return false;
      }

      toast.error(res.message || 'Failed to save event.');
      return false;
    } catch (e: any) {
      toast.error(e.message || 'Failed to save event.');
      return false;
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  const handleSaveDraft = async () => {
    if (!validateStep(activeStep)) return;
    const currentCompleted = getCompletedSteps(draft);
    const ok = await persist(false, currentCompleted);
    if (ok) {
      setCompleted(currentCompleted);
      toast.success('Draft saved successfully.');
    }
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) return;
    // Build the updated completed map NOW so it can be embedded into MetaJson
    // during persist (before React state batch-updates it).
    const nextCompleted = { ...completed, [activeStep]: true };
    const ok = await persist(false, nextCompleted);
    if (!ok) return;
    setCompleted(nextCompleted);
    goToStep(Math.min(activeStep + 1, WIZARD_STEPS.length - 1));
  };

  const handleBack = () => goToStep(Math.max(activeStep - 1, 0));

  const handlePublish = async () => {
    const publish = draft.publish.publishOption === 'now';
    const ok = await persist(publish);
    if (ok) {
      toast.success(publish ? 'Event published successfully!' : 'Event saved.');
      localStorage.removeItem('eventpro_draft'); // Ensure cleared
      navigate(ROUTES.EVENTS);
    }
  };

  const handlePrimary = () => {
    if (activeStep === WIZARD_STEPS.length - 1) {
      for (let i = 0; i < WIZARD_STEPS.length - 1; i++) {
        if (!validateStep(i)) {
          goToStep(i);
          return;
        }
      }
      handlePublish();
    } else {
      handleNext();
    }
  };

  if (initialLoading) {
    return <DashboardLayout><AppLoader message="Loading event details..." /></DashboardLayout>;
  }

  const stepProps = { draft, onChange, ddl, meta: { activeStep, completed }, goToStep, errors: validationErrors };
  const isLast = activeStep === WIZARD_STEPS.length - 1;

  return (
    <DashboardLayout>
      <Box sx={{ bgcolor: EP.canvas, m: -3, p: { xs: 2, md: 3 }, minHeight: 'calc(100vh - 64px)' }}>
        <WizardHeader
          isEdit={isEdit}
          isLast={isLast}
          saving={saving}
          onSaveDraft={handleSaveDraft}
          onPrimary={handlePrimary}
          onClose={() => navigate(ROUTES.EVENTS)}
        />

        <WizardStepper activeStep={activeStep} completed={completed} onStepClick={goToStep} />

        {activeStep === 0 && <Step1BasicInfo {...stepProps} />}
        {activeStep === 1 && <Step2DateTime {...stepProps} />}
        {activeStep === 2 && <Step3Venue {...stepProps} />}
        {activeStep === 3 && <Step4FloorPlan {...stepProps} />}
        {activeStep === 4 && <Step5Organizers {...stepProps} />}
        {activeStep === 5 && <Step6Tickets {...stepProps} />}
        {activeStep === 6 && <Step7Media {...stepProps} />}
        {activeStep === 7 && <Step8Review {...stepProps} />}

        {/* Footer nav */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          {activeStep === 0 ? <span /> : (
            <Button variant="outline" onClick={handleBack}><ArrowBackIcon sx={{ fontSize: 16 }} /> Back</Button>
          )}
          <Button variant="default" size="lg" onClick={handlePrimary} disabled={saving} loading={saving}>
            {isLast ? 'Publish Event' : 'Save & Continue'}
            {isLast ? <RocketLaunchIcon sx={{ fontSize: 16 }} /> : <ArrowForwardIcon sx={{ fontSize: 16 }} />}
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default CreateEventPage;
