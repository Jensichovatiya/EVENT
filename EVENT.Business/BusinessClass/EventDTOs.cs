using System;
using System.Collections.Generic;

namespace EVENT.Business.BusinessClass
{
    public class EventRequest
    {
        public long EventId { get; set; }
        public string EventRId { get; set; } = string.Empty;
        public Guid PublicId { get; set; }
        public string Tagline { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public string TargetAudience { get; set; } = string.Empty;
        public string DateTimeMode { get; set; } = string.Empty;
        public string Timezone { get; set; } = string.Empty;
        public int? DurationDays { get; set; }
        public int? DurationHours { get; set; }
        public int? DurationMinutes { get; set; }
        public bool AllDay { get; set; }
        public bool ShowCountdown { get; set; }
        public string VisibilityStartDate { get; set; } = string.Empty;
        public string VisibilityStartTime { get; set; } = string.Empty;
        public string SetupStartTime { get; set; } = string.Empty;
        public string TeardownEndTime { get; set; } = string.Empty;
        public string RecurrenceFrequency { get; set; } = string.Empty;
        public int? RecurrenceInterval { get; set; }
        public string RecurrenceEndDate { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
        public string EventCode { get; set; } = string.Empty;
        public long CategoryId { get; set; }
        public long? EventSubCategoryId { get; set; }
        public string ThumbnailImage { get; set; } = string.Empty;
        public string BannerImage { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string About { get; set; } = string.Empty;
        public string TermsAndConditions { get; set; } = string.Empty;
        
        public string FacebookLink { get; set; } = string.Empty;
        public string WebsiteLink { get; set; } = string.Empty;
        public string YoutubeLink { get; set; } = string.Empty;
        public string InstagramLink { get; set; } = string.Empty;
        public string TwitterLink { get; set; } = string.Empty;
        public string LinkedInLink { get; set; } = string.Empty;
        public string PintrestLink { get; set; } = string.Empty;

        public int? ListingType { get; set; }
        public bool IsBookingAccept { get; set; } = true;
        public int? BookingType { get; set; }
        public string Currency { get; set; } = "INR";
        public int? EventType { get; set; }
        public bool IsPublishActive { get; set; }
        public bool IsPassBookingActive { get; set; } = true;
        public int Status { get; set; }
        public int ApprovalStatus { get; set; }
        public int? Capacity { get; set; }
        public decimal? TicketPrice { get; set; }
        public bool IsCancelled { get; set; }
        public string CancelReason { get; set; } = string.Empty;
        public string RejectionReason { get; set; } = string.Empty;
        public long? UserId { get; set; }

        // New Event Fields
        public string ShortDescription { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string SeoTitle { get; set; } = string.Empty;
        public string SeoDescription { get; set; } = string.Empty;
        public string SeoKeywords { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsFree { get; set; }
        public bool IsPublic { get; set; } = true;
        public string MetaJson { get; set; } = string.Empty;

        // Location Info
        public long LocationId { get; set; }
        public string LocationName { get; set; } = string.Empty; // keeping for backward compatibility
        public string Address { get; set; } = string.Empty;      // keeping for backward compatibility
        public string VenueName { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string AreaName { get; set; } = string.Empty;
        public string Landmark { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string GoogleMapLink { get; set; } = string.Empty;
        public string HallName { get; set; } = string.Empty;
        public string GroundName { get; set; } = string.Empty;
        public bool ParkingAvailable { get; set; }
        public string ParkingDetails { get; set; } = string.Empty;
        public string CountryId { get; set; } = string.Empty;
        public string StateId { get; set; } = string.Empty;
        public string CityId { get; set; } = string.Empty;
        public string VenueType { get; set; } = string.Empty;
        public string VenueCategory { get; set; } = string.Empty;
        public string Facilities { get; set; } = string.Empty;
        public int? VenueCapacity { get; set; }
        public string ContactPerson { get; set; } = string.Empty;
        public string ContactDesignation { get; set; } = string.Empty;
        public string ContactPhoneCode { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string OtherFacility { get; set; } = string.Empty;

        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;

        // Step-5 Organizer Profile Additions
        public int? OrganizerTypeId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public string GSTIN { get; set; } = string.Empty;
        public string PANNumber { get; set; } = string.Empty;
        public string OrgWebsite { get; set; } = string.Empty;
        public string OrgPrimaryEmail { get; set; } = string.Empty;
        public string OrgPrimaryPhone { get; set; } = string.Empty;
        public string OrgAlternatePhone { get; set; } = string.Empty;
        public string OrgAddress { get; set; } = string.Empty;
        public string OrgCity { get; set; } = string.Empty;
        public string OrgState { get; set; } = string.Empty;
        public string OrgCountry { get; set; } = string.Empty;
        public string OrgPinCode { get; set; } = string.Empty;
        public string PrimaryContactName { get; set; } = string.Empty;
        public string PrimaryContactDesignation { get; set; } = string.Empty;
        public string PrimaryContactEmail { get; set; } = string.Empty;
        public string PrimaryContactPhone { get; set; } = string.Empty;
        public string EmergencyContactName { get; set; } = string.Empty;
        public string EmergencyContactRelationship { get; set; } = string.Empty;
        public string EmergencyContactPhone { get; set; } = string.Empty;
        public string EmergencyAlternatePhone { get; set; } = string.Empty;
        public int? YearEstablished { get; set; }
        public int? EmployeeCountId { get; set; }
        public int? IndustryId { get; set; }
        public int? BusinessTypeId { get; set; }
        public string RegistrationNumber { get; set; } = string.Empty;
        public string RegisteredAddress { get; set; } = string.Empty;
        public string OrgFacebookLink { get; set; } = string.Empty;
        public string OrgInstagramLink { get; set; } = string.Empty;
        public string OrgLinkedInLink { get; set; } = string.Empty;
        public string OrgTwitterLink { get; set; } = string.Empty;
        public string OrgYouTubeLink { get; set; } = string.Empty;
        public string OrganizationLogo { get; set; } = string.Empty;
        public string GSTCertificate { get; set; } = string.Empty;
        public string PANCardDocument { get; set; } = string.Empty;
        public string RegistrationCertificate { get; set; } = string.Empty;
        public string OtherDocument { get; set; } = string.Empty;

        // Booking Configuration Fields
        public long? MinBookingQty { get; set; }
        public long? MaxBookingQty { get; set; }
        public long? MaxBookingPerUser { get; set; }
        public bool AllowGroupBooking { get; set; }
        public bool AllowMultipleDateBooking { get; set; }
        public long? MaxGroupMember { get; set; }
        public DateTime? BookingStartDate { get; set; }
        public DateTime? BookingEndDate { get; set; }
        public bool AllowSeatSelection { get; set; }
        public bool AllowMultiSlotBooking { get; set; }

        public int? CurrentActiveStep { get; set; }

        public List<EventSlotDTO> Slots { get; set; } = new List<EventSlotDTO>();
        public List<EventDocumentDTO> Documents { get; set; } = new List<EventDocumentDTO>();
    }

    public class EventSlotDTO
    {
        public Guid PublicId { get; set; }
        public long SlotId { get; set; }
        public DateTime SlotDate { get; set; }
        public string StartTime { get; set; } = "00:00:00";
        public string EndTime { get; set; } = "00:00:00";
        public int Capacity { get; set; }
        public string SlotName { get; set; } = string.Empty;
        public decimal? TicketPrice { get; set; }
        public string GenderRestriction { get; set; } = string.Empty;
        public int? AgeRestriction { get; set; }
        // Step-2 date & time detail
        public string EventMode { get; set; } = "single";
        public string Timezone { get; set; } = string.Empty;
        public bool AllDay { get; set; }
        public bool ShowCountdown { get; set; } = true;
        public string SetupStartTime { get; set; } = string.Empty;
        public string TeardownEndTime { get; set; } = string.Empty;
        public string VisibilityStartDate { get; set; } = string.Empty;
        public string VisibilityStartTime { get; set; } = string.Empty;
        public int? DurationDays { get; set; }
        public int? DurationHours { get; set; }
        public int? DurationMinutes { get; set; }
        public string RecurrenceFrequency { get; set; } = string.Empty;
        public int? RecurrenceInterval { get; set; }
        public string RecurrenceEndDate { get; set; } = string.Empty;
        public int OccurrenceIndex { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class EventDocumentDTO
    {
        public long DocumentId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public string RelativePath { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
        public string ThumbnailPath { get; set; } = string.Empty;
    }

    public class EventResponse
    {
        public long EventId { get; set; }
        public string EventRId { get; set; } = string.Empty;
        public Guid PublicId { get; set; }
        // Step-1 extras (event header)
        public string Tagline { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public string TargetAudience { get; set; } = string.Empty;
        // NOTE: DateTimeMode, Timezone, Duration, AllDay, ShowCountdown,
        // Visibility, Setup/Teardown, Recurrence fields are intentionally
        // NOT here — they live in EventSlotResponse (Slots collection).
        public string EventName { get; set; } = string.Empty;
        public string EventCode { get; set; } = string.Empty;
        public long CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public long? EventSubCategoryId { get; set; }
        public string ThumbnailImage { get; set; } = string.Empty;
        public string BannerImage { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string About { get; set; } = string.Empty;
        public string TermsAndConditions { get; set; } = string.Empty;
        
        public string FacebookLink { get; set; } = string.Empty;
        public string WebsiteLink { get; set; } = string.Empty;
        public string YoutubeLink { get; set; } = string.Empty;
        public string InstagramLink { get; set; } = string.Empty;
        public string TwitterLink { get; set; } = string.Empty;
        public string LinkedInLink { get; set; } = string.Empty;
        public string PintrestLink { get; set; } = string.Empty;

        public int? ListingType { get; set; }
        public bool IsBookingAccept { get; set; }
        public int? BookingType { get; set; }
        public string Currency { get; set; } = "INR";
        public int? EventType { get; set; }
        public bool IsPublishActive { get; set; }
        public bool IsPassBookingActive { get; set; }
        public int Status { get; set; }
        public int ApprovalStatus { get; set; }
        public int? Capacity { get; set; }
        public decimal? TicketPrice { get; set; }
        public bool IsCancelled { get; set; }
        public string CancelReason { get; set; } = string.Empty;
        public string RejectionReason { get; set; } = string.Empty;
        public long? UserId { get; set; }

        // New Event Fields
        public string ShortDescription { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string SeoTitle { get; set; } = string.Empty;
        public string SeoDescription { get; set; } = string.Empty;
        public string SeoKeywords { get; set; } = string.Empty;
        public string Tags { get; set; } = string.Empty;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsFree { get; set; }
        public bool IsPublic { get; set; }
        public string MetaJson { get; set; } = string.Empty;

        // Location Info
        public long LocationId { get; set; }
        public string LocationName { get; set; } = string.Empty; // keeping for backward compatibility
        public string Address { get; set; } = string.Empty;      // keeping for backward compatibility
        public string VenueName { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string AreaName { get; set; } = string.Empty;
        public string Landmark { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string GoogleMapLink { get; set; } = string.Empty;
        public string HallName { get; set; } = string.Empty;
        public string GroundName { get; set; } = string.Empty;
        public bool ParkingAvailable { get; set; }
        public string ParkingDetails { get; set; } = string.Empty;
        public string CountryId { get; set; } = string.Empty;
        public string StateId { get; set; } = string.Empty;
        public string CityId { get; set; } = string.Empty;
        public string VenueType { get; set; } = string.Empty;
        public string VenueCategory { get; set; } = string.Empty;
        public string Facilities { get; set; } = string.Empty;
        public int? VenueCapacity { get; set; }
        public string ContactPerson { get; set; } = string.Empty;
        public string ContactDesignation { get; set; } = string.Empty;
        public string ContactPhoneCode { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string OtherFacility { get; set; } = string.Empty;

        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        // Step-5 Organizer Profile Additions
        public int? OrganizerTypeId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public string GSTIN { get; set; } = string.Empty;
        public string PANNumber { get; set; } = string.Empty;
        public string OrgWebsite { get; set; } = string.Empty;
        public string OrgPrimaryEmail { get; set; } = string.Empty;
        public string OrgPrimaryPhone { get; set; } = string.Empty;
        public string OrgAlternatePhone { get; set; } = string.Empty;
        public string OrgAddress { get; set; } = string.Empty;
        public string OrgCity { get; set; } = string.Empty;
        public string OrgState { get; set; } = string.Empty;
        public string OrgCountry { get; set; } = string.Empty;
        public string OrgPinCode { get; set; } = string.Empty;
        public string PrimaryContactName { get; set; } = string.Empty;
        public string PrimaryContactDesignation { get; set; } = string.Empty;
        public string PrimaryContactEmail { get; set; } = string.Empty;
        public string PrimaryContactPhone { get; set; } = string.Empty;
        public string EmergencyContactName { get; set; } = string.Empty;
        public string EmergencyContactRelationship { get; set; } = string.Empty;
        public string EmergencyContactPhone { get; set; } = string.Empty;
        public string EmergencyAlternatePhone { get; set; } = string.Empty;
        public int? YearEstablished { get; set; }
        public int? EmployeeCountId { get; set; }
        public int? IndustryId { get; set; }
        public int? BusinessTypeId { get; set; }
        public string RegistrationNumber { get; set; } = string.Empty;
        public string RegisteredAddress { get; set; } = string.Empty;
        public string OrgFacebookLink { get; set; } = string.Empty;
        public string OrgInstagramLink { get; set; } = string.Empty;
        public string OrgLinkedInLink { get; set; } = string.Empty;
        public string OrgTwitterLink { get; set; } = string.Empty;
        public string OrgYouTubeLink { get; set; } = string.Empty;
        public string OrganizationLogo { get; set; } = string.Empty;
        public string GSTCertificate { get; set; } = string.Empty;
        public string PANCardDocument { get; set; } = string.Empty;
        public string RegistrationCertificate { get; set; } = string.Empty;
        public string OtherDocument { get; set; } = string.Empty;

        // Booking Configuration Fields
        public long? MinBookingQty { get; set; }
        public long? MaxBookingQty { get; set; }
        public long? MaxBookingPerUser { get; set; }
        public bool AllowGroupBooking { get; set; }
        public bool AllowMultipleDateBooking { get; set; }
        public long? MaxGroupMember { get; set; }
        public DateTime? BookingStartDate { get; set; }
        public DateTime? BookingEndDate { get; set; }
        public bool AllowSeatSelection { get; set; }
        public bool AllowMultiSlotBooking { get; set; }

        public int? CurrentActiveStep { get; set; }
        public EventProgressResponse? Progress { get; set; }

        public List<EventSlotResponse> Slots { get; set; } = new List<EventSlotResponse>();
        public List<EventDocumentResponse> Documents { get; set; } = new List<EventDocumentResponse>();
    }

    public class EventSlotResponse
    {
        public Guid PublicId { get; set; }
        public long SlotId { get; set; }
        public long EventId { get; set; }
        public DateTime SlotDate { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string SlotName { get; set; } = string.Empty;
        public decimal? TicketPrice { get; set; }
        public string GenderRestriction { get; set; } = string.Empty;
        public int? AgeRestriction { get; set; }
        // ── Step-2 Date & Time detail (canonical source) ──────────────────
        public string EventMode { get; set; } = "single";
        public string Timezone { get; set; } = string.Empty;
        public bool AllDay { get; set; }
        public bool ShowCountdown { get; set; } = true;
        public string SetupStartTime { get; set; } = string.Empty;
        public string TeardownEndTime { get; set; } = string.Empty;
        public string VisibilityStartDate { get; set; } = string.Empty;
        public string VisibilityStartTime { get; set; } = string.Empty;
        public int? DurationDays { get; set; }
        public int? DurationHours { get; set; }
        public int? DurationMinutes { get; set; }
        public string RecurrenceFrequency { get; set; } = string.Empty;
        public int? RecurrenceInterval { get; set; }
        public string RecurrenceEndDate { get; set; } = string.Empty;
        public int OccurrenceIndex { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class EventDocumentResponse
    {
        public long DocumentId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public string RelativePath { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
        public string ThumbnailPath { get; set; } = string.Empty;
    }

    public class EventStatusUpdateRequest
    {
        public long EventId { get; set; }
        public string EventRId { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class DuplicateEventRequest
    {
        public long EventId { get; set; }
        public string EventRId { get; set; } = string.Empty;
        public string NewEventName { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
    }

    public class EventAnalyticsResponse
    {
        public long TotalEvents { get; set; }
        public long ActiveEvents { get; set; }
        public long TotalSlots { get; set; }
        public long TotalCapacity { get; set; }
    }

    public class EventProgressResponse
    {
        public long EventId { get; set; }
        public bool BasicInformationCompleted { get; set; }
        public bool DateTimeCompleted { get; set; }
        public bool VenueLocationCompleted { get; set; }
        public bool EventDetailsCompleted { get; set; }
        public bool OrganizersCompleted { get; set; }
        public bool TicketsPricingCompleted { get; set; }
        public bool MediaBrandingCompleted { get; set; }
        public bool ReviewPublishCompleted { get; set; }
        public int CurrentActiveStep { get; set; }
        public decimal CompletionPercentage { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }

    public class EventMetaRequest
    {
        public string Schema { get; set; } = string.Empty;
        public object? Basic { get; set; }
        public object? Datetime { get; set; }
        public object? Venue { get; set; }
        public EventDetailsMeta Details { get; set; } = new EventDetailsMeta();
        public object? Organizer { get; set; }
        public object? Tickets { get; set; }
        public object? Media { get; set; }
        public object? Publish { get; set; }
        public List<int> CompletedSteps { get; set; } = new List<int>();
    }

    public class EventDetailsMeta
    {
        public string HallName { get; set; } = string.Empty;
        public string ViewMode { get; set; } = string.Empty;
        public long? ZoneId { get; set; }
        public long? AssetId { get; set; }
        public string ArrangementType { get; set; } = string.Empty;
        public int? Quantity { get; set; }
        public int? Rows { get; set; }
        public int? Columns { get; set; }
        public List<MetaAssetItem> AssetItems { get; set; } = new List<MetaAssetItem>();
        public List<MetaLayoutComponent> Components { get; set; } = new List<MetaLayoutComponent>();
    }

    public class MetaAssetItem
    {
        public long? AssetId { get; set; }
        public string ItemId { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Status { get; set; } = string.Empty;
        public string RowName { get; set; } = string.Empty;
        public int ColumnNo { get; set; }
    }

    public class MetaLayoutComponent
    {
        public string ItemId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public long? AssetId { get; set; } // maps to global ComponentId in DB
        public decimal X { get; set; }
        public decimal Y { get; set; }
        public decimal W { get; set; }
        public decimal H { get; set; }
        public decimal Rotation { get; set; }
        public bool AllowBooking { get; set; }
        public decimal Price { get; set; }
        public int ZIndex { get; set; }
        public string DefaultColor { get; set; } = string.Empty;
        public bool ShowLabel { get; set; }
    }
}
