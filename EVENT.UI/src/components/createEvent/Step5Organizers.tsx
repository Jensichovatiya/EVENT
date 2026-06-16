import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import AppModal from '../AppModal';
import { EP } from './theme';
import { Field, StepHeading, StepLayout, SidebarCard, Grid } from './parts';
import { PHONE_CODES, COUNTRY_OPTIONS, INDIAN_STATES, EMPLOYEE_COUNT_OPTIONS, INDUSTRY_OPTIONS, BUSINESS_TYPE_OPTIONS, ORGANIZER_TYPE_OPTIONS } from './options';
import { StepProps } from './stepProps';
import { OrganizerProfile, ContactPerson } from './types';

let ctSeq = 1;
const nextId = () => `ct${ctSeq++}_${(performance.now() | 0)}`;

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem', mb: 2, mt: 3 }}>{children}</Typography>
);

const PhoneField: React.FC<{ code: string; phone: string; onCode: (v: string) => void; onPhone: (v: string) => void }> = ({ code, phone, onCode, onPhone }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Box sx={{ width: 86 }}><AppDropdown label="Code" options={PHONE_CODES} value={code} onChange={(e) => onCode(e.target.value as string)} /></Box>
    <AppInput placeholder="98765 43210" value={phone} onChange={(e) => onPhone(e.target.value)} />
  </Box>
);

const DOCS = [
  { key: 'logo', label: 'Organisation Logo', hint: 'PNG, JPG (Max. 5MB)' },
  { key: 'gst', label: 'GST Certificate', hint: 'PDF (Max. 5MB)' },
  { key: 'pan', label: 'PAN Card', hint: 'PDF, JPG (Max. 2MB)' },
  { key: 'reg', label: 'Registration Certificate', hint: 'PDF (Max. 5MB)' },
];

