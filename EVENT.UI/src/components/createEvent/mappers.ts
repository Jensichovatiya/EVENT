import { EventDraft, createEmptyDraft } from './types';

// Combine an ISO date (yyyy-mm-dd) and a HH:mm time into a Date ISO string.
const combine = (date: string, time: string): string | null => {
  if (!date) return null;
  const t = time && /^\d{2}:\d{2}$/.test(time) ? time : '00:00';
  return `${date}T${t}:00`;
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
// Known scalar fields map to real columns; the full rich draft is serialized
// into MetaJson (an existing persisted column) so nothing is lost today, and
// the same JSON re-hydrates the wizard on edit.
// ---------------------------------------------------------------------------
export const draftToEventRequest = (d: EventDraft, extra: Record<string, any> = {}) => {
  const meta = {
    schema: 'eventpro.v1',
    basic: d.basic,
    datetime: d.datetime,
    venue: d.venue,
    details: d.details,
    organizer: d.organizer,
    tickets: d.tickets,
    media: {
      primaryColor: d.media.primaryColor,
      secondaryColor: d.media.secondaryColor,
      gradientFrom: d.media.gradientFrom,
      gradientTo: d.media.gradientTo,
      shareTitle: d.media.shareTitle,
      shareDescription: d.media.shareDescription,
    },
    publish: d.publish,
  };

  return {
    eventId: d.eventId,
    eventRId: d.eventRId,
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

    startDate: combine(d.datetime.startDate, d.datetime.startTime),
    endDate: combine(d.datetime.endDate, d.datetime.endTime),

    // Venue / location
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

    metaJson: JSON.stringify(meta),
    ...extra,
  };
};

// ---------------------------------------------------------------------------
// EventResponse (from /api/events/{id}) -> wizard draft.
// Prefers MetaJson (full fidelity); falls back to scalar columns.
// ---------------------------------------------------------------------------
export const eventToDraft = (ev: any): EventDraft => {
  const base = createEmptyDraft();

  // Rich round-trip via MetaJson.
  if (ev.metaJson || ev.MetaJson) {
    try {
      const meta = JSON.parse(ev.metaJson || ev.MetaJson);
      if (meta && meta.schema === 'eventpro.v1') {
        return {
          ...base,
          eventId: ev.eventId ?? ev.EventId ?? 0,
          eventRId: ev.eventRId ?? ev.EventRId ?? '',
          basic: { ...base.basic, ...meta.basic },
          datetime: { ...base.datetime, ...meta.datetime },
          venue: { ...base.venue, ...meta.venue },
          details: { ...base.details, ...meta.details },
          organizer: { ...base.organizer, ...meta.organizer },
          tickets: { ...base.tickets, ...meta.tickets },
          media: { ...base.media, ...meta.media, logoFile: [], coverFile: [], faviconFile: [], bannerFile: [], galleryFiles: [], documentFiles: [] },
          publish: { ...base.publish, ...meta.publish },
        };
      }
    } catch { /* fall through to scalar mapping */ }
  }

  // Scalar fallback (events created by the old wizard).
  base.eventId = ev.eventId ?? 0;
  base.eventRId = ev.eventRId ?? '';
  base.basic.eventName = ev.eventName ?? '';
  base.basic.slug = ev.slug ?? '';
  base.basic.shortDescription = ev.shortDescription ?? ev.description ?? '';
  base.basic.about = ev.about ?? '';
  base.basic.keywords = ev.seoKeywords ?? ev.tags ?? '';
  base.basic.categoryId = ev.categoryId ?? '';
  base.basic.eventSubCategoryId = ev.eventSubCategoryId ?? '';
  base.basic.eventFormat = TYPE_TO_FORMAT[ev.eventType as number] ?? '';
  if (ev.startDate) { base.datetime.startDate = String(ev.startDate).substring(0, 10); }
  if (ev.endDate) { base.datetime.endDate = String(ev.endDate).substring(0, 10); }
  base.venue.venueName = ev.venueName ?? ev.locationName ?? '';
  base.venue.addressLine1 = ev.addressLine1 ?? '';
  base.venue.addressLine2 = ev.addressLine2 ?? '';
  base.venue.city = ev.cityId ?? '';
  base.venue.state = ev.stateId ?? '';
  base.venue.country = ev.countryId ?? 'India';
  base.venue.zip = ev.pincode ?? '';
  base.venue.latitude = ev.latitude ?? '';
  base.venue.longitude = ev.longitude ?? '';
  base.venue.mapQuery = ev.googleMapLink ?? '';
  base.details.hallName = ev.hallName ?? '';
  base.tickets.payment.currency = ev.currency ?? 'INR';
  return base;
};
