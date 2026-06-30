import { EventDraft, createEmptyDraft } from './types';

export const normalizeImagePath = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  let clean = path;
  if (clean.startsWith('~')) {
    clean = clean.substring(1);
  }
  clean = clean.replace(/\\/g, '/');
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }
  return clean;
};

// Parse time strings to HH:MM (24h). Handles "HH:MM", "HH:MM:SS", and "hh:mm:ss AM/PM".
export const parseToTime = (s: string): string => {
  if (!s) return '';
  const str = String(s).trim();
  // AM/PM pattern
  const ampm = str.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*(AM|PM)/i);
  if (ampm) {
    const timePart = ampm[1];
    const ap = ampm[2].toUpperCase();
    const parts = timePart.split(':');
    let hh = Number(parts[0]);
    const mm = parts[1];
    if (ap === 'PM' && hh !== 12) hh += 12;
    if (ap === 'AM' && hh === 12) hh = 0;
    return `${String(hh).padStart(2, '0')}:${mm}`;
  }
  // HH:MM or HH:MM:SS
  const hm = str.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/);
  if (hm) return hm[1].padStart(5, '0');
  // Try Date parse
  const dt = new Date(str);
  if (!isNaN(dt.getTime())) return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  return '';
};

// Combine an ISO date (yyyy-mm-dd) and a HH:mm time into a Date ISO string.
const combine = (date: string, time: string): string | null => {
  if (!date) return null;
  // Prevent out of range years (SQL Server DATETIME starts from 1753)
  const yearMatch = date.match(/^(\d{4})/);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    if (year < 1753) return null;
  }
  const parsed = parseToTime(time);
  const t = parsed || '00:00';
  return `${date}T${t}:00`;
};

// Format 24h time string (HH:MM or HH:MM:SS) to 12h AM/PM format (e.g. "09:00 AM")
const formatToTime12 = (v: string): string => {
  if (!v) return '';
  const timeStr = v.substring(0, 5); // get HH:MM
  const parts = timeStr.split(':');
  if (parts.length !== 2) return v;
  let hh = Number(parts[0]);
  const mm = parts[1];
  const ampm = hh < 12 ? 'AM' : 'PM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
};