export const Step5Organizers: React.FC<StepProps> = ({ draft, onChange }) => {
  const o = draft.organizer;
  const set = (p: Partial<OrganizerProfile>) => onChange('organizer', { ...o, ...p });

  const [contactModal, setContactModal] = useState(false);
  const blankContact = (): ContactPerson => ({ id: '', name: '', designation: '', role: '', email: '', phone: '' });
  const [cf, setCf] = useState<ContactPerson>(blankContact());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, string>>({});

  const saveContact = () => {
    if (!cf.name.trim()) return;
    if (editingId) set({ additionalContacts: o.additionalContacts.map((c) => (c.id === editingId ? { ...cf, id: editingId } : c)) });
    else set({ additionalContacts: [...o.additionalContacts, { ...cf, id: nextId() }] });
    setContactModal(false); setEditingId(null); setCf(blankContact());
  };

  return (
    <StepLayout
      main={
        <>
          <AddContactModal
            open={contactModal}
            editing={!!editingId}
            contact={cf}
            onChange={(p) => setCf((c) => ({ ...c, ...p }))}
            onClose={() => { setContactModal(false); setEditingId(null); }}
            onSave={saveContact}
          />
          <StepHeading title="Organisers & Contacts" subtitle="Add organiser details and key contacts who will manage this event." />

          {/* Organiser Information */}
          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.95rem', mb: 2 }}>Organiser Information</Typography>
          <Grid cols={4}>
            <Field label="Organiser Type" required><AppDropdown label="Type" options={ORGANIZER_TYPE_OPTIONS} value={o.organizerType} onChange={(e) => set({ organizerType: e.target.value as string })} /></Field>
            <Field label="Organisation / Company Name" required><AppInput placeholder="e.g. FutureX Events Pvt. Ltd." value={o.companyName} onChange={(e) => set({ companyName: e.target.value })} /></Field>
            <Field label="GSTIN (if applicable)"><AppInput placeholder="29ABCDE1234F1Z5" value={o.gstin} onChange={(e) => set({ gstin: e.target.value })} /></Field>
            <Field label="PAN (if applicable)"><AppInput placeholder="ABCDE1234F" value={o.pan} onChange={(e) => set({ pan: e.target.value })} /></Field>
          </Grid>
          <Grid cols={4} sx={{ mt: 2.5 }}>
            <Field label="Website"><AppInput placeholder="https://www.example.com" value={o.website} onChange={(e) => set({ website: e.target.value })} /></Field>
            <Field label="Primary Email" required><AppInput placeholder="info@example.com" value={o.primaryEmail} onChange={(e) => set({ primaryEmail: e.target.value })} /></Field>
            <Field label="Primary Phone" required><PhoneField code={o.primaryPhoneCode} phone={o.primaryPhone} onCode={(v) => set({ primaryPhoneCode: v })} onPhone={(v) => set({ primaryPhone: v })} /></Field>
            <Field label="Alternate Phone"><PhoneField code={o.altPhoneCode} phone={o.altPhone} onCode={(v) => set({ altPhoneCode: v })} onPhone={(v) => set({ altPhone: v })} /></Field>
          </Grid>
          <Grid cols={4} sx={{ mt: 2.5 }}>
            <Field label="Address" required><AppInput placeholder="No. 45, 2nd Floor, MG Road" value={o.address} onChange={(e) => set({ address: e.target.value })} /></Field>
            <Field label="City" required><AppInput placeholder="Bengaluru" value={o.city} onChange={(e) => set({ city: e.target.value })} /></Field>
            <Field label="State" required><AppDropdown label="State" options={INDIAN_STATES} value={o.state} onChange={(e) => set({ state: e.target.value as string })} /></Field>
            <Field label="Country" required><AppDropdown label="Country" options={COUNTRY_OPTIONS} value={o.country} onChange={(e) => set({ country: e.target.value as string })} /></Field>
          </Grid>
          <Grid cols={4} sx={{ mt: 2.5 }}>
            <Field label="PIN / ZIP Code" required><AppInput placeholder="560001" value={o.zip} onChange={(e) => set({ zip: e.target.value })} /></Field>
          </Grid>

          {/* Primary Contact */}
          <SectionTitle>Primary Contact (Event Owner)</SectionTitle>
          <Grid cols={4}>
            <Field label="Full Name" required><AppInput placeholder="Ramesh Kumar" value={o.ownerName} onChange={(e) => set({ ownerName: e.target.value })} /></Field>
            <Field label="Designation" required><AppInput placeholder="Event Director" value={o.ownerDesignation} onChange={(e) => set({ ownerDesignation: e.target.value })} /></Field>
            <Field label="Email" required><AppInput placeholder="owner@example.com" value={o.ownerEmail} onChange={(e) => set({ ownerEmail: e.target.value })} /></Field>
            <Field label="Phone" required><PhoneField code={o.ownerPhoneCode} phone={o.ownerPhone} onCode={(v) => set({ ownerPhoneCode: v })} onPhone={(v) => set({ ownerPhone: v })} /></Field>
          </Grid>

          {/* Additional Contacts */}
          <SectionTitle>Additional Contacts</SectionTitle>
          <Box sx={{ overflowX: 'auto', border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px` }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <Box component="thead" sx={{ bgcolor: '#FAFAFC' }}>
                <Box component="tr">
                  {['Name', 'Designation', 'Role / Responsibility', 'Email', 'Phone', 'Actions'].map((h) => (
                    <Box key={h} component="th" sx={{ textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: EP.muted, textTransform: 'uppercase', py: 1.2, px: 1.5, borderBottom: `1px solid ${EP.line}` }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {o.additionalContacts.length === 0 ? (
                  <Box component="tr"><Box component="td" colSpan={6} sx={{ py: 3, textAlign: 'center', color: EP.faint, fontSize: '0.82rem' }}>No additional contacts added.</Box></Box>
                ) : o.additionalContacts.map((c) => (
                  <Box component="tr" key={c.id}>
                    {[c.name, c.designation, c.role, c.email, `${c.phone}`].map((v, i) => (
                      <Box key={i} component="td" sx={{ py: 1.1, px: 1.5, borderBottom: `1px solid ${EP.lineSoft}`, fontSize: '0.8rem', color: EP.text }}>{v || '—'}</Box>
                    ))}
                    <Box component="td" sx={{ py: 1.1, px: 1.5, borderBottom: `1px solid ${EP.lineSoft}` }}>
                      <IconButton size="small" onClick={() => { setCf(c); setEditingId(c.id); setContactModal(true); }}><EditOutlinedIcon fontSize="small" sx={{ color: EP.primary }} /></IconButton>
                      <IconButton size="small" onClick={() => set({ additionalContacts: o.additionalContacts.filter((x) => x.id !== c.id) })}><DeleteOutlineIcon fontSize="small" sx={{ color: EP.red }} /></IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => { setCf(blankContact()); setEditingId(null); setContactModal(true); }} sx={{ mt: 1.5, textTransform: 'none', borderColor: EP.line, color: EP.text }}>Add Contact</Button>

          {/* Emergency Contact */}
          <SectionTitle>Emergency Contact</SectionTitle>
          <Grid cols={4}>
            <Field label="Contact Name" required><AppInput placeholder="Suresh Babu" value={o.emergencyName} onChange={(e) => set({ emergencyName: e.target.value })} /></Field>
            <Field label="Relationship" required><AppInput placeholder="Admin Manager" value={o.emergencyRelationship} onChange={(e) => set({ emergencyRelationship: e.target.value })} /></Field>
            <Field label="Phone" required><PhoneField code={o.emergencyPhoneCode} phone={o.emergencyPhone} onCode={(v) => set({ emergencyPhoneCode: v })} onPhone={(v) => set({ emergencyPhone: v })} /></Field>
            <Field label="Alternate Phone"><PhoneField code={o.emergencyAltPhoneCode} phone={o.emergencyAltPhone} onCode={(v) => set({ emergencyAltPhoneCode: v })} onPhone={(v) => set({ emergencyAltPhone: v })} /></Field>
          </Grid>

          {/* Organisation Details */}
          <SectionTitle>Organisation Details</SectionTitle>
          <Grid cols={5}>
            <Field label="Year Established"><AppInput placeholder="2016" value={o.yearEstablished} onChange={(e) => set({ yearEstablished: e.target.value })} /></Field>
            <Field label="Employee Count"><AppDropdown label="Count" options={EMPLOYEE_COUNT_OPTIONS} value={o.employeeCount} onChange={(e) => set({ employeeCount: e.target.value as string })} /></Field>
            <Field label="Industry"><AppDropdown label="Industry" options={INDUSTRY_OPTIONS} value={o.industry} onChange={(e) => set({ industry: e.target.value as string })} /></Field>
            <Field label="Business Type"><AppDropdown label="Type" options={BUSINESS_TYPE_OPTIONS} value={o.businessType} onChange={(e) => set({ businessType: e.target.value as string })} /></Field>
            <Field label="Registration Number"><AppInput placeholder="U74999KA2016PTC098765" value={o.registrationNumber} onChange={(e) => set({ registrationNumber: e.target.value })} /></Field>
          </Grid>
          <Box sx={{ mt: 2.5 }}>
            <Field label="Registered Address"><AppInput placeholder="No. 45, 2nd Floor, MG Road, Bengaluru, Karnataka - 560001" value={o.registeredAddress} onChange={(e) => set({ registeredAddress: e.target.value })} /></Field>
          </Box>

          {/* Social Media */}
          <SectionTitle>Social Media Links <Box component="span" sx={{ color: EP.faint, fontWeight: 400, fontSize: '0.8rem' }}>(Optional)</Box></SectionTitle>
          <Grid cols={5}>
            <Field label="Facebook"><AppInput placeholder="https://facebook.com/..." value={o.facebook} onChange={(e) => set({ facebook: e.target.value })} /></Field>
            <Field label="Instagram"><AppInput placeholder="https://instagram.com/..." value={o.instagram} onChange={(e) => set({ instagram: e.target.value })} /></Field>
            <Field label="LinkedIn"><AppInput placeholder="https://linkedin.com/company/..." value={o.linkedin} onChange={(e) => set({ linkedin: e.target.value })} /></Field>
            <Field label="Twitter / X"><AppInput placeholder="https://twitter.com/..." value={o.twitter} onChange={(e) => set({ twitter: e.target.value })} /></Field>
            <Field label="YouTube"><AppInput placeholder="https://youtube.com/@..." value={o.youtube} onChange={(e) => set({ youtube: e.target.value })} /></Field>
          </Grid>
        </>
      }
      rail={
        <>
          <SidebarCard title="Organisers Summary" action={<EditOutlinedIcon sx={{ fontSize: 18, color: EP.primary, cursor: 'pointer' }} />}>
            <Sum icon={<BusinessOutlinedIcon sx={{ fontSize: 18 }} />} label="Organiser" value={o.companyName} />
            <Divider sx={{ my: 0.5 }} />
            <Sum icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />} label="Primary Contact" value={o.ownerName ? `${o.ownerName}${o.ownerDesignation ? ' · ' + o.ownerDesignation : ''}` : ''} />
            <Divider sx={{ my: 0.5 }} />
            <Sum icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />} label="Email" value={o.ownerEmail || o.primaryEmail} />
            <Divider sx={{ my: 0.5 }} />
            <Sum icon={<LocalPhoneOutlinedIcon sx={{ fontSize: 18 }} />} label="Phone" value={o.ownerPhone ? `${o.ownerPhoneCode} ${o.ownerPhone}` : ''} />
            <Divider sx={{ my: 0.5 }} />
            <Sum icon={<GroupsOutlinedIcon sx={{ fontSize: 18 }} />} label="Additional Contacts" value={`${o.additionalContacts.length} Added`} />
            <Divider sx={{ my: 0.5 }} />
            <Sum icon={<HealthAndSafetyOutlinedIcon sx={{ fontSize: 18 }} />} label="Emergency Contact" value={o.emergencyName ? `${o.emergencyName}${o.emergencyPhone ? ' · ' + o.emergencyPhoneCode + ' ' + o.emergencyPhone : ''}` : ''} />
          </SidebarCard>

          <Box sx={{ borderRadius: `${EP.radius}px`, border: `1px solid ${EP.line}`, p: 2, bgcolor: '#F5F8FF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <InfoOutlinedIcon sx={{ color: EP.blue, fontSize: 18 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: EP.text }}>Why is this important?</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.76rem', color: EP.muted, mb: 1 }}>Accurate organiser and contact information helps in:</Typography>
            {['Smooth communication', 'Quick issue resolution', 'Legal & compliance', 'Emergency support'].map((t) => (
              <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4 }}>
                <CheckIcon sx={{ fontSize: 15, color: EP.green }} />
                <Typography sx={{ fontSize: '0.78rem', color: EP.text }}>{t}</Typography>
              </Box>
            ))}
          </Box>

          <SidebarCard title="Documents">
            <Typography sx={{ fontSize: '0.74rem', color: EP.faint, mt: -1.5, mb: 1.5 }}>Upload relevant documents for verification and reference.</Typography>
            {DOCS.map((doc) => (
              <Box key={doc.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.8, borderBottom: `1px solid ${EP.lineSoft}` }}>
                <DescriptionOutlinedIcon sx={{ color: EP.faint, fontSize: 20 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{doc.label}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: EP.faint }} noWrap>{docs[doc.key] || doc.hint}</Typography>
                </Box>
                <Button component="label" size="small" startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', color: EP.primary, fontSize: '0.74rem' }}>
                  Upload
                  <input type="file" hidden onChange={(e) => e.target.files && setDocs((d) => ({ ...d, [doc.key]: e.target.files![0].name }))} />
                </Button>
              </Box>
            ))}
            <Box sx={{ border: `1px dashed ${EP.line}`, borderRadius: 1.5, p: 1.5, textAlign: 'center', mt: 1.5, cursor: 'pointer' }}>
              <AddIcon sx={{ color: EP.primary, fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: EP.primary }}>Upload Other Document</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: EP.faint }}>Any other supporting document</Typography>
            </Box>
          </SidebarCard>
        </>
      }
    />
  );
};

const AddContactModal: React.FC<{ open: boolean; editing: boolean; contact: ContactPerson; onChange: (p: Partial<ContactPerson>) => void; onClose: () => void; onSave: () => void }> = ({ open, editing, contact, onChange, onClose, onSave }) => (
  <AppModal open={open} onClose={onClose} title={editing ? 'Edit Contact' : 'Add Contact'} maxWidth="sm"
    actions={<><Button onClick={onClose} sx={{ textTransform: 'none', color: EP.muted }}>Cancel</Button><Button variant="contained" onClick={onSave} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>{editing ? 'Update Contact' : 'Add Contact'}</Button></>}>
    <Grid cols={2}>
      <Field label="Name" required><AppInput placeholder="Full name" value={contact.name} onChange={(e) => onChange({ name: e.target.value })} /></Field>
      <Field label="Designation"><AppInput placeholder="e.g. Project Manager" value={contact.designation} onChange={(e) => onChange({ designation: e.target.value })} /></Field>
      <Field label="Role / Responsibility"><AppInput placeholder="e.g. Venue & Logistics" value={contact.role} onChange={(e) => onChange({ role: e.target.value })} /></Field>
      <Field label="Email"><AppInput placeholder="name@example.com" value={contact.email} onChange={(e) => onChange({ email: e.target.value })} /></Field>
    </Grid>
    <Box sx={{ mt: 2 }}><Field label="Phone"><AppInput placeholder="+91 98765 43210" value={contact.phone} onChange={(e) => onChange({ phone: e.target.value })} /></Field></Box>
  </AppModal>
);

const Sum: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', gap: 1.5, py: 1 }}>
    <Box sx={{ color: EP.faint, mt: 0.2, display: 'flex' }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.72rem', color: EP.faint }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.84rem', color: EP.text, fontWeight: 600, wordBreak: 'break-word' }}>{value || '—'}</Typography>
    </Box>
  </Box>
);

export default Step5Organizers;
