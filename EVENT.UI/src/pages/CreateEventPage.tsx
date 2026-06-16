import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

import DashboardLayout from '../layouts/DashboardLayout';
import AppLoader from '../components/AppLoader';
import { eventApi } from '../api/eventApi';
import { commonApi } from '../api/commonApi';
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

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState<EventDraft>(createEmptyDraft());
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [ddl, setDdl] = useState<DDL>({ categories: [], subCategories: [], eventTypes: [], currencies: [] });
  const [allCategories, setAllCategories] = useState<any[]>([]);

  const onChange = useCallback(<K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ---- load dropdowns + (edit) existing event ----
  useEffect(() => {
    (async () => {
      try {
        const dropRes = await commonApi.getEventDropdowns();
        if (dropRes.success && dropRes.data) {
          setDdl((p) => ({
            ...p,
            eventTypes: dropRes.data.eventTypes || [],
            currencies: (dropRes.data.currencies || []).map((c: any) => ({ label: `${c.label} (${c.symbol})`, value: c.code })),
          }));
        }
        const catRes = await eventApi.getCategories();
        if (catRes.success && catRes.data) {
          setAllCategories(catRes.data);
          const parents = catRes.data.filter((c: any) => !c.parentCategoryId);
          setDdl((p) => ({ ...p, categories: parents.map((c: any) => ({ label: c.categoryName, value: c.categoryId })) }));
        }
      } catch (e) { console.error(e); }
    })();

    if (id) {
      setInitialLoading(true);
      eventApi.getEvents(id)
        .then((res) => { if (res.success && res.data) setDraft(eventToDraft(res.data)); })
        .catch((e) => console.error(e))
        .finally(() => setInitialLoading(false));
    }
  }, [id]);

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

  const goToStep = (i: number) => { setActiveStep(i); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const persist = async (publish: boolean): Promise<boolean> => {
    setSaving(true);
    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userEmail = localStorage.getItem('email') || userObj?.emailId || userObj?.email || userObj?.userName || 'system';
      const userIdVal = Number(localStorage.getItem('userId') || 0);

      const payload = draftToEventRequest(draft, {
        userId: userIdVal > 0 ? userIdVal : null,
        isPublishActive: publish,
        createdBy: draft.eventId > 0 ? undefined : userEmail,
        createdFrom: draft.eventId > 0 ? undefined : 'WebUI',
        updatedBy: userEmail,
        updatedFrom: 'WebUI',
      });

      const fd = new FormData();
      fd.append('model', JSON.stringify(payload));
      [draft.media.logoFile, draft.media.coverFile, draft.media.faviconFile, draft.media.bannerFile, draft.media.galleryFiles, draft.media.documentFiles]
        .flat()
        .forEach((file) => fd.append('attachments', file));

      const res = await eventApi.addEditEvent(fd);
      if (res.success && res.data) {
        setDraft((p) => ({ ...p, eventId: res.data.eventId, eventRId: res.data.eventRId }));
        return true;
      }
      toast.error(res.message || 'Failed to save event.');
      return false;
    } catch (e: any) {
      toast.error(e.message || 'Failed to save event.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    const ok = await persist(false);
    if (ok) toast.success('Draft saved successfully.');
  };

  const handleNext = async () => {
    // Persist on the Venue step (needs an eventId for the floor-plan step) and silently elsewhere.
    if (activeStep === 2 || activeStep === WIZARD_STEPS.length - 2) {
      const ok = await persist(false);
      if (!ok) return;
    }
    setCompleted((c) => ({ ...c, [activeStep]: true }));
    goToStep(Math.min(activeStep + 1, WIZARD_STEPS.length - 1));
  };

  const handleBack = () => goToStep(Math.max(activeStep - 1, 0));

  const handlePublish = async () => {
    const publish = draft.publish.publishOption === 'now';
    const ok = await persist(publish);
    if (ok) {
      toast.success(publish ? 'Event published successfully!' : 'Event saved.');
      navigate(ROUTES.EVENTS);
    }
  };

  const handlePrimary = () => { if (activeStep === WIZARD_STEPS.length - 1) handlePublish(); else handleNext(); };

  if (initialLoading) {
    return <DashboardLayout><AppLoader message="Loading event details..." /></DashboardLayout>;
  }

  const stepProps = { draft, onChange, ddl, meta: { activeStep, completed }, goToStep };
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
