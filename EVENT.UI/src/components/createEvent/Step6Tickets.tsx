import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Switch, Divider, Chip, Checkbox, FormControlLabel, RadioGroup, Radio, Select, MenuItem, ListItemText, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import AppInput from '../AppInput';
import AppDropdown from '../AppDropdown';
import AppTextarea from '../AppTextarea';
import AppDatePicker from '../AppDatePicker';
import AppModal from '../AppModal';
import { Badge as UIBadge } from '../ui/badge';
import { EP } from './theme';
import { Field, StepHeading, SidebarCard, TipsCard, ToggleRow, Grid } from './parts';
import { fmtDate } from './options';
import { StepProps } from './stepProps';
import { TicketType, Pass, AddOn, PromoCode, TaxRule, FeeRule, TicketsInfo } from './types';

let tidSeq = 1;
const nid = (p: string) => `${p}${tidSeq++}_${(performance.now() | 0)}`;
const inr = (n: number) => `₹ ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SUBTABS = ['Ticket Types', 'Passes', 'Add-ons', 'Promo Codes', 'Tax & Fees', 'Payment Settings'] as const;
type SubTab = typeof SUBTABS[number];

const INCLUDE_OPTIONS = ['All Sessions', 'Expo', 'Workshops', 'After Party', 'VIP Lounge', 'Priority Entry', 'Swag Kit'];
const APPLIES_OPTIONS = [{ label: 'All Ticket Types', value: 'all' }, { label: 'Single Entry Tickets', value: 'single' }, { label: 'Group Tickets', value: 'group' }, { label: 'VIP Ticket', value: 'vip' }, { label: 'Passes, Add-ons', value: 'passes_addons' }];

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
const RowActions: React.FC<{ onEdit?: () => void; onDelete: () => void }> = ({ onEdit, onDelete }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {onEdit && <IconButton size="small" onClick={onEdit}><EditOutlinedIcon fontSize="small" sx={{ color: EP.primary }} /></IconButton>}
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

export const Step6Tickets: React.FC<StepProps> = ({ draft, onChange }) => {
  const t = draft.tickets;
  const set = (p: Partial<TicketsInfo>) => onChange('tickets', { ...t, ...p });
  const [sub, setSub] = useState<SubTab>('Ticket Types');

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

        {sub === 'Ticket Types' && <TicketTypesTab t={t} set={set} />}
        {sub === 'Passes' && <PassesTab t={t} set={set} />}
        {sub === 'Add-ons' && <AddOnsTab t={t} set={set} ticketNameOptions={ticketNameOptions} />}
        {sub === 'Promo Codes' && <PromoTab t={t} set={set} />}
        {sub === 'Tax & Fees' && <TaxFeesTab t={t} set={set} />}
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
const TicketTypesTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void }> = ({ t, set }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TicketType | null>(null);
  const [filter, setFilter] = useState<'all' | 'single' | 'group'>('all');
  const blank = (): TicketType => ({ id: '', name: '', category: 'single', description: '', price: 0, available: 0, perOrderLimit: '', salesFrom: '', salesTo: '', active: true, badge: '', badgeColor: '#22C55E', additionalInfo: '', minQty: 5, maxQty: 9 });
  const [f, setF] = useState<TicketType>(blank());
  const sf = (p: Partial<TicketType>) => setF((x) => ({ ...x, ...p }));
  const rows = t.ticketTypes.filter((x) => filter === 'all' || x.category === filter);

  const save = () => {
    if (!f.name.trim()) return;
    if (editing) set({ ticketTypes: t.ticketTypes.map((x) => (x.id === editing.id ? { ...f, id: editing.id } : x)) });
    else set({ ticketTypes: [...t.ticketTypes, { ...f, id: nid('tt') }] });
    setOpen(false); setEditing(null); setF(blank());
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
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setF(blank()); setEditing(null); setOpen(true); }} sx={{ textTransform: 'none', borderColor: EP.primary, color: EP.primary }}>Add Ticket Type</Button>
        </Box>
      </Box>
      {rows.length === 0 ? <Empty label="No ticket types yet. Add your first ticket." /> : (
        <Table head={<><Th>Ticket Type</Th><Th>Price</Th><Th>Available</Th><Th>Status</Th><Th>Action</Th></>}>
          {rows.map((x) => (
            <Box component="tr" key={x.id}>
              <Td><Typography sx={{ fontWeight: 700, fontSize: '0.84rem' }}>{x.name}<Badge label={x.badge} color={x.badgeColor} /></Typography><Typography sx={{ fontSize: '0.74rem', color: EP.muted }}>{x.description}</Typography></Td>
              <Td>{inr(x.price)}</Td>
              <Td>{x.available}{x.category === 'group' && x.minQty ? ` (min ${x.minQty})` : ''}</Td>
              <Td><ActiveSwitch checked={x.active} onChange={(v) => set({ ticketTypes: t.ticketTypes.map((y) => y.id === x.id ? { ...y, active: v } : y) })} /></Td>
              <Td><RowActions onEdit={() => { setF(x); setEditing(x); setOpen(true); }} onDelete={() => set({ ticketTypes: t.ticketTypes.filter((y) => y.id !== x.id) })} /></Td>
            </Box>
          ))}
        </Table>
      )}
      <Typography sx={{ fontSize: '0.72rem', color: EP.faint, mt: 1 }}>Note: Ticket sales periods are based on event timezone.</Typography>

      <AppModal open={open} onClose={() => setOpen(false)} title="Add Ticket Type" maxWidth="md"
        actions={<><Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', color: EP.muted }}>Cancel</Button><Button variant="contained" onClick={save} sx={{ textTransform: 'none', bgcolor: EP.primary, boxShadow: 'none' }}>{editing ? 'Update Ticket Type' : 'Add Ticket Type'}</Button></>}>
        <Typography sx={{ color: EP.muted, fontSize: '0.82rem', mb: 2 }}>Create a new ticket type and define its price, limit and sales rules.</Typography>
        <Grid cols={2}>
          <Field label="Ticket Name" required helper="Enter a name that describes this ticket."><AppInput placeholder="e.g., Early Bird" value={f.name} onChange={(e) => sf({ name: e.target.value })} /></Field>
          <Field label="Ticket Category" required helper="Select a category for this ticket."><AppDropdown label="Category" options={[{ label: 'Single Entry Ticket', value: 'single' }, { label: 'Group Ticket', value: 'group' }, { label: 'Pass', value: 'pass' }]} value={f.category} onChange={(e) => sf({ category: e.target.value as TicketType['category'] })} /></Field>
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
const PassesTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void }> = ({ t, set }) => {
  const blank = (): Pass => ({ id: '', name: '', validFrom: '', validTo: '', includes: [], price: 0, totalLimit: 0, active: true, badge: '', badgeColor: '#6C63FF', description: '' });
  const [f, setF] = useState<Pass>(blank());
  const [show, setShow] = useState(false);
  const sf = (p: Partial<Pass>) => setF((x) => ({ ...x, ...p }));
  const add = () => { if (!f.name.trim()) return; set({ passes: [...t.passes, { ...f, id: nid('ps') }] }); setF(blank()); setShow(false); };

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
              <Td><Typography sx={{ fontSize: '0.76rem', color: EP.muted, maxWidth: 180 }}>{x.includes.join(', ')}</Typography></Td>
              <Td>{inr(x.price)}</Td><Td>{x.totalLimit} / {x.totalLimit}</Td>
              <Td><ActiveSwitch checked={x.active} onChange={(v) => set({ passes: t.passes.map((y) => y.id === x.id ? { ...y, active: v } : y) })} /></Td>
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
            <Field label="Includes" required helper="Choose sessions, zones, workshops, perks etc."><MultiSelect value={f.includes} onChange={(v) => sf({ includes: v })} options={INCLUDE_OPTIONS.map((o) => ({ label: o, value: o }))} placeholder="Select what's included in this pass" /></Field>
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
const AddOnsTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void; ticketNameOptions: { label: string; value: string }[] }> = ({ t, set, ticketNameOptions }) => {
  const blank = (): AddOn => ({ id: '', name: '', description: '', price: 0, available: 0, required: false, active: true, attachTo: [], badge: '', badgeColor: '#6C63FF' });
  const [f, setF] = useState<AddOn>(blank());
  const [show, setShow] = useState(false);
  const sf = (p: Partial<AddOn>) => setF((x) => ({ ...x, ...p }));
  const add = () => { if (!f.name.trim()) return; set({ addOns: [...t.addOns, { ...f, id: nid('ao') }] }); setF(blank()); setShow(false); };

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
              <Td><ActiveSwitch checked={x.required} onChange={(v) => set({ addOns: t.addOns.map((y) => y.id === x.id ? { ...y, required: v } : y) })} /></Td>
              <Td><ActiveSwitch checked={x.active} onChange={(v) => set({ addOns: t.addOns.map((y) => y.id === x.id ? { ...y, active: v } : y) })} /></Td>
              <Td><RowActions onDelete={() => set({ addOns: t.addOns.filter((y) => y.id !== x.id) })} /></Td>
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
const PromoTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void }> = ({ t, set }) => {
  const blank = (): PromoCode => ({ id: '', code: '', discountType: 'percentage', discountValue: 10, appliesTo: 'all', usageLimit: '', minPurchase: '', validFrom: '', validUntil: '', maxDiscount: '', description: '', active: true, badge: '' });
  const [f, setF] = useState<PromoCode>(blank());
  const [show, setShow] = useState(false);
  const sf = (p: Partial<PromoCode>) => setF((x) => ({ ...x, ...p }));
  const add = () => { if (!f.code.trim()) return; set({ promoCodes: [...t.promoCodes, { ...f, id: nid('pc'), code: f.code.toUpperCase().replace(/\s/g, '') }] }); setF(blank()); setShow(false); };
  const appliesLabel = (v: string) => APPLIES_OPTIONS.find((o) => o.value === v)?.label || v;

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
              <Td><ActiveSwitch checked={x.active} onChange={(v) => set({ promoCodes: t.promoCodes.map((y) => y.id === x.id ? { ...y, active: v } : y) })} /></Td>
              <Td><RowActions onDelete={() => set({ promoCodes: t.promoCodes.filter((y) => y.id !== x.id) })} /></Td>
            </Box>
          ))}
        </Table>
      )}
      {show && (
        <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2.5, mt: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>Create New Promo Code</Typography>
          <Grid cols={4}>
            <Field label="Promo Code" required helper="Enter a unique code (no spaces)."><AppInput placeholder="e.g., EARLY10" value={f.code} onChange={(e) => sf({ code: e.target.value })} /></Field>
            <Field label="Discount Type" required helper="Choose the discount type."><AppDropdown label="Type" options={[{ label: 'Percentage', value: 'percentage' }, { label: 'Fixed Amount', value: 'fixed' }]} value={f.discountType} onChange={(e) => sf({ discountType: e.target.value as PromoCode['discountType'] })} /></Field>
            <Field label="Discount Value" required helper="Enter discount value."><AppInput type="number" value={f.discountValue} onChange={(e) => sf({ discountValue: Number(e.target.value) })} slotProps={{ input: { endAdornment: <Typography sx={{ color: EP.faint }}>{f.discountType === 'percentage' ? '%' : '₹'}</Typography> } } as any} /></Field>
            <Field label="Applies To" required helper="Select ticket types this code applies to."><AppDropdown label="Applies To" options={APPLIES_OPTIONS} value={f.appliesTo} onChange={(e) => sf({ appliesTo: e.target.value as string })} /></Field>
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
const TaxFeesTab: React.FC<{ t: TicketsInfo; set: (p: Partial<TicketsInfo>) => void }> = ({ t, set }) => {
  const blankTax = (): TaxRule => ({ id: '', name: '', type: 'percentage', rate: 0, appliesTo: 'all', includedInPrice: false, active: true });
  const [tax, setTax] = useState<TaxRule>(blankTax());
  const stx = (p: Partial<TaxRule>) => setTax((x) => ({ ...x, ...p }));
  const addTax = () => { if (!tax.name.trim()) return; set({ taxes: [...t.taxes, { ...tax, id: nid('tx') }] }); setTax(blankTax()); };

  const [feeOpen, setFeeOpen] = useState(false);
  const blankFee = (): FeeRule => ({ id: '', name: '', type: 'percentage', amount: 0, appliesTo: 'all', chargeTo: 'buyer', includedInPrice: false, minFee: '', maxFee: '', active: true });
  const [fee, setFee] = useState<FeeRule>(blankFee());
  const sfe = (p: Partial<FeeRule>) => setFee((x) => ({ ...x, ...p }));
  const addFee = () => { if (!fee.name.trim()) return; set({ fees: [...t.fees, { ...fee, id: nid('fe') }] }); setFee(blankFee()); setFeeOpen(false); };
  const appliesLabel = (v: string) => APPLIES_OPTIONS.find((o) => o.value === v)?.label || v;

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
              <Td><ActiveSwitch checked={x.includedInPrice} onChange={(v) => set({ taxes: t.taxes.map((y) => y.id === x.id ? { ...y, includedInPrice: v } : y) })} /></Td>
              <Td><ActiveSwitch checked={x.active} onChange={(v) => set({ taxes: t.taxes.map((y) => y.id === x.id ? { ...y, active: v } : y) })} /></Td>
              <Td><RowActions onDelete={() => set({ taxes: t.taxes.filter((y) => y.id !== x.id) })} /></Td>
            </Box>
          ))}
        </Table>
      )}
      <Box sx={{ border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2.5, mt: 2 }}>
        <Typography sx={{ fontWeight: 700, mb: 2 }}>Add New Tax Rule</Typography>
        <Grid cols={4}>
          <Field label="Tax Name" required helper="Enter a name for this tax."><AppInput placeholder="e.g., GST" value={tax.name} onChange={(e) => stx({ name: e.target.value })} /></Field>
          <Field label="Type" required helper="Choose how tax will be calculated."><AppDropdown label="Type" options={[{ label: 'Percentage', value: 'percentage' }, { label: 'Fixed Amount', value: 'fixed' }]} value={tax.type} onChange={(e) => stx({ type: e.target.value as TaxRule['type'] })} /></Field>
          <Field label="Rate" required helper="Enter tax percentage."><AppInput type="number" placeholder="0.00" value={tax.rate} onChange={(e) => stx({ rate: Number(e.target.value) })} slotProps={{ input: { endAdornment: <Typography sx={{ color: EP.faint }}>{tax.type === 'percentage' ? '%' : '₹'}</Typography> } } as any} /></Field>
          <Field label="Applies To" required helper="Select what this tax applies to."><AppDropdown label="Applies To" options={APPLIES_OPTIONS} value={tax.appliesTo} onChange={(e) => stx({ appliesTo: e.target.value as string })} /></Field>
        </Grid>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 1.5, flexWrap: 'wrap' }}>
          <ToggleRow checked={tax.includedInPrice} onChange={(v) => stx({ includedInPrice: v })} title="Included In Price" subtitle="Include this tax in the ticket price." />
          <ToggleRow checked={tax.active} onChange={(v) => stx({ active: v })} title="Active" subtitle="Inactive taxes won't be applied." />
          <Box sx={{ flex: 1 }} />
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
              <Td><ActiveSwitch checked={x.active} onChange={(v) => set({ fees: t.fees.map((y) => y.id === x.id ? { ...y, active: v } : y) })} /></Td>
              <Td><RowActions onDelete={() => set({ fees: t.fees.filter((y) => y.id !== x.id) })} /></Td>
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
          <Field label="Applies To" required helper="Select what this fee applies to."><AppDropdown label="Applies To" options={APPLIES_OPTIONS} value={fee.appliesTo} onChange={(e) => sfe({ appliesTo: e.target.value as string })} /></Field>
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
            <RadioGroup value={p.priceDisplay} onChange={(e) => sp({ priceDisplay: e.target.value as typeof p.priceDisplay })}>
              <FormControlLabel value="inclusive" control={<Radio size="small" sx={{ '&.Mui-checked': { color: EP.primary } }} />} label={<Typography sx={{ fontSize: '0.8rem' }}>Show inclusive prices (Tax &amp; fees included)</Typography>} />
              <FormControlLabel value="exclusive" control={<Radio size="small" sx={{ '&.Mui-checked': { color: EP.primary } }} />} label={<Typography sx={{ fontSize: '0.8rem' }}>Show exclusive prices (Tax &amp; fees extra)</Typography>} />
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
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <FormControlLabel control={<Checkbox checked={p.savePaymentDetails} onChange={(e) => sp({ savePaymentDetails: e.target.checked })} sx={{ '&.Mui-checked': { color: EP.primary } }} />} label={<Typography sx={{ fontSize: '0.82rem' }}>Allow attendees to save payment details for faster checkout</Typography>} />
          <FormControlLabel control={<Checkbox checked={p.showTerms} onChange={(e) => sp({ showTerms: e.target.checked })} sx={{ '&.Mui-checked': { color: EP.primary } }} />} label={<Typography sx={{ fontSize: '0.82rem' }}>Display terms &amp; conditions on the payment page (Configure in Settings)</Typography>} />
        </Box>
      </Box>
    </Box>
  );
};

export default Step6Tickets;
