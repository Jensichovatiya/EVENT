import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ticketApi } from '../../api/ticketApi';
import { Box, Typography, Button, IconButton, Switch, Divider, Chip, Checkbox, FormControlLabel, Select, MenuItem, ListItemText, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import AppTextarea from '../AppTextarea';
import AppDatePicker from '../AppDatePicker';
import AppModal from '../AppModal';
import AppCheckbox from '../AppCheckbox';
import { RadioGroup, RadioGroupItem } from '@/Ui/radio-group';
import { Badge as UIBadge } from '@/Ui/badge';
import { EP } from './theme';
import { Field, StepHeading, SidebarCard, TipsCard, ToggleRow, Grid } from './parts';
import { fmtDate } from './options';
import { StepProps, DDL } from './stepProps';
import { TicketType, Pass, AddOn, PromoCode, TaxRule, FeeRule, TicketsInfo } from './types';

let tidSeq = 1;
const nid = (p: string) => `${p}${tidSeq++}_${(performance.now() | 0)}`;
const inr = (n: number) => `₹ ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getUserEmail = (): string => {
  try {
    const userStr = localStorage.getItem('user');
    const userObj = userStr ? JSON.parse(userStr) : null;
    return localStorage.getItem('email') || userObj?.emailId || userObj?.email || userObj?.userName || 'system';
  } catch {
    return 'system';
  }
};

const SUBTABS = ['Ticket Types', 'Passes', 'Add-ons', 'Promo Codes', 'Tax & Fees', 'Payment Settings'] as const;
type SubTab = typeof SUBTABS[number];

// APPLIES_OPTIONS is now dynamically built from ddl.ticketCategories (TICKET_CATEGORY master)

// ---- shared table chrome ----
const Th: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box component="th" sx={{ textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: EP.muted, textTransform: 'uppercase', letterSpacing: 0.3, py: 1.2, px: 1.5, borderBottom: `1px solid ${EP.line}`, whiteSpace: 'nowrap' }}>{children}</Box>
);
const Td: React.FC<{ children?: React.ReactNode; sx?: any }> = ({ children, sx }) => (
  <Box component="td" sx={{ py: 1.2, px: 1.5, borderBottom: `1px solid ${EP.lineSoft}`, fontSize: '0.82rem', color: EP.text, verticalAlign: 'middle', ...sx }}>{children}</Box>
);
const Table: React.FC<{ head: React.ReactNode; children: React.ReactNode; min?: number }> = ({ head, children, min = 640 }) => (
  <Box sx={{ overflowX: 'auto', border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px` }}>
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: min }}>
      <Box component="thead" sx={{ bgcolor: '#FAFAFC' }}><Box component="tr">{head}</Box></Box>
      <Box component="tbody">{children}</Box>
    </Box>
  </Box>
);
const ActiveSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: EP.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: EP.primary } }} />
);
const RowActions: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    <IconButton size="small" onClick={onDelete}><DeleteOutlineIcon fontSize="small" sx={{ color: EP.red }} /></IconButton>
  </Box>
);
const Empty: React.FC<{ label: string }> = ({ label }) => (
  <Box sx={{ textAlign: 'center', py: 5, border: `2px dashed ${EP.line}`, borderRadius: `${EP.radiusSm}px` }}><Typography sx={{ color: EP.faint, fontSize: '0.85rem' }}>{label}</Typography></Box>
);
const ColorField: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 44, height: 40, border: `1px solid ${EP.line}`, borderRadius: 6, background: 'none' }} />
    <AppInput value={value} onChange={(e) => onChange(e.target.value)} />
  </Box>
);
const MultiSelect: React.FC<{ value: string[]; onChange: (v: string[]) => void; options: { label: string; value: string }[]; placeholder: string }> = ({ value, onChange, options, placeholder }) => (
  <FormControl fullWidth>
    <Select multiple displayEmpty value={value} onChange={(e) => onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))}
      renderValue={(sel) => (sel as string[]).length ? (sel as string[]).map((s) => options.find((o) => o.value === s)?.label || s).join(', ') : <span style={{ color: '#9CA3AF' }}>{placeholder}</span>}
      sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value} dense>
          <Checkbox size="small" checked={value.includes(o.value)} sx={{ '&.Mui-checked': { color: EP.primary } }} />
          <ListItemText primary={o.label} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);
const Badge: React.FC<{ label?: string; color?: string }> = ({ label, color = EP.green }) => label ? (
  <UIBadge variant="secondary" size="sm" className="ml-1 align-middle" style={{ backgroundColor: color + '22', color }}>{label}</UIBadge>
) : null;

