import React, { useState } from 'react';
import { Box, Typography, Divider, Button, IconButton } from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import LinkIcon from '@mui/icons-material/Link';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import AppInput from '../AppInput';
import { EP } from './theme';
import { Field, StepHeading, StepLayout, SidebarCard, Grid } from './parts';
import { fmtDate } from './options';
import { StepProps } from './stepProps';
import { MediaInfo } from './types';

// Dashed centered upload box matching the EventPro brand-asset uploaders.
const BrandUpload: React.FC<{ title: string; required?: boolean; desc: string; cta: string; hint: string; files: File[]; onChange: (f: File[]) => void; multiple?: boolean }> = ({ title, required, desc, cta, hint, files, onChange, multiple }) => {
  const has = files.length > 0;
  const preview = has
    ? ((files[0] as any).isExisting
        ? (files[0] as any).previewUrl
        : (files[0].type?.startsWith('image') ? URL.createObjectURL(files[0]) : ''))
    : '';
  return (
    <Box>
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: EP.text }}>
        {title}{required && <Box component="span" sx={{ color: EP.red, ml: 0.4 }}>*</Box>}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: EP.faint, mb: 1 }}>{desc}</Typography>
      <Box component="label" sx={{ display: 'block', position: 'relative', border: `1.5px dashed ${has ? EP.primary : EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 2.5, textAlign: 'center', cursor: 'pointer', bgcolor: has ? '#FBFAFF' : '#fff', '&:hover': { borderColor: EP.primary, bgcolor: '#FBFAFF' } }}>
        <input type="file" hidden multiple={multiple} onChange={(e) => { if (e.target.files) onChange(multiple ? [...files, ...Array.from(e.target.files)] : [e.target.files[0]]); }} />
        {preview ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
            <Box component="img" src={preview} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }} noWrap>{files[0].name}</Typography>
            <IconButton size="small" onClick={(e) => { e.preventDefault(); onChange([]); }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
          </Box>
        ) : (
          <>
            <FileUploadOutlinedIcon sx={{ color: EP.faint, fontSize: 22 }} />
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: EP.text, mt: 0.5 }}>{cta}</Typography>
            <Typography sx={{ fontSize: '0.7rem', color: EP.faint }}>{hint}</Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

const ColorSwatch: React.FC<{ label?: string; required?: boolean; value: string; onChange: (v: string) => void }> = ({ label, required, value, onChange }) => (
  <Box>
    {label && <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: EP.text, mb: 0.75 }}>{label}{required && <Box component="span" sx={{ color: EP.red, ml: 0.4 }}>*</Box>}</Typography>}
    <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, px: 1, py: 0.5, gap: 1 }}>
      <Box component="label" sx={{ position: 'relative', width: 26, height: 26, borderRadius: 0.75, bgcolor: value, border: `1px solid ${EP.line}`, cursor: 'pointer', flexShrink: 0 }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
      </Box>
      <Box component="input" value={value} onChange={(e: any) => onChange(e.target.value)} sx={{ border: 'none', outline: 'none', fontSize: '0.85rem', color: EP.text, width: '100%', bgcolor: 'transparent' }} />
    </Box>
  </Box>
);

export const Step7Media: React.FC<StepProps> = ({ draft, onChange }) => {
  const m = draft.media;
  const set = (p: Partial<MediaInfo>) => onChange('media', { ...m, ...p });
  const [galleryTab, setGalleryTab] = useState<'Image Gallery' | 'Documents' | 'Videos' | 'Audio'>('Image Gallery');
  const coverUrl = m.coverFile[0]
    ? ((m.coverFile[0] as any).isExisting ? (m.coverFile[0] as any).previewUrl : URL.createObjectURL(m.coverFile[0]))
    : '';
  const logoUrl = m.logoFile[0]
    ? ((m.logoFile[0] as any).isExisting ? (m.logoFile[0] as any).previewUrl : URL.createObjectURL(m.logoFile[0]))
    : '';

  return (
    <StepLayout
      main={
        <>
          <StepHeading title="Media & Branding" subtitle="Customize your event's visual identity and add media to create a strong impression." />

          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.92rem', mb: 2 }}>Brand Identity</Typography>
          <Grid cols={2}>
            <BrandUpload title="Event Logo" required desc="Upload your event logo. Recommended size: 512x512px" cta="Upload Logo" hint="PNG, JPG or SVG (Max. 2MB)" files={m.logoFile} onChange={(f) => set({ logoFile: f })} />
            <BrandUpload title="Cover Image" required desc="Upload a cover image for your event. Recommended size: 1920x600px" cta="Upload Cover Image" hint="PNG, JPG or WEBP (Max. 5MB)" files={m.coverFile} onChange={(f) => set({ coverFile: f })} />
            <BrandUpload title="Favicon" desc="Upload a favicon for browser tab. Recommended size: 32x32px" cta="Upload Favicon" hint="ICO, PNG (Max. 1MB)" files={m.faviconFile} onChange={(f) => set({ faviconFile: f })} />
            <BrandUpload title="Event Banner" desc="Upload an additional banner for promotion or social sharing." cta="Upload Banner" hint="PNG, JPG or WEBP (Max. 5MB)" files={m.bannerFile} onChange={(f) => set({ bannerFile: f })} />
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.92rem', mb: 0.5 }}>Brand Colors</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: EP.muted, mb: 2 }}>Choose primary and secondary colors for your event.</Typography>
          <Grid cols={2}>
            <Box>
              <Grid cols={2}>
                <ColorSwatch label="Primary Color" required value={m.primaryColor} onChange={(v) => set({ primaryColor: v })} />
                <ColorSwatch label="Secondary Color" value={m.secondaryColor} onChange={(v) => set({ secondaryColor: v })} />
              </Grid>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: EP.text, mb: 0.75 }}>Brand Gradient <Box component="span" sx={{ color: EP.faint, fontWeight: 400 }}>(Optional)</Box></Typography>
              <Typography sx={{ fontSize: '0.72rem', color: EP.faint, mb: 0.75 }}>Select a gradient to use across your event materials.</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: `1px solid ${EP.line}`, borderRadius: `${EP.radiusSm}px`, p: 0.5, mb: 1 }}>
                <Box sx={{ flex: 1, height: 26, borderRadius: 0.75, background: `linear-gradient(90deg, ${m.gradientFrom}, ${m.gradientTo})` }} />
                <KeyboardArrowDownIcon sx={{ color: EP.faint }} />
              </Box>
              <Grid cols={2}>
                <ColorSwatch value={m.gradientFrom} onChange={(v) => set({ gradientFrom: v })} />
                <ColorSwatch value={m.gradientTo} onChange={(v) => set({ gradientTo: v })} />
              </Grid>
            </Box>
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.92rem', mb: 0.5 }}>Event Assets</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: EP.muted, mb: 1.5 }}>Add media assets to showcase your event across different channels.</Typography>
          <Box sx={{ display: 'flex', gap: 3, borderBottom: `1px solid ${EP.line}`, mb: 2 }}>
            {(['Image Gallery', 'Documents', 'Videos', 'Audio'] as const).map((g) => (
              <Box key={g} onClick={() => setGalleryTab(g)} sx={{ pb: 1, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: galleryTab === g ? EP.primary : EP.muted, borderBottom: galleryTab === g ? `2px solid ${EP.primary}` : '2px solid transparent' }}>{g}</Box>
            ))}
          </Box>
          <Box component="label" sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, border: `1.5px dashed ${EP.line}`, borderRadius: `${EP.radiusSm}px`, py: 2.5, cursor: 'pointer', '&:hover': { borderColor: EP.primary, bgcolor: '#FBFAFF' } }}>
            <input 
              type="file" 
              hidden 
              multiple 
              accept={
                galleryTab === 'Image Gallery' ? 'image/*' :
                galleryTab === 'Documents' ? '.pdf,.doc,.docx,.xls,.xlsx,.txt' :
                galleryTab === 'Videos' ? 'video/*' :
                galleryTab === 'Audio' ? 'audio/*' :
                '*'
              }
              onChange={(e) => {
                if (!e.target.files) return;
                const newFiles = Array.from(e.target.files);
                if (galleryTab === 'Image Gallery') {
                  set({ galleryFiles: [...m.galleryFiles, ...newFiles] });
                } else if (galleryTab === 'Documents') {
                  set({ documentFiles: [...m.documentFiles, ...newFiles] });
                } else if (galleryTab === 'Videos') {
                  set({ videoFiles: [...(m.videoFiles || []), ...newFiles] });
                } else if (galleryTab === 'Audio') {
                  set({ audioFiles: [...(m.audioFiles || []), ...newFiles] });
                }
              }} 
            />
            <FileUploadOutlinedIcon sx={{ color: EP.faint }} />
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>Drag & drop files here or click to browse</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: EP.faint }}>
                {
                  galleryTab === 'Image Gallery' ? 'PNG, JPG, WEBP (Max. 10MB each)' :
                  galleryTab === 'Documents' ? 'PDF, DOC, DOCX, XLS, XLSX, TXT (Max. 10MB each)' :
                  galleryTab === 'Videos' ? 'MP4, WEBM, OGG, MOV (Max. 50MB each)' :
                  'MP3, WAV, AAC (Max. 20MB each)'
                }
              </Typography>
            </Box>
            <Button size="small" variant="outlined" startIcon={<LinkIcon />} onClick={(e) => e.preventDefault()} sx={{ position: 'absolute', right: 12, textTransform: 'none', borderColor: EP.line, color: EP.text }}>Add from URL</Button>
          </Box>

          {/* 1. Image Gallery View */}
          {galleryTab === 'Image Gallery' && m.galleryFiles.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5, mt: 1.5 }}>
              {m.galleryFiles.map((f, i) => (
                <Box key={i} sx={{ position: 'relative', paddingTop: '64%', borderRadius: 1, overflow: 'hidden', border: `1px solid ${EP.line}` }}>
                  <Box component="img" src={(f as any).isExisting ? (f as any).previewUrl : URL.createObjectURL(f)} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <IconButton size="small" onClick={() => set({ galleryFiles: m.galleryFiles.filter((_, j) => j !== i) })} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: '#fff', p: 0.25, '&:hover': { bgcolor: '#fff' } }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                </Box>
              ))}
            </Box>
          )}

          {/* 2. Documents View */}
          {galleryTab === 'Documents' && m.documentFiles.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mt: 1.5 }}>
              {m.documentFiles.map((f, i) => (
                <Box key={i} sx={{ position: 'relative', display: 'flex', alignItems: 'center', p: 1.5, border: `1px solid ${EP.line}`, borderRadius: 1, bgcolor: '#F8F9FA' }}>
                  <Box component="span" sx={{ fontSize: '1.8rem', mr: 1.5 }}>📄</Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: EP.text }} noWrap>
                      {(f as any).isExisting ? (
                        <Box component="a" href={(f as any).previewUrl} target="_blank" rel="noopener noreferrer" sx={{ color: EP.primary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                          {f.name}
                        </Box>
                      ) : f.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: EP.faint }}>
                      {(f as any).isExisting ? 'Existing Document' : 'New Document'}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => set({ documentFiles: m.documentFiles.filter((_, j) => j !== i) })} sx={{ ml: 1 }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                </Box>
              ))}
            </Box>
          )}

          {/* 3. Videos View */}
          {galleryTab === 'Videos' && (m.videoFiles || []).length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mt: 1.5 }}>
              {(m.videoFiles || []).map((f, i) => {
                const videoSrc = (f as any).isExisting ? (f as any).previewUrl : URL.createObjectURL(f);
                return (
                  <Box key={i} sx={{ position: 'relative', border: `1px solid ${EP.line}`, borderRadius: 1, overflow: 'hidden', bgcolor: '#000', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                      <Box component="video" controls src={videoSrc} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Box>
                    <Box sx={{ p: 1, bgcolor: '#fff', borderTop: `1px solid ${EP.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: EP.text, flex: 1, mr: 1 }} noWrap>{f.name}</Typography>
                      <IconButton size="small" onClick={() => set({ videoFiles: (m.videoFiles || []).filter((_, j) => j !== i) })}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* 4. Audio View */}
          {galleryTab === 'Audio' && (m.audioFiles || []).length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
              {(m.audioFiles || []).map((f, i) => {
                const audioSrc = (f as any).isExisting ? (f as any).previewUrl : URL.createObjectURL(f);
                return (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: `1px solid ${EP.line}`, borderRadius: 1, bgcolor: '#F8F9FA' }}>
                    <Box component="span" sx={{ fontSize: '1.8rem' }}>🎵</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: EP.text, mb: 0.5 }} noWrap>{f.name}</Typography>
                      <Box component="audio" controls src={audioSrc} sx={{ width: '100%', height: 32 }} />
                    </Box>
                    <IconButton size="small" onClick={() => set({ audioFiles: (m.audioFiles || []).filter((_, j) => j !== i) })}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                );
              })}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />
          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.92rem', mb: 0.5 }}>Social Media Preview</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: EP.muted, mb: 2 }}>Customize how your event looks when shared on social platforms.</Typography>
          <Grid cols={3}>
            <Field label="Share Title"><AppInput value={m.shareTitle} placeholder={draft.basic.eventName || 'Annual Tech Conference 2025'} onChange={(e) => set({ shareTitle: e.target.value })} /></Field>
            <Field label="Share Description"><AppInput value={m.shareDescription} placeholder="Join industry leaders and innovators at..." onChange={(e) => set({ shareDescription: e.target.value })} /></Field>
            <BrandUpload title="Share Image" desc="" cta="Upload Image" hint="Recommended size: 1200x630px" files={m.shareImageFile} onChange={(f) => set({ shareImageFile: f })} />
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Typography sx={{ color: EP.primary, fontWeight: 700, fontSize: '0.92rem', mb: 0.5 }}>Social Links</Typography>
          <Typography sx={{ fontSize: '0.78rem', color: EP.muted, mb: 2 }}>Add your social profiles (optional) so they can be displayed on the event page.</Typography>
          <Grid cols={3}>
            <Field label="Website"><AppInput value={m.websiteLink || ''} placeholder="https://" onChange={(e) => set({ websiteLink: e.target.value })} /></Field>
            <Field label="Facebook"><AppInput value={m.facebookLink || ''} placeholder="https://facebook.com/yourpage" onChange={(e) => set({ facebookLink: e.target.value })} /></Field>
            <Field label="Instagram"><AppInput value={m.instagramLink || ''} placeholder="https://instagram.com/yourpage" onChange={(e) => set({ instagramLink: e.target.value })} /></Field>
            <Field label="Twitter"><AppInput value={m.twitterLink || ''} placeholder="https://twitter.com/yourprofile" onChange={(e) => set({ twitterLink: e.target.value })} /></Field>
            <Field label="YouTube"><AppInput value={m.youtubeLink || ''} placeholder="https://youtube.com/channel/..." onChange={(e) => set({ youtubeLink: e.target.value })} /></Field>
            <Field label="LinkedIn"><AppInput value={m.linkedInLink || ''} placeholder="https://linkedin.com/company/..." onChange={(e) => set({ linkedInLink: e.target.value })} /></Field>
            <Field label="Pinterest"><AppInput value={m.pintrestLink || ''} placeholder="https://pinterest.com/yourpage" onChange={(e) => set({ pintrestLink: e.target.value })} /></Field>
          </Grid>
        </>
      }
      rail={
        <>
          <SidebarCard title="Branding Preview">
            <Box sx={{ borderRadius: `${EP.radiusSm}px`, overflow: 'hidden', border: `1px solid ${EP.line}` }}>
              <Box sx={{ height: 130, background: coverUrl ? `url(${coverUrl}) center/cover` : `linear-gradient(135deg, ${m.gradientFrom}, ${m.gradientTo})`, position: 'relative' }}>
                <Box sx={{ position: 'absolute', bottom: -22, left: 16, width: 52, height: 52, borderRadius: 2, bgcolor: m.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', overflow: 'hidden' }}>
                  {logoUrl ? <Box component="img" src={logoUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <CalendarMonthOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />}
                </Box>
              </Box>
              <Box sx={{ p: 2, pt: 3.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{m.shareTitle || draft.basic.eventName || 'Annual Tech Conference 2025'}</Typography>
                <Typography sx={{ fontSize: '0.74rem', color: EP.muted, mt: 0.25 }}>
                  {fmtDate(draft.datetime.startDate) || '28 Jun 2025'}{draft.venue.city ? ` • ${draft.venue.city}` : ' • Bengaluru, India'}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', mt: 1.5 }}>About This Event</Typography>
                <Typography sx={{ fontSize: '0.76rem', color: EP.muted, mt: 0.5 }}>
                  {m.shareDescription || draft.basic.shortDescription || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', mt: 1.5, mb: 0.5 }}>Brand Colors</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: m.primaryColor }} />
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: m.secondaryColor }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.78rem' }}>Media Gallery ({m.galleryFiles.length})</Typography>
                  {m.galleryFiles.length > 0 && <Typography sx={{ fontSize: '0.74rem', color: EP.primary, fontWeight: 600, cursor: 'pointer' }}>View All</Typography>}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75, mt: 0.75 }}>
                  {(m.galleryFiles.length ? m.galleryFiles.slice(0, 4) : [null, null, null, null]).map((f, i) => (
                    <Box key={i} sx={{ paddingTop: '100%', position: 'relative', borderRadius: 1, overflow: 'hidden', bgcolor: '#EEF0F4' }}>
                      {f && <Box component="img" src={(f as any).isExisting ? (f as any).previewUrl : URL.createObjectURL(f)} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </SidebarCard>

          <Box sx={{ borderRadius: `${EP.radius}px`, border: `1px solid ${EP.line}`, p: 2.5, bgcolor: '#FBFAFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CheckIcon sx={{ color: EP.primary, fontSize: 18 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: EP.text }}>Tips for Best Results</Typography>
            </Box>
            {['Use a high-resolution logo and cover image for best visibility.', 'Ensure your brand colors have good contrast.', 'Add eye-catching images that reflect your event.', 'Keep file sizes optimized for faster loading.', 'Use images with no copyright restrictions.'].map((t) => (
              <Box key={t} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 0.5 }}>
                <CheckIcon sx={{ fontSize: 15, color: EP.green, mt: 0.2 }} />
                <Typography sx={{ fontSize: '0.78rem', color: EP.text }}>{t}</Typography>
              </Box>
            ))}
          </Box>
        </>
      }
    />
  );
};

export default Step7Media;