// Parse various date string formats (ISO yyyy-mm-dd or MM/DD/YYYY or full datetime)
const parseToISODate = (s: string): string => {
  if (!s) return '';
  const str = String(s).trim();
  // ISO-like yyyy-mm-dd
  const isoMatch = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  // MM/DD/YYYY or M/D/YYYY
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) {
    const mm = m[1].padStart(2, '0');
    const dd = m[2].padStart(2, '0');
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  // fallback to Date parse
  const dt = new Date(str);
  if (!isNaN(dt.getTime())) {
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
};

const FORMAT_TO_TYPE: Record<string, number> = { physical: 1, virtual: 2, hybrid: 3 };
const TYPE_TO_FORMAT: Record<number, EventDraft['basic']['eventFormat']> = { 1: 'physical', 2: 'virtual', 3: 'hybrid' };

// Lowest price across ticket types + passes (used for the legacy TicketPrice column).
const lowestPrice = (d: EventDraft): number => {
  const prices = [...d.tickets.ticketTypes.map((x) => x.price), ...d.tickets.passes.map((x) => x.price)].filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : 0;
};

// ---------------------------------------------------------------------------
// Draft -> EventRequest payload accepted by /api/events.
//
// Table responsibility:
//   Tracket_Master_Event      ← event header (Step-1 + summary dates)
//   Tracket_Master_Event_Slot ← ALL date & time detail (Step-2)
//
// The C# layer serialises this object with JsonConvert.SerializeObject
// (PascalCase), which the SP reads via OPENJSON PascalCase keys.
// ---------------------------------------------------------------------------
const getAssetTypeForMapping = (assetName: string, assetCode: string): string => {
  const name = String(assetName || '').toLowerCase();
  const code = String(assetCode || '').toLowerCase();
  if (name.includes('booth') || code === 'b') return 'booth';
  if (name.includes('stage') || code === 's') return 'stage';
  if (name.includes('lounge') || code === 'l') return 'lounge';
  if (name.includes('table') || code === 't') return 'table_round';
  if (name.includes('chair') || name.includes('seat') || code === 'c') return 'chair';
  if (name.includes('entrance') || name.includes('login')) return 'entrance';
  if (name.includes('exit') || name.includes('logout')) return 'exit';
  if (name.includes('emerg')) return 'emergency';
  if (name.includes('wall')) return 'wall';
  if (name.includes('door')) return 'door';
  if (name.includes('column')) return 'column';
  if (name.includes('food') || name.includes('canteen')) return 'foodcourt';
  if (name.includes('restroom') || name.includes('washroom') || name.includes('toilet')) return 'restroom';
  if (name.includes('info')) return 'infodesk';
  if (name.includes('registr')) return 'registration';
  if (name.includes('storage') || name.includes('store')) return 'storage';
  if (name.includes('sofa') || name.includes('couch')) return 'sofa';
  if (name.includes('counter')) return 'counter';
  return 'booth';
};

export const draftToEventRequest = (d: EventDraft, extra: Record<string, any> = {}, dbComponents: any[] = []) => {
  // completedSteps stays inside MetaJson only (not a DB column).
  const { completedSteps, ...restExtra } = extra;

  const assetItems: any[] = [];
  const components: any[] = [];

  const rawAssetItems = d.details?.assetItems || [];
  rawAssetItems.forEach((item: any) => {
    const isBookableAsset = item.assetId !== undefined && item.assetId !== null && item.assetId !== '' && !isNaN(Number(item.assetId)) && Number(item.assetId) > 0;
    
    if (isBookableAsset) {
      assetItems.push({
        assetId: Number(item.assetId),
        itemId: item.itemId,
        label: item.label,
        price: Number(item.price || 0),
        status: item.status || 'Available',
        rowName: item.rowName || '',
        columnNo: Number(item.columnNo || 0),
        x: Number(item.x || 0),
        y: Number(item.y || 0),
        w: Number(item.w || 0),
        h: Number(item.h || 0),
        rotation: Number(item.rotation || 0),
        type: item.type || '',
        zoneAssetId: item.zoneAssetId ? Number(item.zoneAssetId) : null,
      });
    } else {
      const matchedDbComp = dbComponents.find((c: any) => {
        const itemTypeLower = String(item.type || '').toLowerCase();
        const compCodeLower = String(c.componentCode || '').toLowerCase();
        const compNameLower = String(c.componentName || '').toLowerCase();
        
        if (itemTypeLower === compCodeLower) return true;
        if (compNameLower.includes(itemTypeLower) || itemTypeLower.includes(compNameLower)) return true;
        
        const mappedType = getAssetTypeForMapping(c.componentName, c.componentCode).toLowerCase();
        if (mappedType === itemTypeLower) return true;
        
        return false;
      });

      const compDbId = matchedDbComp ? Number(matchedDbComp.componentId) : null;

      components.push({
        itemId: item.itemId,
        name: matchedDbComp ? matchedDbComp.componentName : (item.label || item.type || 'Component'),
        type: item.type || 'component',
        assetId: compDbId,
        x: Number(item.x || 0),
        y: Number(item.y || 0),
        w: Number(item.w || 0),
        h: Number(item.h || 0),
        rotation: Number(item.rotation || 0),
        allowBooking: matchedDbComp ? !!matchedDbComp.allowBooking : false,
        price: Number(item.price || (matchedDbComp ? matchedDbComp.defaultPrice : 0)),
        zIndex: matchedDbComp ? Number(matchedDbComp.zIndex || 0) : 0,
        defaultColor: item.color || (matchedDbComp ? matchedDbComp.defaultColor : '#B6C2D9'),
        showLabel: matchedDbComp ? !!matchedDbComp.showLabel : true,
      });
    }
  });

  // Make sure the active zone's current state is saved in the zones dictionary
  const zonesDict = { ...(d.details?.zones || {}) };
  if (d.details?.zoneId) {
    zonesDict[Number(d.details.zoneId)] = {
      assetItems: rawAssetItems,
      rows: d.details.rows || 5,
      columns: d.details.columns || 5,
      arrangementType: d.details.arrangementType || '',
      assetId: d.details.assetId || '',
    };
  }

  const detailsPayload = {
    ...d.details,
    assetItems,
    components,
    zones: zonesDict,
  };

  const meta = {
    schema: 'eventpro.v1',
    basic: d.basic,
    datetime: d.datetime,
    venue: d.venue,
    details: detailsPayload,
    organizer: d.organizer,
    tickets: d.tickets,
    media: {
      primaryColor: d.media.primaryColor,
      secondaryColor: d.media.secondaryColor,
      gradientFrom: d.media.gradientFrom,
      gradientTo: d.media.gradientTo,
      shareTitle: d.media.shareTitle,
      shareDescription: d.media.shareDescription,
      // Save social links in meta as well
      websiteLink: d.media.websiteLink || '',
      facebookLink: d.media.facebookLink || '',
      instagramLink: d.media.instagramLink || '',
      twitterLink: d.media.twitterLink || '',
      youtubeLink: d.media.youtubeLink || '',
      linkedInLink: d.media.linkedInLink || '',
      pintrestLink: d.media.pintrestLink || '',
    },
    publish: d.publish,
    completedSteps: completedSteps ?? [],
  };

  // Collect all existing files from media tab that were NOT re-uploaded
  const docsList: any[] = [];
  if (d.media.faviconFile) {
    d.media.faviconFile.filter((f: any) => f.isExisting).forEach((f: any) => {
      docsList.push({ documentName: f.name, relativePath: f.previewUrl, isPrimary: false, displayOrder: 0, thumbnailPath: '' });
    });
  }
  if (d.media.bannerFile) {
    d.media.bannerFile.filter((f: any) => f.isExisting).forEach((f: any) => {
      docsList.push({ documentName: f.name, relativePath: f.previewUrl, isPrimary: false, displayOrder: 0, thumbnailPath: '' });
    });
  }
  if (d.media.galleryFiles) {
    d.media.galleryFiles.filter((f: any) => f.isExisting).forEach((f: any) => {
      docsList.push({ documentName: f.name, relativePath: f.previewUrl, isPrimary: false, displayOrder: 0, thumbnailPath: '' });
    });
  }
  if (d.media.documentFiles) {
    d.media.documentFiles.filter((f: any) => f.isExisting).forEach((f: any) => {
      docsList.push({ documentName: f.name, relativePath: f.previewUrl, isPrimary: false, displayOrder: 0, thumbnailPath: '' });
    });
  }
  if (d.media.videoFiles) {
    d.media.videoFiles.filter((f: any) => f.isExisting).forEach((f: any) => {
      docsList.push({ documentName: f.name, relativePath: f.previewUrl, isPrimary: false, displayOrder: 0, thumbnailPath: '' });
    });
  }
  if (d.media.audioFiles) {
    d.media.audioFiles.filter((f: any) => f.isExisting).forEach((f: any) => {
      docsList.push({ documentName: f.name, relativePath: f.previewUrl, isPrimary: false, displayOrder: 0, thumbnailPath: '' });
    });
  }
  if ((d.media as any).shareImageFile) {
    ((d.media as any).shareImageFile as any[]).filter((f: any) => f.isExisting).forEach((f: any) => {
      docsList.push({ documentName: f.name, relativePath: f.previewUrl, isPrimary: false, displayOrder: 0, thumbnailPath: '' });
    });
  }

  return {
    // ── Event identity ──────────────────────────────────────────────────
    eventId: d.eventId,
    eventRId: d.eventRId,

    // ── Step-1 → Tracket_Master_Event ───────────────────────────────────
    eventName: d.basic.eventName,
    eventCode: (d.basic.slug || d.basic.eventName).toUpperCase().slice(0, 90),
    categoryId: d.basic.categoryId === '' ? 0 : Number(d.basic.categoryId),
    eventSubCategoryId: d.basic.eventSubCategoryId === '' ? null : Number(d.basic.eventSubCategoryId),
    about: d.basic.about,
    description: d.basic.shortDescription,
    shortDescription: d.basic.shortDescription,
    termsAndConditions: '',
    slug: d.basic.slug,
    seoTitle: d.media.shareTitle || d.basic.eventName,
    seoDescription: d.media.shareDescription || d.basic.shortDescription,
    seoKeywords: d.basic.keywords,
    tags: d.basic.keywords,
    eventType: d.basic.eventFormat ? FORMAT_TO_TYPE[d.basic.eventFormat] : (d.basic.eventType === '' ? 1 : Number(d.basic.eventType)),
    listingType: 1,
    bookingType: lowestPrice(d) > 0 ? 2 : 1,
    isFree: lowestPrice(d) === 0,
    isPublic: d.basic.eventStatus !== 'draft',
    isPublishActive: d.publish.publishOption === 'now',
    currency: d.tickets.payment.currency,
    ticketPrice: lowestPrice(d),
    capacity: d.basic.expectedAttendance === '' ? (d.venue.venueCapacity || 0) : Number(d.basic.expectedAttendance),
    status: d.basic.eventStatus === 'published' ? 1 : 0,
    // Step-1 extras → Event table columns
    tagline: (d.basic as any).tagline ?? '',
    purpose: (d.basic as any).purpose ?? '',
    targetAudience: (d.basic as any).targetAudience ?? '',

    // ── StartDate / EndDate summary → Tracket_Master_Event ──────────────
    startDate: combine(d.datetime.startDate, d.datetime.startTime),
    endDate: combine(d.datetime.endDate, d.datetime.endTime),

    // ── Step-2 Date & Time detail → Tracket_Master_Event_Slot (via SP) ──
    dateTimeMode: d.datetime.mode,
    timezone: d.datetime.timezone,
    durationDays: (d.datetime as any).durationDays ?? null,
    durationHours: (d.datetime as any).durationHours ?? null,
    durationMinutes: (d.datetime as any).durationMinutes ?? null,
    allDay: (d.datetime as any).allDay ?? false,
    showCountdown: (d.datetime as any).showCountdown ?? true,
    visibilityStartDate: (d.datetime as any).visibilityStartDate ?? '',
    visibilityStartTime: (d.datetime as any).visibilityStartTime ?? '',
    setupStartTime: (d.datetime as any).setupStartTime ?? '',
    teardownEndTime: (d.datetime as any).teardownEndTime ?? '',
    recurrenceFrequency: (d.datetime as any).recurrenceFrequency ?? '',
    recurrenceInterval: (d.datetime as any).recurrenceInterval ?? 1,
    recurrenceEndDate: (d.datetime as any).recurrenceEndDate ?? '',

    // ── Explicit Slots ───────────────────────────────────────────────────
    slots: d.datetime.mode === 'single'
      ? (d.datetime.slots || []).map((s, index) => {
          const parsedStart = parseToTime(s.startTime) || '09:00';
          const parsedEnd = parseToTime(s.endTime) || '18:00';
          
          let sDate = s.slotDate || '';
          if (sDate) {
            const yr = Number(sDate.substring(0, 4));
            if (isNaN(yr) || yr < 1753) sDate = '1900-01-01';
          } else {
            sDate = '1900-01-01';
          }

          return {
            slotId: s.slotId || 0,
            publicId: s.publicId || undefined,
            slotDate: sDate,
            startTime: parsedStart + ':00',
            endTime: parsedEnd + ':00',
            capacity: s.capacity === '' ? 0 : Number(s.capacity),
            slotName: s.slotName || `Slot ${index + 1}`,
            ticketPrice: s.ticketPrice === '' ? 0 : Number(s.ticketPrice),
            occurrenceIndex: index,
          };
        })
      : [],

    // ── Venue / location ────────────────────────────────────────────────
    venueName: d.venue.venueName,
    locationName: d.venue.venueName,
    addressLine1: d.venue.addressLine1,
    addressLine2: d.venue.addressLine2,
    address: [d.venue.addressLine1, d.venue.addressLine2].filter(Boolean).join(', '),
    areaName: '',
    pincode: d.venue.zip,
    cityId: d.venue.city,
    stateId: d.venue.state,
    countryId: d.venue.country,
    latitude: d.venue.latitude === '' ? 0 : Number(d.venue.latitude),
    longitude: d.venue.longitude === '' ? 0 : Number(d.venue.longitude),
    googleMapLink: d.venue.mapQuery,
    hallName: d.details.hallName,

    venueType: d.venue.venueType,
    venueCategory: d.venue.venueCategory,
    facilities: JSON.stringify(Object.keys(d.venue.facilities).filter(k => d.venue.facilities[Number(k)]).map(Number)),
    venueCapacity: d.venue.venueCapacity === '' ? null : Number(d.venue.venueCapacity),
    contactPerson: d.venue.contactPerson,
    contactDesignation: d.venue.contactDesignation,
    contactPhoneCode: d.venue.contactPhoneCode,
    contactPhone: d.venue.contactPhone,
    contactEmail: d.venue.contactEmail,
    notes: d.venue.notes,
    otherFacility: d.venue.otherFacility,

    // Social links (store as top-level columns on Tracket_Master_Event)
    websiteLink: d.media.websiteLink || d.organizer.website || '',
    facebookLink: d.media.facebookLink || d.organizer.facebook || '',
    instagramLink: d.media.instagramLink || d.organizer.instagram || '',
    twitterLink: d.media.twitterLink || d.organizer.twitter || '',
    youtubeLink: d.media.youtubeLink || d.organizer.youtube || '',
    linkedInLink: d.media.linkedInLink || d.organizer.linkedin || '',
    pintrestLink: d.media.pintrestLink || d.organizer.pintrest || '',

    // Step-5 Organizer Profile Additions
    organizerTypeId: d.organizer.organizerType === 'company' ? 1 : d.organizer.organizerType === 'individual' ? 2 : d.organizer.organizerType === 'government' ? 3 : d.organizer.organizerType === 'nonprofit' ? 4 : null,
    organizationName: d.organizer.companyName,
    gstin: d.organizer.gstin,
    panNumber: d.organizer.pan,
    orgWebsite: d.organizer.website,
    orgPrimaryEmail: d.organizer.primaryEmail,
    orgPrimaryPhone: [d.organizer.primaryPhoneCode, d.organizer.primaryPhone].filter(Boolean).join(' '),
    orgAlternatePhone: [d.organizer.altPhoneCode, d.organizer.altPhone].filter(Boolean).join(' '),
    orgAddress: d.organizer.address,
    orgCity: d.organizer.city,
    orgState: d.organizer.state,
    orgCountry: d.organizer.country,
    orgPinCode: d.organizer.zip,
    primaryContactName: d.organizer.ownerName,
    primaryContactDesignation: d.organizer.ownerDesignation,
    primaryContactEmail: d.organizer.ownerEmail,
    primaryContactPhone: [d.organizer.ownerPhoneCode, d.organizer.ownerPhone].filter(Boolean).join(' '),
    emergencyContactName: d.organizer.emergencyName,
    emergencyContactRelationship: d.organizer.emergencyRelationship,
    emergencyContactPhone: [d.organizer.emergencyPhoneCode, d.organizer.emergencyPhone].filter(Boolean).join(' '),
    emergencyAlternatePhone: [d.organizer.emergencyAltPhoneCode, d.organizer.emergencyAltPhone].filter(Boolean).join(' '),
    yearEstablished: d.organizer.yearEstablished ? Number(d.organizer.yearEstablished) : null,
    employeeCountId: d.organizer.employeeCount === '1-10' ? 1 : d.organizer.employeeCount === '11-50' ? 2 : d.organizer.employeeCount === '51-200' ? 3 : d.organizer.employeeCount === '201-500' ? 4 : d.organizer.employeeCount === '500+' ? 5 : null,
    industryId: d.organizer.industry === 'events' ? 1 : d.organizer.industry === 'tech' ? 2 : d.organizer.industry === 'education' ? 3 : d.organizer.industry === 'healthcare' ? 4 : d.organizer.industry === 'hospitality' ? 5 : d.organizer.industry === 'other' ? 6 : null,
    businessTypeId: d.organizer.businessType === 'pvt' ? 1 : d.organizer.businessType === 'public' ? 2 : d.organizer.businessType === 'partnership' ? 3 : d.organizer.businessType === 'proprietorship' ? 4 : d.organizer.businessType === 'llp' ? 5 : d.organizer.businessType === 'ngo' ? 6 : null,
    registrationNumber: d.organizer.registrationNumber,
    registeredAddress: d.organizer.registeredAddress,
    orgFacebookLink: d.organizer.facebook,
    orgInstagramLink: d.organizer.instagram,
    orgLinkedInLink: d.organizer.linkedin,
    orgTwitterLink: d.organizer.twitter,
    orgYouTubeLink: d.organizer.youtube,
    organizationLogo: d.organizer.logoFile?.[0]?.isExisting ? (d.organizer.logoFile[0] as any).previewUrl : (d.organizer.logoFile?.[0]?.name || ''),
    gstCertificate: d.organizer.gstCertificateFile?.[0]?.isExisting ? (d.organizer.gstCertificateFile[0] as any).previewUrl : (d.organizer.gstCertificateFile?.[0]?.name || ''),
    panCardDocument: d.organizer.panCardDocumentFile?.[0]?.isExisting ? (d.organizer.panCardDocumentFile[0] as any).previewUrl : (d.organizer.panCardDocumentFile?.[0]?.name || ''),
    registrationCertificate: d.organizer.registrationCertificateFile?.[0]?.isExisting ? (d.organizer.registrationCertificateFile[0] as any).previewUrl : (d.organizer.registrationCertificateFile?.[0]?.name || ''),
    otherDocument: d.organizer.otherDocumentFile?.[0]?.isExisting ? (d.organizer.otherDocumentFile[0] as any).previewUrl : (d.organizer.otherDocumentFile?.[0]?.name || ''),

    // ── Media & Branding top level columns ────────────────────────────────
    thumbnailImage: d.media.logoFile?.[0]?.isExisting ? (d.media.logoFile[0] as any).previewUrl : '',
    bannerImage: d.media.coverFile?.[0]?.isExisting ? (d.media.coverFile[0] as any).previewUrl : '',

    // ── Documents ────────────────────────────────────────────────────────
    documents: docsList,

    // ── Full draft round-trip ────────────────────────────────────────────
    metaJson: JSON.stringify(meta),
    ...restExtra,
  };
};

// ---------------------------------------------------------------------------
// EventResponse -> wizard draft.
// 
// Priority:
//   1. MetaJson (full fidelity — always preferred)
//   2. slots[0] (canonical Step-2 source from Tracket_Master_Event_Slot)
//   3. Scalar columns on the event object (legacy / partial data fallback)
// ---------------------------------------------------------------------------
export const eventToDraft = (ev: any): EventDraft => {
  const base = createEmptyDraft();
  let draft = { ...base };

  // Compute existing documents & files
  const documents: any[] = ev.documents ?? ev.Documents ?? [];
  const faviconFile: any[] = [];
  const bannerFile: any[] = [];
  const shareImageFile: any[] = [];
  const galleryFiles: any[] = [];
  const documentFiles: any[] = [];
  const videoFiles: any[] = [];
  const audioFiles: any[] = [];

  documents.forEach((d: any) => {
    const rawPath = d.relativePath ?? d.RelativePath ?? '';
    const name = d.documentName ?? d.DocumentName ?? '';
    
    const cleanPath = normalizeImagePath(rawPath);
    const lowerPath = cleanPath.toLowerCase();
    const lowerName = name.toLowerCase();
    
    const isDoc = lowerPath.endsWith('.pdf') || lowerPath.endsWith('.doc') || lowerPath.endsWith('.docx') || lowerPath.endsWith('.xls') || lowerPath.endsWith('.xlsx') || lowerPath.endsWith('.txt') ||
                  lowerName.endsWith('.pdf') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx') || lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.txt');
                  
    const isVideo = lowerPath.endsWith('.mp4') || lowerPath.endsWith('.webm') || lowerPath.endsWith('.ogg') || lowerPath.endsWith('.mov') || lowerPath.endsWith('.avi') ||
                    lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.ogg') || lowerName.endsWith('.mov') || lowerName.endsWith('.avi');
                    
    const isAudio = lowerPath.endsWith('.mp3') || lowerPath.endsWith('.wav') || lowerPath.endsWith('.aac') || lowerPath.endsWith('.m4a') ||
                    lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') || lowerName.endsWith('.aac') || lowerName.endsWith('.m4a');
                    
    let fileType = 'image/png';
    if (isDoc) fileType = name.endsWith('.pdf') ? 'application/pdf' : 'application/msword';
    else if (isVideo) fileType = 'video/mp4';
    else if (isAudio) fileType = 'audio/mpeg';

    const isExistingFile = {
      name,
      isExisting: true,
      previewUrl: cleanPath,
      type: fileType,
    };
    
    if (lowerPath.includes('/favicon/')) {
      faviconFile.push(isExistingFile);
    } else if (lowerPath.includes('/bannerimage/')) {
      bannerFile.push(isExistingFile);
    } else if (lowerPath.includes('/shareimage/')) {
      shareImageFile.push(isExistingFile);
    } else if (isVideo || lowerPath.includes('/videos/')) {
      videoFiles.push(isExistingFile);
    } else if (isAudio || lowerPath.includes('/audio/')) {
      audioFiles.push(isExistingFile);
    } else if (isDoc || lowerPath.includes('/documents/')) {
      documentFiles.push(isExistingFile);
    } else if (lowerPath.includes('/gallery/')) {
      galleryFiles.push(isExistingFile);
    }
  });

  const logoFile: any[] = [];
  const logoPath = normalizeImagePath(ev.thumbnailImage ?? ev.ThumbnailImage ?? '');
  if (logoPath) {
    logoFile.push({
      name: logoPath.split('/').pop() || 'logo',
      isExisting: true,
      previewUrl: logoPath,
      type: 'image/png',
    });
  }

  const coverFile: any[] = [];
  const coverPath = normalizeImagePath(ev.bannerImage ?? ev.BannerImage ?? '');
  if (coverPath) {
    coverFile.push({
      name: coverPath.split('/').pop() || 'cover',
      isExisting: true,
      previewUrl: coverPath,
      type: 'image/png',
    });
  }

  const orgLogoFile: any[] = [];
  const orgLogo = normalizeImagePath(ev.organizationLogo ?? ev.OrganizationLogo ?? '');
  if (orgLogo) {
    orgLogoFile.push({
      name: orgLogo.split('/').pop() || 'logo',
      isExisting: true,
      previewUrl: orgLogo,
      type: 'image/png'
    });
  }

  const gstFile: any[] = [];
  const gst = normalizeImagePath(ev.gstCertificate ?? ev.GSTCertificate ?? '');
  if (gst) {
    gstFile.push({
      name: gst.split('/').pop() || 'gst_certificate',
      isExisting: true,
      previewUrl: gst,
      type: gst.endsWith('.pdf') ? 'application/pdf' : 'image/png'
    });
  }

  const panFile: any[] = [];
  const pan = normalizeImagePath(ev.panCardDocument ?? ev.PANCardDocument ?? '');
  if (pan) {
    panFile.push({
      name: pan.split('/').pop() || 'pan_card',
      isExisting: true,
      previewUrl: pan,
      type: pan.endsWith('.pdf') ? 'application/pdf' : 'image/png'
    });
  }

  const regFile: any[] = [];
  const reg = normalizeImagePath(ev.registrationCertificate ?? ev.RegistrationCertificate ?? '');
  if (reg) {
    regFile.push({
      name: reg.split('/').pop() || 'registration_certificate',
      isExisting: true,
      previewUrl: reg,
      type: reg.endsWith('.pdf') ? 'application/pdf' : 'image/png'
    });
  }

  const otherFile: any[] = [];
  const otherDoc = normalizeImagePath(ev.otherDocument ?? ev.OtherDocument ?? '');
  if (otherDoc) {
    otherFile.push({
      name: otherDoc.split('/').pop() || 'other_document',
      isExisting: true,
      previewUrl: otherDoc,
      type: otherDoc.endsWith('.pdf') ? 'application/pdf' : 'image/png'
    });
  }

  // 1. Rich round-trip via MetaJson.
  if (ev.metaJson || ev.MetaJson) {
    try {
      const meta = JSON.parse(ev.metaJson || ev.MetaJson);
      if (meta && meta.schema === 'eventpro.v1') {
        const detailsObj = { ...base.details, ...meta.details };
        if (!detailsObj.zones) {
          detailsObj.zones = {};
        }

        const combinedItems: any[] = [];
        if (Array.isArray(detailsObj.assetItems)) {
          detailsObj.assetItems.forEach((x: any) => {
            combinedItems.push({
              ...x,
              assetId: x.assetId || '',
            });
          });
        }
        if (Array.isArray(detailsObj.components)) {
          detailsObj.components.forEach((c: any) => {
            combinedItems.push({
              itemId: c.itemId,
              label: c.name || c.type || 'Component',
              price: c.price || 0,
              x: c.x,
              y: c.y,
              w: c.w,
              h: c.h,
              rotation: c.rotation || 0,
              type: c.type || 'component',
              color: c.defaultColor || '#B6C2D9',
              status: 'Available',
              assetId: '',
              remarks: '',
            });
          });
        }

        if (detailsObj.zoneId) {
          const activeZoneId = Number(detailsObj.zoneId);
          if (!detailsObj.zones[activeZoneId]) {
            detailsObj.zones[activeZoneId] = {
              assetItems: combinedItems,
              rows: detailsObj.rows || 5,
              columns: detailsObj.columns || 5,
              arrangementType: detailsObj.arrangementType || '',
              assetId: detailsObj.assetId || '',
            };
          }
        }

        Object.keys(detailsObj.zones).forEach((zId) => {
          const zoneLayout = detailsObj.zones[Number(zId)];
          if (zoneLayout && Array.isArray(zoneLayout.assetItems)) {
            zoneLayout.assetItems = zoneLayout.assetItems.map((item: any) => ({
              ...item,
              assetId: item.assetId !== undefined && item.assetId !== null ? String(item.assetId) : '',
            }));
          }
        });

        if (detailsObj.zoneId && detailsObj.zones[Number(detailsObj.zoneId)]) {
          const activeLayout = detailsObj.zones[Number(detailsObj.zoneId)];
          detailsObj.assetItems = activeLayout.assetItems;
          detailsObj.rows = activeLayout.rows;
          detailsObj.columns = activeLayout.columns;
          detailsObj.arrangementType = activeLayout.arrangementType;
          detailsObj.assetId = activeLayout.assetId;
        } else {
          detailsObj.assetItems = combinedItems;
        }

        draft = {
          ...base,
          eventId: ev.eventId ?? ev.EventId ?? 0,
          eventRId: ev.eventRId ?? ev.EventRId ?? '',
          basic: { ...base.basic, ...meta.basic },
          datetime: { ...base.datetime, ...meta.datetime },
          venue: { ...base.venue, ...meta.venue },
          details: detailsObj,
          organizer: {
            ...base.organizer,
            ...meta.organizer,
            website: meta.organizer?.website || ev.orgWebsite || ev.websiteLink || ev.WebsiteLink || '',
            facebook: meta.organizer?.facebook || ev.orgFacebookLink || ev.facebookLink || ev.FacebookLink || '',
            instagram: meta.organizer?.instagram || ev.orgInstagramLink || ev.instagramLink || ev.InstagramLink || '',
            linkedin: meta.organizer?.linkedin || ev.orgLinkedInLink || ev.linkedInLink || ev.LinkedInLink || '',
            twitter: meta.organizer?.twitter || ev.orgTwitterLink || ev.twitterLink || ev.TwitterLink || '',
            youtube: meta.organizer?.youtube || ev.orgYouTubeLink || ev.youtubeLink || ev.YouTubeLink || '',
            pintrest: meta.organizer?.pintrest || ev.pintrestLink || ev.PintrestLink || '',
            logoFile: orgLogoFile,
            gstCertificateFile: gstFile,
            panCardDocumentFile: panFile,
            registrationCertificateFile: regFile,
            otherDocumentFile: otherFile,
          },
          tickets: { ...base.tickets, ...meta.tickets },
          media: {
            ...base.media,
            ...meta.media,
            logoFile,
            coverFile,
            faviconFile,
            bannerFile,
            galleryFiles,
            documentFiles,
            videoFiles,
            audioFiles,
            shareImageFile,
            websiteLink: meta.media?.websiteLink || ev.orgWebsite || ev.websiteLink || ev.WebsiteLink || '',
            facebookLink: meta.media?.facebookLink || ev.orgFacebookLink || ev.facebookLink || ev.FacebookLink || '',
            instagramLink: meta.media?.instagramLink || ev.orgInstagramLink || ev.instagramLink || ev.InstagramLink || '',
            twitterLink: meta.media?.twitterLink || ev.orgTwitterLink || ev.twitterLink || ev.TwitterLink || '',
            youtubeLink: meta.media?.youtubeLink || ev.orgYouTubeLink || ev.youtubeLink || ev.YouTubeLink || '',
            linkedInLink: meta.media?.linkedInLink || ev.orgLinkedInLink || ev.linkedInLink || ev.LinkedInLink || '',
            pintrestLink: meta.media?.pintrestLink || ev.pintrestLink || ev.PintrestLink || '',
          },
          publish: { ...base.publish, ...meta.publish },
        };
      }
    } catch { /* fall through */ }
  } else {
    // Scalar fallback
    draft.eventId = ev.eventId ?? ev.EventId ?? 0;
    draft.eventRId = ev.eventRId ?? ev.EventRId ?? '';

    // Step-1
    draft.basic.eventName = ev.eventName ?? '';
    draft.basic.slug = ev.slug ?? '';
    draft.basic.shortDescription = ev.shortDescription ?? ev.description ?? '';
    draft.basic.about = ev.about ?? '';
    draft.basic.keywords = ev.seoKeywords ?? ev.tags ?? '';
    draft.basic.categoryId = ev.categoryId ?? '';
    draft.basic.eventSubCategoryId = ev.eventSubCategoryId ?? '';
    draft.basic.eventFormat = TYPE_TO_FORMAT[ev.eventType as number] ?? '';
    (draft.basic as any).tagline = ev.tagline ?? '';
    (draft.basic as any).purpose = ev.purpose ?? '';
    (draft.basic as any).targetAudience = ev.targetAudience ?? '';

    // Venue
    draft.venue.venueName = ev.venueName ?? ev.locationName ?? '';
    draft.venue.addressLine1 = ev.addressLine1 ?? '';
    draft.venue.addressLine2 = ev.addressLine2 ?? '';
    draft.venue.city = ev.cityId ?? '';
    draft.venue.state = ev.stateId ?? '';
    draft.venue.country = ev.countryId ?? 'India';
    draft.venue.zip = ev.pincode ?? '';
    draft.venue.latitude = ev.latitude ?? '';
    draft.venue.longitude = ev.longitude ?? '';
    draft.venue.mapQuery = ev.googleMapLink ?? '';
    draft.details.hallName = ev.hallName ?? '';
    draft.tickets.payment.currency = ev.currency ?? 'INR';

    // Fallbacks for visibility/start times if slots/meta are not present
    draft.datetime.visibilityStartDate = ev.visibilityStartDate ?? ev.VisibilityStartDate ?? '';
    draft.datetime.visibilityStartTime = ev.visibilityStartTime ?? ev.VisibilityStartTime ?? draft.datetime.visibilityStartTime ?? '09:00';
    draft.datetime.startDate = draft.datetime.startDate || (ev.startDate ?? ev.StartDate ?? '');
    draft.datetime.endDate = draft.datetime.endDate || (ev.endDate ?? ev.EndDate ?? '');
    if (!draft.datetime.startTime) draft.datetime.startTime = ev.startTime ?? ev.StartTime ?? draft.datetime.startTime ?? '09:00';
    if (!draft.datetime.endTime) draft.datetime.endTime = ev.endTime ?? ev.EndTime ?? draft.datetime.endTime ?? '18:00';

    // Map social links and details from top-level columns into draft.organizer fields
    draft.organizer.website = ev.orgWebsite ?? ev.websiteLink ?? ev.WebsiteLink ?? draft.organizer.website ?? '';
    draft.organizer.facebook = ev.orgFacebookLink ?? ev.facebookLink ?? ev.FacebookLink ?? draft.organizer.facebook ?? '';
    draft.organizer.instagram = ev.orgInstagramLink ?? ev.instagramLink ?? ev.InstagramLink ?? draft.organizer.instagram ?? '';
    draft.organizer.twitter = ev.orgTwitterLink ?? ev.twitterLink ?? ev.TwitterLink ?? draft.organizer.twitter ?? '';
    draft.organizer.youtube = ev.orgYouTubeLink ?? ev.youtubeLink ?? ev.YouTubeLink ?? draft.organizer.youtube ?? '';
    draft.organizer.linkedin = ev.orgLinkedInLink ?? ev.linkedInLink ?? ev.LinkedInLink ?? draft.organizer.linkedin ?? '';
    draft.organizer.pintrest = ev.pintrestLink ?? ev.PintrestLink ?? draft.organizer.pintrest ?? '';

    draft.organizer.organizerType = ev.organizerTypeId === 1 ? 'company' : ev.organizerTypeId === 2 ? 'individual' : ev.organizerTypeId === 3 ? 'government' : ev.organizerTypeId === 4 ? 'nonprofit' : draft.organizer.organizerType;
    draft.organizer.companyName = ev.organizationName ?? ev.companyName ?? draft.organizer.companyName ?? '';
    draft.organizer.gstin = ev.gstin ?? ev.GSTIN ?? draft.organizer.gstin ?? '';
    draft.organizer.pan = ev.panNumber ?? ev.pan ?? draft.organizer.pan ?? '';
    draft.organizer.primaryEmail = ev.orgPrimaryEmail ?? draft.organizer.primaryEmail ?? '';
    
    const primPhone = ev.orgPrimaryPhone ?? '';
    if (primPhone.includes(' ')) {
      const parts = primPhone.split(' ');
      draft.organizer.primaryPhoneCode = parts[0];
      draft.organizer.primaryPhone = parts.slice(1).join(' ');
    } else if (primPhone) {
      draft.organizer.primaryPhone = primPhone;
    }

    const altPhone = ev.orgAlternatePhone ?? '';
    if (altPhone.includes(' ')) {
      const parts = altPhone.split(' ');
      draft.organizer.altPhoneCode = parts[0];
      draft.organizer.altPhone = parts.slice(1).join(' ');
    } else if (altPhone) {
      draft.organizer.altPhone = altPhone;
    }

    draft.organizer.address = ev.orgAddress ?? draft.organizer.address ?? '';
    draft.organizer.city = ev.orgCity ?? draft.organizer.city ?? '';
    draft.organizer.state = ev.orgState ?? draft.organizer.state ?? '';
    draft.organizer.country = ev.orgCountry ?? draft.organizer.country ?? 'India';
    draft.organizer.zip = ev.orgPinCode ?? draft.organizer.zip ?? '';

    draft.organizer.ownerName = ev.primaryContactName ?? draft.organizer.ownerName ?? '';
    draft.organizer.ownerDesignation = ev.primaryContactDesignation ?? draft.organizer.ownerDesignation ?? '';
    draft.organizer.ownerEmail = ev.primaryContactEmail ?? draft.organizer.ownerEmail ?? '';

    const ownPhone = ev.primaryContactPhone ?? '';
    if (ownPhone.includes(' ')) {
      const parts = ownPhone.split(' ');
      draft.organizer.ownerPhoneCode = parts[0];
      draft.organizer.ownerPhone = parts.slice(1).join(' ');
    } else if (ownPhone) {
      draft.organizer.ownerPhone = ownPhone;
    }

    draft.organizer.emergencyName = ev.emergencyContactName ?? draft.organizer.emergencyName ?? '';
    draft.organizer.emergencyRelationship = ev.emergencyContactRelationship ?? draft.organizer.emergencyRelationship ?? '';

    const emgPhone = ev.emergencyContactPhone ?? '';
    if (emgPhone.includes(' ')) {
      const parts = emgPhone.split(' ');
      draft.organizer.emergencyPhoneCode = parts[0];
      draft.organizer.emergencyPhone = parts.slice(1).join(' ');
    } else if (emgPhone) {
      draft.organizer.emergencyPhone = emgPhone;
    }

    const emgAltPhone = ev.emergencyAlternatePhone ?? '';
    if (emgAltPhone.includes(' ')) {
      const parts = emgAltPhone.split(' ');
      draft.organizer.emergencyAltPhoneCode = parts[0];
      draft.organizer.emergencyAltPhone = parts.slice(1).join(' ');
    } else if (emgAltPhone) {
      draft.organizer.emergencyAltPhone = emgAltPhone;
    }

    draft.organizer.yearEstablished = ev.yearEstablished ? String(ev.yearEstablished) : draft.organizer.yearEstablished ?? '';
    draft.organizer.employeeCount = ev.employeeCountId === 1 ? '1-10' : ev.employeeCountId === 2 ? '11-50' : ev.employeeCountId === 3 ? '51-200' : ev.employeeCountId === 4 ? '201-500' : ev.employeeCountId === 5 ? '500+' : draft.organizer.employeeCount ?? '';
    draft.organizer.industry = ev.industryId === 1 ? 'events' : ev.industryId === 2 ? 'tech' : ev.industryId === 3 ? 'education' : ev.industryId === 4 ? 'healthcare' : ev.industryId === 5 ? 'hospitality' : ev.industryId === 6 ? 'other' : draft.organizer.industry ?? '';
    draft.organizer.businessType = ev.businessTypeId === 1 ? 'pvt' : ev.businessTypeId === 2 ? 'public' : ev.businessTypeId === 3 ? 'partnership' : ev.businessTypeId === 4 ? 'proprietorship' : ev.businessTypeId === 5 ? 'llp' : ev.businessTypeId === 6 ? 'ngo' : draft.organizer.businessType ?? '';
    draft.organizer.registrationNumber = ev.registrationNumber ?? draft.organizer.registrationNumber ?? '';
    draft.organizer.registeredAddress = ev.registeredAddress ?? draft.organizer.registeredAddress ?? '';

    // Mock files for scalar organizer
    draft.organizer.logoFile = orgLogoFile;
    draft.organizer.gstCertificateFile = gstFile;
    draft.organizer.panCardDocumentFile = panFile;
    draft.organizer.registrationCertificateFile = regFile;
    draft.organizer.otherDocumentFile = otherFile;

    // Mock files and social links for scalar media
    draft.media.logoFile = logoFile;
    draft.media.coverFile = coverFile;
    draft.media.faviconFile = faviconFile;
    draft.media.bannerFile = bannerFile;
    draft.media.galleryFiles = galleryFiles;
    draft.media.documentFiles = documentFiles;
    draft.media.videoFiles = videoFiles;
    draft.media.audioFiles = audioFiles;
    draft.media.shareImageFile = shareImageFile;

    draft.media.websiteLink = ev.orgWebsite ?? ev.websiteLink ?? ev.WebsiteLink ?? '';
    draft.media.facebookLink = ev.orgFacebookLink ?? ev.facebookLink ?? ev.FacebookLink ?? '';
    draft.media.instagramLink = ev.orgInstagramLink ?? ev.instagramLink ?? ev.InstagramLink ?? '';
    draft.media.twitterLink = ev.orgTwitterLink ?? ev.twitterLink ?? ev.TwitterLink ?? '';
    draft.media.youtubeLink = ev.orgYouTubeLink ?? ev.youtubeLink ?? ev.YouTubeLink ?? '';
    draft.media.linkedInLink = ev.orgLinkedInLink ?? ev.linkedInLink ?? ev.LinkedInLink ?? '';
    draft.media.pintrestLink = ev.pintrestLink ?? ev.PintrestLink ?? '';
  }

  // 2. Canonical Step-2 slots source of truth
  const apiSlots = ev.slots ?? ev.Slots;
  const slot0: any = Array.isArray(apiSlots) && apiSlots.length > 0
    ? apiSlots.find((s: any) => (s.occurrenceIndex ?? s.OccurrenceIndex ?? 0) === 0) ?? apiSlots[0]
    : null;

  if (Array.isArray(apiSlots) && apiSlots.length > 0) {
    draft.datetime.slots = apiSlots.map((s: any) => {
      const sDateRaw = s.slotDate ?? s.SlotDate ?? s.startDate ?? s.StartDate ?? '';
      let sDate = sDateRaw ? String(sDateRaw).substring(0, 10) : '';
      if (sDate) {
        const yr = Number(sDate.substring(0, 4));
        if (isNaN(yr) || yr < 1753) sDate = '';
      }
      const sStart = s.startTime ?? s.StartTime ?? '';
      const sEnd = s.endTime ?? s.EndTime ?? '';
      return {
        slotId: s.slotId ?? s.SlotId ?? 0,
        publicId: s.publicId ?? s.PublicId ?? '',
        slotDate: sDate,
        startTime: sStart ? formatToTime12(String(sStart)) : '09:00 AM',
        endTime: sEnd ? formatToTime12(String(sEnd)) : '06:00 PM',
        capacity: s.capacity ?? s.Capacity ?? '',
        slotName: s.slotName ?? s.SlotName ?? '',
        ticketPrice: s.ticketPrice ?? s.TicketPrice ?? '',
      };
    });
  } else {
    draft.datetime.slots = [];
  }

  if (slot0) {
    const s = slot0;
    draft.datetime.mode = s.eventMode ?? s.EventMode ?? 'single';
    (draft.datetime as any).timezone = s.timezone ?? s.Timezone ?? 'Asia/Kolkata';
    (draft.datetime as any).allDay = s.allDay ?? s.AllDay ?? false;
    (draft.datetime as any).showCountdown = s.showCountdown ?? s.ShowCountdown ?? true;
    (draft.datetime as any).setupStartTime = s.setupStartTime ?? s.SetupStartTime ?? '';
    (draft.datetime as any).teardownEndTime = s.teardownEndTime ?? s.TeardownEndTime ?? '';
    const visDateRaw = s.visibilityStartDate ?? s.VisibilityStartDate ?? null;
    if (visDateRaw) {
      const vStr = String(visDateRaw).trim();
      const parsedDate = parseToISODate(vStr);
      const parsedTime = parseToTime(vStr) || (s.visibilityStartTime ?? s.VisibilityStartTime ?? '09:00');
      (draft.datetime as any).visibilityStartDate = parsedDate || '';
      (draft.datetime as any).visibilityStartTime = parsedTime || '09:00';
    } else {
      (draft.datetime as any).visibilityStartDate = '';
      (draft.datetime as any).visibilityStartTime = s.visibilityStartTime ?? s.VisibilityStartTime ?? '09:00';
    }
    (draft.datetime as any).durationDays = s.durationDays ?? s.DurationDays ?? '';
    (draft.datetime as any).durationHours = s.durationHours ?? s.DurationHours ?? '';
    (draft.datetime as any).durationMinutes = s.durationMinutes ?? s.DurationMinutes ?? '';
    (draft.datetime as any).recurrenceFrequency = s.recurrenceFrequency ?? s.RecurrenceFrequency ?? '';
    (draft.datetime as any).recurrenceInterval = s.recurrenceInterval ?? s.RecurrenceInterval ?? '';
    const recDate = s.recurrenceEndDate ?? s.RecurrenceEndDate;
    (draft.datetime as any).recurrenceEndDate = recDate ? String(recDate).substring(0, 10) : '';

    const sStart = s.startTime ?? s.StartTime;
    const sEnd = s.endTime ?? s.EndTime;
    if (sStart) draft.datetime.startTime = formatToTime12(String(sStart));
    if (sEnd) draft.datetime.endTime = formatToTime12(String(sEnd));

    const evStartDate = s.startDate ?? s.StartDate ?? s.slotDate ?? s.SlotDate;
    const evEndDate = s.endDate ?? s.EndDate ?? s.slotDate ?? s.SlotDate;
    
    let parsedEvStart = evStartDate ? String(evStartDate).substring(0, 10) : '';
    if (parsedEvStart) {
      const yr = Number(parsedEvStart.substring(0, 4));
      if (isNaN(yr) || yr < 1753) parsedEvStart = '';
    }
    draft.datetime.startDate = parsedEvStart;

    let parsedEvEnd = evEndDate ? String(evEndDate).substring(0, 10) : '';
    if (parsedEvEnd) {
      const yr = Number(parsedEvEnd.substring(0, 4));
      if (isNaN(yr) || yr < 1753) parsedEvEnd = '';
    }
    draft.datetime.endDate = parsedEvEnd;

    if (draft.datetime.mode === 'single' && draft.datetime.slots.length > 0) {
      const dates = draft.datetime.slots.map(x => new Date(x.slotDate).getTime()).filter(t => !isNaN(t));
      if (dates.length > 0) {
        draft.datetime.startDate = new Date(Math.min(...dates)).toISOString().substring(0, 10);
        draft.datetime.endDate = new Date(Math.max(...dates)).toISOString().substring(0, 10);
      }
    }
  } else {
    draft.datetime = {
      mode: 'single', startDate: '', endDate: '', startTime: '09:00', endTime: '18:00',
      timezone: 'Asia/Kolkata', durationDays: '', durationHours: '', durationMinutes: '',
      allDay: false, showCountdown: true, visibilityStartDate: '', visibilityStartTime: '09:00',
      setupStartTime: '', teardownEndTime: '', recurrenceFrequency: '', recurrenceInterval: '',
      recurrenceEndDate: '',
      slots: [],
    };
  }

  // Merge/Override with canonical database columns from Tracket_Master_Event_Location
  draft.venue.venueType = ev.venueType || ev.VenueType || draft.venue.venueType || 'physical';
  draft.venue.venueName = ev.venueName || ev.VenueName || ev.locationName || ev.LocationName || draft.venue.venueName || '';
  draft.venue.venueCategory = ev.venueCategory || ev.VenueCategory || draft.venue.venueCategory || '';
  draft.venue.venueCapacity = ev.venueCapacity ?? ev.VenueCapacity ?? draft.venue.venueCapacity ?? '';
  draft.venue.addressLine1 = ev.addressLine1 || ev.AddressLine1 || draft.venue.addressLine1 || '';
  draft.venue.addressLine2 = ev.addressLine2 || ev.AddressLine2 || draft.venue.addressLine2 || '';
  draft.venue.city = ev.cityId || ev.CityId || draft.venue.city || '';
  draft.venue.state = ev.stateId || ev.StateId || draft.venue.state || '';
  draft.venue.country = ev.countryId || ev.CountryId || draft.venue.country || 'India';
  draft.venue.zip = ev.pincode || ev.Pincode || draft.venue.zip || '';
  draft.venue.latitude = ev.latitude ?? ev.Latitude ?? draft.venue.latitude ?? '';
  draft.venue.longitude = ev.longitude ?? ev.Longitude ?? draft.venue.longitude ?? '';
  draft.venue.mapQuery = ev.googleMapLink || ev.GoogleMapLink || draft.venue.mapQuery || '';
  draft.venue.contactPerson = ev.contactPerson || ev.ContactPerson || draft.venue.contactPerson || '';
  draft.venue.contactDesignation = ev.contactDesignation || ev.ContactDesignation || draft.venue.contactDesignation || '';
  draft.venue.contactPhoneCode = ev.contactPhoneCode || ev.ContactPhoneCode || draft.venue.contactPhoneCode || '+91';
  draft.venue.contactPhone = ev.contactPhone || ev.ContactPhone || draft.venue.contactPhone || '';
  draft.venue.contactEmail = ev.contactEmail || ev.ContactEmail || draft.venue.contactEmail || '';
  draft.venue.notes = ev.notes || ev.Notes || draft.venue.notes || '';
  draft.venue.otherFacility = ev.otherFacility || ev.OtherFacility || draft.venue.otherFacility || '';

  const rawFacilities = ev.facilities ?? ev.Facilities;
  if (rawFacilities) {
    try {
      const arr = typeof rawFacilities === 'string' ? JSON.parse(rawFacilities) : rawFacilities;
      if (Array.isArray(arr)) {
        draft.venue.facilities = arr.reduce((acc: any, id: number) => { acc[id] = true; return acc; }, {});
      }
    } catch {
      // ignore parsing error
    }
  }

  return draft;
};

export default {} as any;