export const Step6Tickets: React.FC<StepProps> = ({ draft, onChange, ddl }) => {
  const t = draft.tickets;
  const set = (p: Partial<TicketsInfo>) => onChange('tickets', { ...t, ...p });
  const [sub, setSub] = useState<SubTab>('Ticket Types');

  // Ticket category options from TICKET_CATEGORY master
  const ticketCategoryOptions = (ddl.ticketCategories ?? []).map((c) => ({ label: c.label, value: String(c.value) }));
  // Applies-to options reuse the same TICKET_CATEGORY list (plus an "All" entry)
  const appliesToOptions: { label: string; value: string }[] = [
    { label: 'All Ticket Types', value: '0' },
    ...ticketCategoryOptions,
  ];

  const eventId = (draft as any).eventId as number | undefined;

  // Load existing ticket data from API when editing a saved event
  useEffect(() => {
    if (!eventId || eventId <= 0) return;
    (async () => {
      try {
        const [ticketsRes, passesRes, addOnsRes, promoRes, taxesRes, feesRes] = await Promise.all([
          ticketApi.getTickets(eventId),
          ticketApi.getPasses(eventId),
          ticketApi.getAddOns(eventId),
          ticketApi.getPromoCodes(eventId),
          ticketApi.getEventTaxes(eventId),
          ticketApi.getEventFees(eventId),
        ]);

        const patch: Partial<TicketsInfo> = {};

        if (ticketsRes.success && ticketsRes.data && ticketsRes.data.length > 0) {
          patch.ticketTypes = ticketsRes.data.map((r) => ({
            id: String(r.publicId),
            name: r.ticketName,
            category: 'single' as TicketType['category'],
            description: r.description,
            price: r.price,
            available: r.availableLimit,
            perOrderLimit: r.perOrderLimit ?? '',
            salesFrom: r.salesStartDate ? String(r.salesStartDate).slice(0, 10) : '',
            salesTo: r.salesEndDate ? String(r.salesEndDate).slice(0, 10) : '',
            active: r.isActive,
            badge: r.displayBadge,
            badgeColor: r.badgeColor || '#22C55E',
            additionalInfo: r.additionalInfo,
            minQty: undefined,
            maxQty: undefined,
            ticketCategoryId: r.ticketCategoryId,
          } as any));
        }

        if (passesRes.success && passesRes.data && passesRes.data.length > 0) {
          patch.passes = passesRes.data.map((r) => ({
            id: String(r.publicId),
            name: r.passName,
            validFrom: r.validFrom ? String(r.validFrom).slice(0, 10) : '',
            validTo: r.validTo ? String(r.validTo).slice(0, 10) : '',
            includes: r.includes ? r.includes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            price: r.price,
            totalLimit: r.totalLimit,
            active: r.isActive,
            badge: r.displayBadge,
            badgeColor: r.badgeColor || '#6C63FF',
            description: r.description,
          } as any));
        }

        if (addOnsRes.success && addOnsRes.data && addOnsRes.data.length > 0) {
          patch.addOns = addOnsRes.data.map((r) => ({
            id: String(r.publicId),
            name: r.addOnName,
            description: r.description,
            price: r.price,
            available: r.availableLimit,
            required: r.requiredTypeId > 0,
            active: r.isActive,
            attachTo: r.ticketTypeIds ? r.ticketTypeIds.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            badge: r.displayBadge,
            badgeColor: r.badgeColor || '#6C63FF',
          } as any));
        }

        if (promoRes.success && promoRes.data && promoRes.data.length > 0) {
          patch.promoCodes = promoRes.data.map((r) => ({
            id: String(r.publicId),
            code: r.promoCode,
            discountType: r.discountTypeId === 1 ? 'percentage' : 'fixed',
            discountValue: r.discountValue,
            appliesTo: r.appliesToId ? String(r.appliesToId) : '0',
            usageLimit: r.usageLimit ?? '',
            minPurchase: r.minPurchaseAmount ?? '',
            validFrom: r.validFrom ? String(r.validFrom).slice(0, 10) : '',
            validUntil: r.validUntil ? String(r.validUntil).slice(0, 10) : '',
            maxDiscount: r.maxDiscountAmount ?? '',
            description: r.description,
            active: r.isActive,
            badge: '',
          } as any));
        }

        if (taxesRes.success && taxesRes.data && taxesRes.data.length > 0) {
          patch.taxes = taxesRes.data.map((r) => ({
            id: String(r.publicId),
            publicId: r.publicId,
            name: r.taxName || '',
            type: r.taxTypeId === 1 ? 'percentage' : 'fixed',
            rate: r.taxPercentage,
            appliesTo: r.appliesToId ? String(r.appliesToId) : '0',
            includedInPrice: r.isIncludedInPrice,
            active: r.isActive,
            taxId: r.taxId,
          } as any));
        }

        if (feesRes.success && feesRes.data && feesRes.data.length > 0) {
          patch.fees = feesRes.data.map((r) => ({
            id: String(r.publicId),
            publicId: r.publicId,
            name: r.feeName || '',
            type: r.feeTypeId === 1 ? 'percentage' : 'fixed',
            amount: r.amount,
            appliesTo: r.appliesToId ? String(r.appliesToId) : '0',
            chargeTo: r.chargeToId === 1 ? 'buyer' : 'organizer',
            includedInPrice: r.isIncludedInPrice,
            minFee: r.minFee ?? '',
            maxFee: r.maxFee ?? '',
            active: r.isActive,
          } as any));
        }

        if (Object.keys(patch).length) set(patch);
      } catch (e) {
        console.error('Failed to load ticket data:', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const allPrices = [...t.ticketTypes.map((x) => x.price), ...t.passes.map((x) => x.price)].filter((n) => n > 0);
  const lowest = allPrices.length ? Math.min(...allPrices) : 0;
  const highest = allPrices.length ? Math.max(...allPrices) : 0;
  const avg = allPrices.length ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0;
  const singleCount = t.ticketTypes.filter((x) => x.category === 'single').length;
  const groupCount = t.ticketTypes.filter((x) => x.category === 'group').length;
  const ticketNameOptions = t.ticketTypes.map((x) => ({ label: x.name, value: x.id }));

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 320px' }, gap: 3, alignItems: 'start' }}>
      <Box sx={{ ...{ borderRadius: `${EP.radius}px`, border: `1px solid ${EP.line}`, background: EP.surface, boxShadow: EP.shadowCard }, p: { xs: 2.5, md: 3.5 } }}>
        <StepHeading title="Tickets & Pricing" subtitle="Create ticket types, set prices, limits and sale rules for your event." />
        <Box sx={{ display: 'flex', gap: 3, borderBottom: `1px solid ${EP.line}`, mb: 3, overflowX: 'auto' }}>
          {SUBTABS.map((s) => (
            <Box key={s} onClick={() => setSub(s)} sx={{ pb: 1.2, whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem', color: sub === s ? EP.primary : EP.muted, borderBottom: sub === s ? `2px solid ${EP.primary}` : '2px solid transparent' }}>{s}</Box>
          ))}
        </Box>

        {sub === 'Ticket Types' && <TicketTypesTab t={t} set={set} eventId={eventId} ticketCategoryOptions={ticketCategoryOptions} />}
        {sub === 'Passes' && <PassesTab t={t} set={set} eventId={eventId} ddl={ddl} />}
        {sub === 'Add-ons' && <AddOnsTab t={t} set={set} ticketNameOptions={ticketNameOptions} eventId={eventId} />}
        {sub === 'Promo Codes' && <PromoTab t={t} set={set} appliesToOptions={appliesToOptions} eventId={eventId} />}
        {sub === 'Tax & Fees' && <TaxFeesTab t={t} set={set} appliesToOptions={appliesToOptions} eventId={eventId} ddl={ddl} />}
        {sub === 'Payment Settings' && <PaymentTab t={t} set={set} />}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, position: { lg: 'sticky' }, top: 16 }}>
        <SidebarCard title="Ticket Summary">
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, textAlign: 'center' }}>
            {[[singleCount, 'Single Tickets'], [groupCount, 'Group Tickets'], [t.passes.length, 'Passes']].map(([n, l], i) => (
              <Box key={i} sx={{ border: `1px solid ${EP.line}`, borderRadius: 1.5, py: 1.5 }}>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: EP.primary }}>{n}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: EP.muted }}>{l}</Typography>
              </Box>
            ))}
          </Box>
          <Typography sx={{ textAlign: 'center', fontSize: '0.72rem', color: EP.faint, mt: 1 }}>Total {t.ticketTypes.length + t.passes.length} Ticket Types</Typography>
        </SidebarCard>

        <SidebarCard title="Pricing Overview">
          {[['Lowest Price', lowest], ['Highest Price', highest], ['Average Price', avg]].map(([l, v], i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
              <Typography sx={{ fontSize: '0.82rem', color: EP.muted }}>{l}</Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{inr(v as number)}</Typography>
            </Box>
          ))}
        </SidebarCard>

        <SidebarCard title="Quick Preview">
          {[...t.ticketTypes, ...t.passes].length === 0 ? (
            <Typography sx={{ fontSize: '0.8rem', color: EP.faint, textAlign: 'center', py: 1 }}>Add tickets to preview them here.</Typography>
          ) : (
            <>
              {[...t.ticketTypes.slice(0, 3)].map((x) => (
                <Box key={x.id} sx={{ py: 1, borderBottom: `1px solid ${EP.lineSoft}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>{x.name}<Badge label={x.badge} color={x.badgeColor} /></Typography>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>{inr(x.price)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>{x.salesTo ? `Sales till ${fmtDate(x.salesTo)}` : 'On sale'}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>{x.available} available</Typography>
                  </Box>
                </Box>
              ))}
              <Button fullWidth variant="outlined" sx={{ mt: 1.5, textTransform: 'none', borderColor: EP.line, color: EP.primary, fontWeight: 600 }}>View All Tickets</Button>
            </>
          )}
        </SidebarCard>

        <TipsCard tips={[ 
          'Set early bird tickets to attract early registrations.',
          'Use group tickets to encourage bulk bookings.',
          'Add passes for multi-day events to increase sales.',
          'Review tax and payment settings before publishing.',
        ]} />
      </Box>
    </Box>
  );
};

// ===========================================================================
const TicketTypesTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void; eventId?: number; ticketCategoryOptions: { label: string; value: string }[] }> = ({ t, set, eventId, ticketCategoryOptions }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'single' | 'group'>('all');
  const blank = (): TicketType => ({ id: '', name: '', category: 'single', description: '', price: 0, available: 0, perOrderLimit: '', salesFrom: '', salesTo: '', active: true, badge: '', badgeColor: '#22C55E', additionalInfo: '', minQty: 5, maxQty: 9 });
  const [f, setF] = useState<TicketType>(blank());
  const sf = (p: Partial<TicketType>) => setF((x) => ({ ...x, ...p }));
  const rows = t.ticketTypes.filter((x) => filter === 'all' || x.category === filter);

  const save = async () => {
    if (!f.name.trim()) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (f.salesFrom) {
      const fromD = new Date(f.salesFrom);
      if (fromD < today) {
        toast.error('Sales Period - From Date cannot be in the past.');
        return;
      }
    }
    if (f.salesTo) {
      const toD = new Date(f.salesTo);
      if (toD < today) {
        toast.error('Sales Period - To Date cannot be in the past.');
        return;
      }
    }
    let savedId = f.id;
    let savedPublicId = (f as any).publicId;
    if (eventId && eventId > 0) {
      try {
        const catId = Number((f as any).ticketCategoryId ?? 0);
        const res = await ticketApi.addEditTicket({
          publicId: undefined,
          eventId,
          ticketName: f.name,
          ticketCategoryId: catId,
          description: f.description,
          price: f.price,
          availableLimit: f.available,
          perOrderLimit: f.perOrderLimit !== '' ? Number(f.perOrderLimit) : undefined,
          salesStartDate: f.salesFrom || undefined,
          salesEndDate: f.salesTo || undefined,
          displayBadge: f.badge,
          badgeColor: f.badgeColor,
          additionalInfo: f.additionalInfo,
          isActive: f.active,
          createdBy: getUserEmail(),
          createdFrom: 'WebUI',
        });
        if (res.success && res.data) {
          savedId = String(res.data.publicId);
          savedPublicId = res.data.publicId;
        }
      } catch (e) { console.error('Ticket save error:', e); }
    }
    const newF = { ...f, id: savedId || nid('tt'), publicId: savedPublicId };
    set({ ticketTypes: [...t.ticketTypes, newF] });
    setOpen(false); setF(blank());
  };

  const FilterChip: React.FC<{ id: typeof filter; label: string }> = ({ id, label }) => (
    <Box onClick={() => setFilter(id)} sx={{ px: 1.5, py: 0.6, borderRadius: 1.5, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: filter === id ? EP.primary : EP.muted, bgcolor: filter === id ? EP.primarySoft : 'transparent', border: `1px solid ${filter === id ? EP.primary + '55' : EP.line}` }}>{label}</Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FilterChip id="all" label="All Tickets" /><FilterChip id="single" label="Single Entry Tickets" /><FilterChip id="group" label="Group Tickets" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button size="small" startIcon={<SwapVertIcon />} sx={{ textTransform: 'none', color: EP.muted }}>Reorder</Button>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: EP.faint }} />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setF(blank()); setOpen(true); }} sx={{ textTransform: 'none', borderColor: EP.primary, color: EP.primary }}>Add Ticket Type</Button>
        </Box>
      </Box>
      {rows.length === 0 ? <Empty label="No ticket types yet. Add your first ticket." /> : (
        <Table head={<><Th>Ticket Type</Th><Th>Price</Th><Th>Available</Th><Th>Status</Th><Th>Action</Th></>}>
          {rows.map((x) => (
            <Box component="tr" key={x.id}>
              <Td><Typography sx={{ fontWeight: 700, fontSize: '0.84rem' }}>{x.name}<Badge label={x.badge} color={x.badgeColor} /></Typography><Typography sx={{ fontSize: '0.74rem', color: EP.muted }}>{x.description}</Typography></Td>
              <Td>{inr(x.price)}</Td>
              <Td>{x.available}{x.category === 'group' && x.minQty ? ` (min ${x.minQty})` : ''}</Td>
              <Td><Typography sx={{ color: x.active ? EP.green : EP.muted, fontWeight: 600, fontSize: '0.8rem' }}>{x.active ? 'Active' : 'Inactive'}</Typography></Td>
              <Td><RowActions onDelete={() => set({ ticketTypes: t.ticketTypes.filter((y) => y.id !== x.id) })} /></Td>
            </Box>
          ))}
        </Table>
      )}
      <Typography sx={{ fontSize: '0.72rem', color: EP.faint, mt: 1 }}>Note: Ticket sales periods are based on event timezone.</Typography>

      <AppModal open={open} onClose={() => setOpen(false)} title="Add Ticket Type" maxWidth="md"
        actions={<><Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', color: EP.muted }}>Cancel</Button><Button variant="contained" onClick={save} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>Add Ticket Type</Button></>}>
        <Typography sx={{ color: EP.muted, fontSize: '0.82rem', mb: 2 }}>Create a new ticket type and define its price, limit and sales rules.</Typography>
        <Grid cols={2}>
          <Field label="Ticket Name" required helper="Enter a name that describes this ticket."><AppInput placeholder="e.g., Early Bird" value={f.name} onChange={(e) => sf({ name: e.target.value })} /></Field>
          <Field label="Ticket Category" required helper="Select a category for this ticket.">
            <AppDropdown
              label="Category"
              options={
                ticketCategoryOptions.length > 0
                  ? ticketCategoryOptions
                  : [{ label: 'Single Entry Ticket', value: 'single' }, { label: 'Group Ticket', value: 'group' }, { label: 'Pass', value: 'pass' }]
              }
              value={String((f as any).ticketCategoryId ?? f.category)}
              onChange={(e) => sf({ ticketCategoryId: Number(e.target.value) } as any)}
            />
          </Field>
        </Grid>
        <Box sx={{ mt: 2 }}><Field label="Description (Optional)" helper="This will be shown to attendees."><AppTextarea rows={2} placeholder="Describe what this ticket includes." value={f.description} onChange={(e) => sf({ description: e.target.value })} /></Field></Box>
        <Grid cols={3} sx={{ mt: 2 }}>
          <Field label="Price (INR)" required helper="Set the price for this ticket."><AppInput type="number" placeholder="0.00" value={f.price} onChange={(e) => sf({ price: Number(e.target.value) })} slotProps={{ input: { startAdornment: <Typography sx={{ color: EP.faint, mr: 0.5 }}>₹</Typography> } } as any} /></Field>
          <Field label="Available / Limit" required helper="Total tickets available."><AppInput type="number" placeholder="e.g., 500" value={f.available} onChange={(e) => sf({ available: Number(e.target.value) })} /></Field>
          <Field label="Per Order Limit" helper="Max tickets per order."><AppInput type="number" placeholder="e.g., 10" value={f.perOrderLimit} onChange={(e) => sf({ perOrderLimit: e.target.value === '' ? '' : Number(e.target.value) })} /></Field>
        </Grid>
        {f.category === 'group' && (
          <Grid cols={2} sx={{ mt: 2 }}>
            <Field label="Min Quantity" required><AppInput type="number" value={f.minQty ?? ''} onChange={(e) => sf({ minQty: Number(e.target.value) })} /></Field>
            <Field label="Max Quantity"><AppInput type="number" value={f.maxQty ?? ''} onChange={(e) => sf({ maxQty: Number(e.target.value) })} /></Field>
          </Grid>
        )}
        <Grid cols={2} sx={{ mt: 2 }}>
          <Field label="Sales Period — From" required><AppDatePicker value={f.salesFrom} onChange={(e) => sf({ salesFrom: e.target.value })} /></Field>
          <Field label="Sales Period — To"><AppDatePicker value={f.salesTo} onChange={(e) => sf({ salesTo: e.target.value })} /></Field>
        </Grid>
        <Grid cols={2} sx={{ mt: 2 }}>
          <Field label="Display Badge (Optional)" helper="Short badge to highlight this ticket."><AppInput placeholder="e.g., Early Bird" value={f.badge} onChange={(e) => sf({ badge: e.target.value })} /></Field>
          <Field label="Badge Color (Optional)" helper="Choose a color for the badge."><ColorField value={f.badgeColor} onChange={(c) => sf({ badgeColor: c })} /></Field>
        </Grid>
        <Box sx={{ mt: 2 }}><Field label="Additional Info (Optional)" helper="Any extra info about this ticket."><AppInput placeholder="e.g., Includes access to workshops and after party." value={f.additionalInfo} onChange={(e) => sf({ additionalInfo: e.target.value })} /></Field></Box>
        <Box sx={{ mt: 1.5 }}><ToggleRow checked={f.active} onChange={(v) => sf({ active: v })} title="Active" subtitle="Inactive tickets will not be visible." /></Box>
      </AppModal>
    </>
  );
};

// ===========================================================================
const PassesTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void; eventId?: number; ddl: DDL }> = ({ t, set, eventId, ddl }) => {
  const blank = (): Pass => ({ id: '', name: '', validFrom: '', validTo: '', includes: [], price: 0, totalLimit: 0, active: true, badge: '', badgeColor: '#6C63FF', description: '' });
  const [f, setF] = useState<Pass>(blank());
  const [show, setShow] = useState(false);
  const sf = (p: Partial<Pass>) => setF((x) => ({ ...x, ...p }));
  const add = async () => {
    if (!f.name.trim()) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (f.validFrom) {
      const fromD = new Date(f.validFrom);
      if (fromD < today) {
        toast.error('Pass Validity - Start Date cannot be in the past.');
        return;
      }
    }
    if (f.validTo) {
      const toD = new Date(f.validTo);
      if (toD < today) {
        toast.error('Pass Validity - End Date cannot be in the past.');
        return;
      }
    }
    let savedId = f.id;
    let savedPublicId = (f as any).publicId;
    if (eventId && eventId > 0) {
      try {
        const res = await ticketApi.addEditPass({
          publicId: undefined,
          eventId,
          passName: f.name,
          validFrom: f.validFrom,
          validTo: f.validTo,
          price: f.price,
          totalLimit: f.totalLimit,
          includes: f.includes.join(','),
          description: f.description,
          displayBadge: f.badge,
          badgeColor: f.badgeColor,
          isActive: f.active,
          createdBy: getUserEmail(),
          createdFrom: 'WebUI',
        });
        if (res.success && res.data) {
          savedId = String(res.data.publicId);
          savedPublicId = res.data.publicId;
        }
      } catch (e) { console.error('Pass save error:', e); }
    }
    const newF = { ...f, id: savedId || nid('ps'), publicId: savedPublicId };
    set({ passes: [...t.passes, newF] }); setF(blank()); setShow(false);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box><Typography sx={{ fontWeight: 700, color: EP.primary }}>Passes</Typography><Typography sx={{ fontSize: '0.78rem', color: EP.muted }}>Create multi-day or all-access passes for your event.</Typography></Box>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShow((s) => !s)} sx={{ textTransform: 'none', borderColor: EP.primary, color: EP.primary }}>Add Pass</Button>
      </Box>
      {t.passes.length === 0 ? <Empty label="No passes yet." /> : (
        <Table min={760} head={<><Th>Pass Name</Th><Th>Valid For</Th><Th>Includes</Th><Th>Price (INR)</Th><Th>Available / Limit</Th><Th>Status</Th><Th>Action</Th></>}>
          {t.passes.map((x) => (
            <Box component="tr" key={x.id}>
              <Td><Typography sx={{ fontWeight: 600 }}>{x.name}<Badge label={x.badge} color={x.badgeColor} /></Typography></Td>
              <Td>{[fmtDate(x.validFrom), fmtDate(x.validTo)].filter(Boolean).join(' - ')}</Td>
              <Td><Typography sx={{ fontSize: '0.76rem', color: EP.muted, maxWidth: 180 }}>{x.includes.map(id => ddl.passIncludes?.find(opt => String(opt.value) === id)?.label || id).join(', ')}</Typography></Td>
              <Td>{inr(x.price)}</Td><Td>{x.totalLimit} / {x.totalLimit}</Td>
              <Td><Typography sx={{ color: x.active ? EP.green : EP.muted, fontWeight: 600, fontSize: '0.8rem' }}>{x.active ? 'Active' : 'Inactive'}</Typography></Td>
              <Td><RowActions onDelete={() => set({ passes: t.passes.filter((y) => y.id !== x.id) })} /></Td>
            </Box>
          ))}
        </Table>
      )}
      {show && (
        <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2.5, mt: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Add New Pass</Typography>
          <Grid cols={4}>
            <Field label="Pass Name" required helper="Enter a name for this pass."><AppInput placeholder="e.g. 2 Day Pass" value={f.name} onChange={(e) => sf({ name: e.target.value })} /></Field>
            <Field label="Valid From" required helper="Select the validity period."><AppDatePicker value={f.validFrom} onChange={(e) => sf({ validFrom: e.target.value })} /></Field>
            <Field label="Valid To" required><AppDatePicker value={f.validTo} onChange={(e) => sf({ validTo: e.target.value })} /></Field>
            <Field label="Price (INR)" required helper="Set the price for this pass."><AppInput type="number" placeholder="e.g., 1999" value={f.price} onChange={(e) => sf({ price: Number(e.target.value) })} /></Field>
          </Grid>
          <Grid cols={2} sx={{ mt: 2 }}>
            <Field label="Total Limit" required helper="Total passes available."><AppInput type="number" placeholder="e.g., 300" value={f.totalLimit} onChange={(e) => sf({ totalLimit: Number(e.target.value) })} /></Field>
            <Field label="Includes" required helper="Choose sessions, zones, workshops, perks etc."><MultiSelect value={f.includes} onChange={(v) => sf({ includes: v })} options={(ddl.passIncludes ?? []).map((o) => ({ label: o.label, value: String(o.value) }))} placeholder="Select what's included in this pass" /></Field>
          </Grid>
          <Box sx={{ mt: 2 }}><Field label="Description (Optional)" helper="This will be shown to attendees."><AppTextarea rows={2} placeholder="Describe what this pass includes." value={f.description} onChange={(e) => sf({ description: e.target.value })} /></Field></Box>
          <Grid cols={3} sx={{ mt: 2 }}>
            <Field label="Display Badge (Optional)" helper="Short badge to highlight this pass."><AppInput placeholder="e.g., All Access" value={f.badge} onChange={(e) => sf({ badge: e.target.value })} /></Field>
            <Field label="Badge Color (Optional)" helper="Choose a color for the badge."><ColorField value={f.badgeColor} onChange={(c) => sf({ badgeColor: c })} /></Field>
            <Field label="Status"><ToggleRow checked={f.active} onChange={(v) => sf({ active: v })} title="Active" subtitle="Inactive passes will not be visible." /></Field>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={() => setShow(false)} sx={{ textTransform: 'none', color: EP.muted }}>Cancel</Button>
            <Button variant="contained" onClick={add} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>Add Pass</Button>
          </Box>
        </Box>
      )}
    </>
  );
};

// ===========================================================================
const AddOnsTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void; ticketNameOptions: { label: string; value: string }[]; eventId?: number }> = ({ t, set, ticketNameOptions, eventId }) => {
  const blank = (): AddOn => ({ id: '', name: '', description: '', price: 0, available: 0, required: false, active: true, attachTo: [], badge: '', badgeColor: '#6C63FF' });
  const [f, setF] = useState<AddOn>(blank());
  const [show, setShow] = useState(false);
  const sf = (p: Partial<AddOn>) => setF((x) => ({ ...x, ...p }));
  const add = async () => {
    if (!f.name.trim()) return;
    let savedId = f.id;
    let savedPublicId = (f as any).publicId;
    if (eventId && eventId > 0) {
      try {
        const res = await ticketApi.addEditAddOn({
          publicId: undefined,
          eventId,
          addOnName: f.name,
          price: f.price,
          availableLimit: f.available,
          requiredTypeId: f.required ? 1 : 0,
          description: f.description,
          ticketTypeIds: f.attachTo.join(','),
          displayBadge: f.badge,
          badgeColor: f.badgeColor,
          isActive: f.active,
          createdBy: getUserEmail(),
          createdFrom: 'WebUI',
        });
        if (res.success && res.data) {
          savedId = String(res.data.publicId);
          savedPublicId = res.data.publicId;
        }
      } catch (e) { console.error('AddOn save error:', e); }
    }
    const newF = { ...f, id: savedId || nid('ao'), publicId: savedPublicId };
    set({ addOns: [...t.addOns, newF] }); setF(blank()); setShow(false);
  };

  const deleteAddOn = async (target: AddOn) => {
    if (eventId && eventId > 0 && target.id && !target.id.startsWith('ao')) {
      try {
        await ticketApi.deleteAddOn(target.id);
      } catch (e) { console.error('AddOn delete error:', e); }
    }
    set({ addOns: t.addOns.filter((y) => y.id !== target.id) });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box><Typography sx={{ fontWeight: 700, color: EP.primary }}>Add-ons</Typography><Typography sx={{ fontSize: '0.78rem', color: EP.muted }}>Add extra items or services that attendees can purchase along with their tickets.</Typography></Box>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShow((s) => !s)} sx={{ textTransform: 'none', borderColor: EP.primary, color: EP.primary }}>Add Add-on</Button>
      </Box>
      {t.addOns.length === 0 ? <Empty label="No add-ons yet." /> : (
        <Table min={760} head={<><Th>Add-on Name</Th><Th>Description</Th><Th>Price (INR)</Th><Th>Available / Limit</Th><Th>Required</Th><Th>Status</Th><Th>Action</Th></>}>
          {t.addOns.map((x) => (
            <Box component="tr" key={x.id}>
              <Td><Typography sx={{ fontWeight: 600 }}>{x.name}</Typography></Td>
              <Td><Typography sx={{ fontSize: '0.76rem', color: EP.muted }}>{x.description}</Typography></Td>
              <Td>{inr(x.price)}</Td><Td>{x.available} / {x.available}</Td>
              <Td><Typography sx={{ color: x.required ? EP.primary : EP.muted, fontWeight: 600, fontSize: '0.8rem' }}>{x.required ? 'Yes' : 'No'}</Typography></Td>
              <Td><Typography sx={{ color: x.active ? EP.green : EP.muted, fontWeight: 600, fontSize: '0.8rem' }}>{x.active ? 'Active' : 'Inactive'}</Typography></Td>
              <Td><RowActions onDelete={() => deleteAddOn(x)} /></Td>
            </Box>
          ))}
        </Table>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}><InfoOutlinedIcon sx={{ fontSize: 14, color: EP.faint }} /><Typography sx={{ fontSize: '0.72rem', color: EP.faint }}>Add-ons can be attached to selected ticket types in the settings below.</Typography></Box>
      {show && (
        <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2.5, mt: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Add New Add-on</Typography>
          <Grid cols={4}>
            <Field label="Add-on Name" required helper="Enter a name for this add-on."><AppInput placeholder="e.g., Workshop Access" value={f.name} onChange={(e) => sf({ name: e.target.value })} /></Field>
            <Field label="Price (INR)" required helper="Set the price for this add-on."><AppInput type="number" placeholder="e.g., 999.00" value={f.price} onChange={(e) => sf({ price: Number(e.target.value) })} /></Field>
            <Field label="Available / Limit" required helper="Total quantity available."><AppInput type="number" placeholder="e.g., 100" value={f.available} onChange={(e) => sf({ available: Number(e.target.value) })} /></Field>
            <Field label="Required" helper="Make this add-on mandatory."><AppDropdown label="Required" options={[{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }]} value={f.required ? 'yes' : 'no'} onChange={(e) => sf({ required: e.target.value === 'yes' })} /></Field>
          </Grid>
          <Grid cols={2} sx={{ mt: 2 }}>
            <Field label="Description (Optional)" helper="This will be shown to attendees."><AppTextarea rows={2} placeholder="Describe what this add-on includes." value={f.description} onChange={(e) => sf({ description: e.target.value })} /></Field>
            <Field label="Attach to Ticket Types" required helper="Select ticket types this add-on can be purchased with."><MultiSelect value={f.attachTo} onChange={(v) => sf({ attachTo: v })} options={ticketNameOptions.length ? ticketNameOptions : [{ label: 'All Ticket Types', value: 'all' }]} placeholder="Select ticket types" /></Field>
          </Grid>
          <Grid cols={3} sx={{ mt: 2 }}>
            <Field label="Display Badge (Optional)" helper="Short badge to highlight this add-on."><AppInput placeholder="e.g., Recommended" value={f.badge} onChange={(e) => sf({ badge: e.target.value })} /></Field>
            <Field label="Badge Color (Optional)" helper="Choose a color for the badge."><ColorField value={f.badgeColor} onChange={(c) => sf({ badgeColor: c })} /></Field>
            <Field label="Status"><ToggleRow checked={f.active} onChange={(v) => sf({ active: v })} title="Active" subtitle="Inactive add-ons will not be visible." /></Field>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={() => setShow(false)} sx={{ textTransform: 'none', color: EP.muted }}>Cancel</Button>
            <Button variant="contained" onClick={add} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>Add Add-on</Button>
          </Box>
        </Box>
      )}
    </>
  );
};

// ===========================================================================
const PromoTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void; appliesToOptions: { label: string; value: string }[]; eventId?: number }> = ({ t, set, appliesToOptions, eventId }) => {
  const blank = (): PromoCode => ({ id: '', code: '', discountType: 'percentage', discountValue: 10, appliesTo: '0', usageLimit: '', minPurchase: '', validFrom: '', validUntil: '', maxDiscount: '', description: '', active: true, badge: '' });
  const [f, setF] = useState<PromoCode>(blank());
  const [show, setShow] = useState(false);
  const sf = (p: Partial<PromoCode>) => setF((x) => ({ ...x, ...p }));
  const add = async () => {
    if (!f.code.trim()) return;
    const cleanCode = f.code.toUpperCase().replace(/\s/g, '');
    if (t.promoCodes.some((x) => x.code.toUpperCase() === cleanCode && x.id !== f.id)) {
      toast.error('This promo code already exists.');
      return;
    }
    let savedId = f.id;
    let savedPublicId = (f as any).publicId;
    if (eventId && eventId > 0) {
      try {
        const res = await ticketApi.addEditPromoCode({
          publicId: undefined,
          eventId,
          promoCode: f.code.toUpperCase().replace(/\s/g, ''),
          discountTypeId: f.discountType === 'percentage' ? 1 : 2,
          appliesToId: Number(f.appliesTo),
          discountValue: f.discountValue,
          usageLimit: f.usageLimit !== '' ? Number(f.usageLimit) : undefined,
          minPurchaseAmount: f.minPurchase !== '' ? Number(f.minPurchase) : undefined,
          maxDiscountAmount: f.maxDiscount !== '' ? Number(f.maxDiscount) : undefined,
          validFrom: f.validFrom || undefined,
          validUntil: f.validUntil || undefined,
          description: f.description,
          isActive: f.active,
          createdBy: getUserEmail(),
          createdFrom: 'WebUI',
        });
        if (res.success && res.data) {
          savedId = String(res.data.publicId);
          savedPublicId = res.data.publicId;
        }
      } catch (e) { console.error('PromoCode save error:', e); }
    }
    const newF = { ...f, id: savedId || nid('pc'), publicId: savedPublicId, code: f.code.toUpperCase().replace(/\s/g, '') };
    set({ promoCodes: [...t.promoCodes, newF] }); setF(blank()); setShow(false);
  };
  const appliesLabel = (v: string) => appliesToOptions.find((o) => o.value === v)?.label || v;

  const deletePromoCode = async (target: PromoCode) => {
    if (eventId && eventId > 0 && target.id && !target.id.startsWith('pc')) {
      try {
        await ticketApi.deletePromoCode(target.id);
      } catch (e) { console.error('PromoCode delete error:', e); }
    }
    set({ promoCodes: t.promoCodes.filter((y) => y.id !== target.id) });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box><Typography sx={{ fontWeight: 700, color: EP.primary }}>Promo Codes</Typography><Typography sx={{ fontSize: '0.78rem', color: EP.muted }}>Create discount codes to promote your event and reward your audience.</Typography></Box>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShow((s) => !s)} sx={{ textTransform: 'none', borderColor: EP.primary, color: EP.primary }}>Create Promo Code</Button>
      </Box>
      {t.promoCodes.length === 0 ? <Empty label="No promo codes yet." /> : (
        <Table min={820} head={<><Th>Promo Code</Th><Th>Discount</Th><Th>Applies To</Th><Th>Usage Limit</Th><Th>Valid From</Th><Th>Valid Until</Th><Th>Status</Th><Th>Action</Th></>}>
          {t.promoCodes.map((x) => (
            <Box component="tr" key={x.id}>
              <Td><Typography sx={{ fontWeight: 700 }}>{x.code}<Badge label={x.badge} /></Typography></Td>
              <Td><Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{x.discountType === 'percentage' ? `${x.discountValue}% OFF` : `${inr(x.discountValue)} OFF`}</Typography><Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>{x.maxDiscount ? `Up to ${inr(Number(x.maxDiscount))}` : 'All tickets'}</Typography></Td>
              <Td>{appliesLabel(x.appliesTo)}</Td>
              <Td>{x.usageLimit === '' ? 'Unlimited' : `${x.usageLimit} Uses`}</Td>
              <Td>{fmtDate(x.validFrom) || '—'}</Td>
              <Td>{fmtDate(x.validUntil) || '—'}</Td>
              <Td><Typography sx={{ color: x.active ? EP.green : EP.muted, fontWeight: 600, fontSize: '0.8rem' }}>{x.active ? 'Active' : 'Inactive'}</Typography></Td>
              <Td><RowActions onDelete={() => deletePromoCode(x)} /></Td>
            </Box>
          ))}
        </Table>
      )}
      {show && (
        <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2.5, mt: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Create New Promo Code</Typography>
          <Grid cols={4}>
            <Field helper="Enter a unique code (no spaces).">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                <Typography component="label" sx={{ fontSize: '0.82rem', fontWeight: 700, color: EP.text }}>
                  Promo Code <Box component="span" sx={{ color: EP.red, ml: 0.4 }}>*</Box>
                </Typography>
                <Button
                  onClick={() => {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let code = '';
                    let isDuplicate = true;
                    let attempts = 0;
                    while (isDuplicate && attempts < 100) {
                      let randomPart = '';
                      for (let i = 0; i < 6; i++) {
                        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      code = `PROMO-${randomPart}`;
                      isDuplicate = t.promoCodes.some((x) => x.code.toUpperCase() === code);
                      attempts++;
                    }
                    sf({ code });
                  }}
                  variant="outlined"
                  size="small"
                  startIcon={<AutoFixHighIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#cbd5e1',
                    color: EP.primary,
                    fontWeight: 600,
                    px: 1.5,
                    py: 0.25,
                    fontSize: '0.78rem',
                    borderRadius: 1.5,
                    '&:hover': {
                      borderColor: EP.primary,
                      bgcolor: 'rgba(108, 99, 255, 0.04)',
                    }
                  }}
                >
                  Generate
                </Button>
              </Box>
              <AppInput 
                placeholder="Click 'Generate' to create code" 
                value={f.code} 
                onChange={(e) => sf({ code: e.target.value })} 
                InputProps={{ readOnly: true }}
              />
            </Field>
            <Field label="Discount Type" required helper="Choose the discount type."><AppDropdown label="Type" options={[{ label: 'Percentage', value: 'percentage' }, { label: 'Fixed Amount', value: 'fixed' }]} value={f.discountType} onChange={(e) => sf({ discountType: e.target.value as PromoCode['discountType'] })} /></Field>
            <Field label="Discount Value" required helper="Enter discount value."><AppInput type="number" value={f.discountValue} onChange={(e) => sf({ discountValue: Number(e.target.value) })} slotProps={{ input: { endAdornment: <Typography sx={{ color: EP.faint }}>{f.discountType === 'percentage' ? '%' : '₹'}</Typography> } } as any} /></Field>
            <Field label="Applies To" required helper="Select ticket types this code applies to."><AppDropdown label="Applies To" options={appliesToOptions} value={f.appliesTo} onChange={(e) => sf({ appliesTo: e.target.value as string })} /></Field>
          </Grid>
          <Grid cols={4} sx={{ mt: 2 }}>
            <Field label="Usage Limit" helper="Total number of times this code can be used."><AppInput type="number" placeholder="e.g., 1000" value={f.usageLimit} onChange={(e) => sf({ usageLimit: e.target.value === '' ? '' : Number(e.target.value) })} /></Field>
            <Field label="Min Purchase (Optional)" helper="Minimum order amount to apply."><AppInput type="number" placeholder="e.g., 200" value={f.minPurchase} onChange={(e) => sf({ minPurchase: e.target.value === '' ? '' : Number(e.target.value) })} /></Field>
            <Field label="Valid From" required helper="When the code becomes active."><AppDatePicker value={f.validFrom} onChange={(e) => sf({ validFrom: e.target.value })} /></Field>
            <Field label="Valid Until" required helper="When the code expires."><AppDatePicker value={f.validUntil} onChange={(e) => sf({ validUntil: e.target.value })} /></Field>
          </Grid>
          <Grid cols={2} sx={{ mt: 2 }}>
            <Field label="Max Discount (Optional)" helper="Maximum discount per order."><AppInput type="number" placeholder="e.g., 500" value={f.maxDiscount} onChange={(e) => sf({ maxDiscount: e.target.value === '' ? '' : Number(e.target.value) })} /></Field>
            <Field label="Description (Optional)" helper="This will be shown during checkout."><AppInput placeholder="e.g., 10% off for early bird guests." value={f.description} onChange={(e) => sf({ description: e.target.value })} /></Field>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
            <ToggleRow checked={f.active} onChange={(v) => sf({ active: v })} title="Active" subtitle="Inactive codes won't be applied." />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setShow(false)} sx={{ textTransform: 'none', color: EP.muted }}>Cancel</Button>
              <Button variant="contained" onClick={add} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>Create Promo Code</Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

// ===========================================================================
const TaxFeesTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void; appliesToOptions: { label: string; value: string }[]; eventId?: number; ddl: DDL }> = ({ t, set, appliesToOptions, eventId, ddl }) => {
  const blankTax = (): TaxRule => ({ id: '', name: '', type: 'percentage', rate: 0, appliesTo: '0', includedInPrice: false, active: true, taxId: undefined });
  const [tax, setTax] = useState<TaxRule>(blankTax());
  const stx = (p: Partial<TaxRule>) => setTax((x) => ({ ...x, ...p }));
  const addTax = async () => {
    const taxId = tax.taxId;
    if (!taxId) return;
    let savedId = tax.id;
    let savedPublicId = (tax as any).publicId;
    if (eventId && eventId > 0) {
      try {
        const eventTaxRes = await ticketApi.addEventTax({
          publicId: undefined,
          eventId,
          taxId,
          appliesToId: Number(tax.appliesTo === 'all' || tax.appliesTo === '0' ? 0 : tax.appliesTo),
          isIncludedInPrice: tax.includedInPrice,
          isActive: tax.active,
          createdBy: getUserEmail(),
          createdFrom: 'WebUI',
        });
        if (eventTaxRes.success && eventTaxRes.data) {
          savedId = String(eventTaxRes.data.publicId);
          savedPublicId = eventTaxRes.data.publicId;
        }
      } catch (e) { console.error('Tax save error:', e); }
    }
    const newTax = { ...tax, id: savedId || nid('tx'), publicId: savedPublicId, taxId };
    set({ taxes: [...t.taxes, newTax] });
    setTax(blankTax());
  };

  const deleteTax = async (targetTax: TaxRule) => {
    if (eventId && eventId > 0 && targetTax.id && !targetTax.id.startsWith('tx')) {
      try {
        await ticketApi.deleteEventTax(targetTax.id);
      } catch (e) { console.error('Tax delete error:', e); }
    }
    set({ taxes: t.taxes.filter((y) => y.id !== targetTax.id) });
  };

  const [feeOpen, setFeeOpen] = useState(false);
  const blankFee = (): FeeRule => ({ id: '', name: '', type: 'percentage', amount: 0, appliesTo: 'all', chargeTo: 'buyer', includedInPrice: false, minFee: '', maxFee: '', active: true });
  const [fee, setFee] = useState<FeeRule>(blankFee());
  const sfe = (p: Partial<FeeRule>) => setFee((x) => ({ ...x, ...p }));
  const addFee = async () => {
    if (!fee.name.trim()) return;
    let savedId = fee.id;
    let savedPublicId = (fee as any).publicId;
    if (eventId && eventId > 0) {
      try {
        const eventFeeRes = await ticketApi.addFee({
          publicId: undefined,
          eventId,
          feeName: fee.name,
          feeTypeId: fee.type === 'percentage' ? 1 : 2,
          amount: fee.amount,
          appliesToId: Number(fee.appliesTo === 'all' || fee.appliesTo === '0' ? 0 : fee.appliesTo),
          chargeToId: fee.chargeTo === 'buyer' ? 1 : 2,
          isIncludedInPrice: fee.includedInPrice,
          minFee: fee.minFee !== '' ? Number(fee.minFee) : null,
          maxFee: fee.maxFee !== '' ? Number(fee.maxFee) : null,
          isActive: fee.active,
          createdBy: getUserEmail(),
          createdFrom: 'WebUI',
        });
        if (eventFeeRes.success && eventFeeRes.data) {
          savedId = String(eventFeeRes.data.publicId);
          savedPublicId = eventFeeRes.data.publicId;
        }
      } catch (e) { console.error('Fee save error:', e); }
    }
    const newFee = { ...fee, id: savedId || nid('fe'), publicId: savedPublicId };
    set({ fees: [...t.fees, newFee] });
    setFee(blankFee());
    setFeeOpen(false);
  };

  const deleteFee = async (targetFee: FeeRule) => {
    if (eventId && eventId > 0 && targetFee.id && !targetFee.id.startsWith('fe')) {
      try {
        await ticketApi.deleteFee(targetFee.id);
      } catch (e) { console.error('Fee delete error:', e); }
    }
    set({ fees: t.fees.filter((y) => y.id !== targetFee.id) });
  };

  const appliesLabel = (v: string) => appliesToOptions.find((o) => o.value === v)?.label || v;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box><Typography sx={{ fontWeight: 700, color: EP.primary }}>Tax Settings</Typography><Typography sx={{ fontSize: '0.78rem', color: EP.muted }}>Configure tax rules that will be applied to ticket sales.</Typography></Box>
      </Box>
      {t.taxes.length > 0 && (
        <Table min={720} head={<><Th>Tax Name</Th><Th>Type</Th><Th>Rate</Th><Th>Applies To</Th><Th>Included In Price</Th><Th>Status</Th><Th>Action</Th></>}>
          {t.taxes.map((x) => (
            <Box component="tr" key={x.id}>
              <Td>{x.name}</Td><Td>{x.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</Td><Td>{x.type === 'percentage' ? `${x.rate}%` : inr(x.rate)}</Td><Td>{appliesLabel(x.appliesTo)}</Td>
              <Td>{x.includedInPrice ? 'Yes' : 'No'}</Td>
              <Td><Typography sx={{ color: x.active ? EP.green : EP.muted, fontWeight: 600, fontSize: '0.8rem' }}>{x.active ? 'Active' : 'Inactive'}</Typography></Td>
              <Td><RowActions onDelete={() => deleteTax(x)} /></Td>
            </Box>
          ))}
        </Table>
      )}
      <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2.5, mt: 2 }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>Add New Tax Rule</Typography>
        <Grid cols={2}>
          <Field label="Tax" required helper="Select a tax rule.">
            <AppDropdown
              label="Tax"
              options={ddl.taxes ?? []}
              value={String(tax.taxId ?? '')}
              onChange={(e) => {
                const val = Number(e.target.value);
                const opt = ddl.taxes?.find((o) => Number(o.value) === val);
                if (opt) {
                  const match = opt.label.match(/^(.*?)\s*\((\d+(?:\.\d+)?)\%\)$/);
                  if (match) {
                    stx({ taxId: val, name: match[1], rate: Number(match[2]), type: 'percentage' });
                  } else {
                    stx({ taxId: val, name: opt.label, rate: 0, type: 'percentage' });
                  }
                }
              }}
            />
          </Field>
          <Field label="Applies To" required helper="Select what this tax applies to.">
            <AppDropdown label="Applies To" options={appliesToOptions} value={tax.appliesTo} onChange={(e) => stx({ appliesTo: e.target.value as string })} />
          </Field>
        </Grid>
        <Box sx={{ display: 'flex', gap: 6, mt: 2, flexWrap: 'wrap' }}>
          <ToggleRow checked={tax.includedInPrice} onChange={(v) => stx({ includedInPrice: v })} title="Included In Price" subtitle="Include this tax in the ticket price." />
          <ToggleRow checked={tax.active} onChange={(v) => stx({ active: v })} title="Active" subtitle="Inactive tax rules won't be applied." />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="contained" onClick={addTax} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>Add Tax Rule</Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
        <Box><Typography sx={{ fontWeight: 700, color: EP.primary }}>Additional Fees</Typography><Typography sx={{ fontSize: '0.78rem', color: EP.muted }}>Add platform or processing fees that will be applied to bookings.</Typography></Box>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setFeeOpen(true)} sx={{ textTransform: 'none', borderColor: EP.primary, color: EP.primary }}>Add Fee</Button>
      </Box>
      {t.fees.length === 0 ? <Empty label="No additional fees yet." /> : (
        <Table min={760} head={<><Th>Fee Name</Th><Th>Type</Th><Th>Amount</Th><Th>Applies To</Th><Th>Charge To</Th><Th>Status</Th><Th>Action</Th></>}>
          {t.fees.map((x) => (
            <Box component="tr" key={x.id}>
              <Td>{x.name}</Td><Td>{x.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</Td><Td>{x.type === 'percentage' ? `${x.amount}%` : inr(x.amount)}</Td><Td>{appliesLabel(x.appliesTo)}</Td><Td sx={{ textTransform: 'capitalize' }}>{x.chargeTo}</Td>
              <Td><Typography sx={{ color: x.active ? EP.green : EP.muted, fontWeight: 600, fontSize: '0.8rem' }}>{x.active ? 'Active' : 'Inactive'}</Typography></Td>
              <Td><RowActions onDelete={() => deleteFee(x)} /></Td>
            </Box>
          ))}
        </Table>
      )}

      <AppModal open={feeOpen} onClose={() => setFeeOpen(false)} title="Add Additional Fee" maxWidth="sm"
        actions={<><Button onClick={() => setFeeOpen(false)} sx={{ textTransform: 'none', color: EP.muted }}>Cancel</Button><Button variant="contained" onClick={addFee} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>Add Fee</Button></>}>
        <Typography sx={{ color: EP.muted, fontSize: '0.82rem', mb: 2 }}>Create a new fee that will be added during checkout.</Typography>
        <Grid cols={2}>
          <Field label="Fee Name" required helper="Enter a name for this fee."><AppInput placeholder="e.g., Booking Fee" value={fee.name} onChange={(e) => sfe({ name: e.target.value })} /></Field>
          <Field label="Type" required helper="Choose the fee type."><AppDropdown label="Type" options={[{ label: 'Percentage', value: 'percentage' }, { label: 'Fixed Amount', value: 'fixed' }]} value={fee.type} onChange={(e) => sfe({ type: e.target.value as FeeRule['type'] })} /></Field>
          <Field label="Amount" required helper="Enter the fee amount."><AppInput type="number" placeholder="e.g., 2.5" value={fee.amount} onChange={(e) => sfe({ amount: Number(e.target.value) })} slotProps={{ input: { startAdornment: <Typography sx={{ color: EP.faint, mr: 0.5 }}>{fee.type === 'percentage' ? '%' : '₹'}</Typography> } } as any} /></Field>
          <Field label="Applies To" required helper="Select what this fee applies to."><AppDropdown label="Applies To" options={appliesToOptions} value={fee.appliesTo} onChange={(e) => sfe({ appliesTo: e.target.value as string })} /></Field>
          <Field label="Charge To" required helper="Select who will be charged this fee."><AppDropdown label="Charge To" options={[{ label: 'Buyer', value: 'buyer' }, { label: 'Organizer', value: 'organizer' }]} value={fee.chargeTo} onChange={(e) => sfe({ chargeTo: e.target.value as FeeRule['chargeTo'] })} /></Field>
          <Field label="Included In Price"><ToggleRow checked={fee.includedInPrice} onChange={(v) => sfe({ includedInPrice: v })} title="Include this fee in the ticket price." /></Field>
          <Field label="Min Fee (Optional)" helper="Minimum fee amount to apply."><AppInput type="number" placeholder="e.g., 10.00" value={fee.minFee} onChange={(e) => sfe({ minFee: e.target.value === '' ? '' : Number(e.target.value) })} /></Field>
          <Field label="Max Fee (Optional)" helper="Maximum fee amount to apply."><AppInput type="number" placeholder="e.g., 500.00" value={fee.maxFee} onChange={(e) => sfe({ maxFee: e.target.value === '' ? '' : Number(e.target.value) })} /></Field>
        </Grid>
      </AppModal>
    </>
  );
};

// ===========================================================================
const PaymentTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void }> = ({ t, set }) => {
  const p = t.payment;
  const sp = (patch: Partial<typeof p>) => set({ payment: { ...p, ...patch } });
  const methods: { key: string; label: string; brands: string }[] = [
    { key: 'cards', label: 'Credit / Debit Cards', brands: 'VISA · MC · RuPay' }, { key: 'wallets', label: 'Wallets', brands: 'Paytm · PhonePe · GPay' },
    { key: 'upi', label: 'UPI', brands: 'UPI' }, { key: 'emi', label: 'EMI', brands: 'Bank EMI' },
    { key: 'netbanking', label: 'Net Banking', brands: 'All Banks' }, { key: 'cod', label: 'Cash on arrival / Offline', brands: '₹' },
  ];
  const card = { border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2.5, mb: 2.5 };
  return (
    <Box>
      <Typography sx={{ fontWeight: 700, color: EP.primary, mb: 0.5 }}>Payment Settings</Typography>
      <Typography sx={{ fontSize: '0.8rem', color: EP.muted, mb: 2.5 }}>Configure payment methods, currencies and checkout preferences for your event.</Typography>

      <Box sx={card}>
        <Typography sx={{ fontWeight: 700, color: EP.primary, fontSize: '0.88rem', mb: 0.5 }}>Currency & Pricing</Typography>
        <Typography sx={{ fontSize: '0.74rem', color: EP.faint, mb: 1.5 }}>Select the currency for your event and how prices are displayed.</Typography>
        <Grid cols={3}>
          <Field label="Currency" required helper="This will be the default currency for all payments."><AppDropdown label="Currency" options={[{ label: 'Indian Rupee (INR) - ₹', value: 'INR' }, { label: 'US Dollar (USD) - $', value: 'USD' }]} value={p.currency} onChange={(e) => sp({ currency: e.target.value as string })} /></Field>
          <Field label="Price Display" helper="Choose how prices are displayed to attendees.">
            <RadioGroup
              value={p.priceDisplay}
              onValueChange={(val) => sp({ priceDisplay: val as typeof p.priceDisplay })}
              className="flex flex-col gap-2 mt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="inclusive" id="priceDisplay-inclusive" />
                <label htmlFor="priceDisplay-inclusive" className="text-sm font-medium leading-none cursor-pointer select-none text-foreground">
                  Show inclusive prices (Tax &amp; fees included)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="exclusive" id="priceDisplay-exclusive" />
                <label htmlFor="priceDisplay-exclusive" className="text-sm font-medium leading-none cursor-pointer select-none text-foreground">
                  Show exclusive prices (Tax &amp; fees extra)
                </label>
              </div>
            </RadioGroup>
          </Field>
          <Field label="Rounding Option" helper="Select how amounts should be rounded."><AppDropdown label="Rounding" options={[{ label: 'Round to 2 decimal places', value: 'round2' }, { label: 'Round to nearest integer', value: 'round0' }]} value={p.rounding} onChange={(e) => sp({ rounding: e.target.value as string })} /></Field>
        </Grid>
      </Box>

      <Box sx={card}>
        <Typography sx={{ fontWeight: 700, color: EP.primary, fontSize: '0.88rem', mb: 0.5 }}>Payment Methods</Typography>
        <Typography sx={{ fontSize: '0.74rem', color: EP.faint, mb: 1.5 }}>Select the payment methods you want to accept.</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {methods.map((m) => (
            <Box key={m.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${EP.lineSoft}`, borderRadius: 1.5, px: 1.5, py: 1.25 }}>
              <Box><Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.label}</Typography><Typography sx={{ fontSize: '0.68rem', color: EP.faint }}>{m.brands}</Typography></Box>
              <ActiveSwitch checked={!!p.methods[m.key]} onChange={(v) => sp({ methods: { ...p.methods, [m.key]: v } })} />
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, p: 1.25, bgcolor: '#F5F8FF', borderRadius: 1.5 }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: EP.blue }} /><Typography sx={{ fontSize: '0.74rem', color: EP.muted }}>Payment gateways and fees can be configured in Settings &gt; Payment Gateways.</Typography>
        </Box>
      </Box>

      <Box sx={{ ...card, mb: 0 }}>
        <Typography sx={{ fontWeight: 700, color: EP.primary, fontSize: '0.88rem', mb: 0.5 }}>Checkout Preferences</Typography>
        <Typography sx={{ fontSize: '0.74rem', color: EP.faint, mb: 1.5 }}>Configure attendee checkout experience and payment behavior.</Typography>
        <Grid cols={2}>
          <Field label="Payment Mode" required helper="Authorize only or authorize & capture."><AppDropdown label="Mode" options={[{ label: 'Authorize & Capture', value: 'authorize_capture' }, { label: 'Authorize Only', value: 'authorize' }]} value={p.paymentMode} onChange={(e) => sp({ paymentMode: e.target.value as string })} /></Field>
          <Field label="Order Expiry Time" required helper="Time to hold inventory before order expires."><AppDropdown label="Expiry" options={[{ label: '15 Minutes', value: '15' }, { label: '30 Minutes', value: '30' }, { label: '60 Minutes', value: '60' }]} value={p.orderExpiry} onChange={(e) => sp({ orderExpiry: e.target.value as string })} /></Field>
        </Grid>
        <Box sx={{ display: 'flex', gap: 6, mt: 1.5, flexWrap: 'wrap' }}>
          <ToggleRow checked={p.allowPartial} onChange={(v) => sp({ allowPartial: v })} title="Allow Partial Payments" subtitle="Allow attendees to pay partially." />
          <ToggleRow checked={p.enableInvoice} onChange={(v) => sp({ enableInvoice: v })} title="Enable Invoice" subtitle="Send invoice to attendees." />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography sx={{ fontWeight: 700, color: EP.primary, fontSize: '0.88rem', mb: 1 }}>Additional Settings</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <AppCheckbox
            label="Allow attendees to save payment details for faster checkout"
            checked={p.savePaymentDetails}
            onCheckedChange={(val) => sp({ savePaymentDetails: val })}
          />
          <AppCheckbox
            label="Display terms & conditions on the payment page (Configure in Settings)"
            checked={p.showTerms}
            onCheckedChange={(val) => sp({ showTerms: val })}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Step6Tickets;
