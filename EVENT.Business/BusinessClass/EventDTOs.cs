using System;
using System.Collections.Generic;

namespace EVENT.Business.BusinessClass
{
    public class EventRequest
    {
        public long EventId { get; set; }
        public string EventRId { get; set; } = string.Empty;
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
        public long? OrganizerId { get; set; }

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

        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
        
        public List<EventSlotDTO> Slots { get; set; } = new List<EventSlotDTO>();
        public List<EventDocumentDTO> Documents { get; set; } = new List<EventDocumentDTO>();
    }

    public class EventSlotDTO
    {
        public long SlotId { get; set; }
        public DateTime SlotDate { get; set; }
        public string StartTime { get; set; } = "00:00:00";
        public string EndTime { get; set; } = "00:00:00";
        public int Capacity { get; set; }
        public string SlotName { get; set; } = string.Empty;
        public decimal? TicketPrice { get; set; }
        public string GenderRestriction { get; set; } = string.Empty;
        public int? AgeRestriction { get; set; }
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
        public long? OrganizerId { get; set; }

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

        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public List<EventSlotResponse> Slots { get; set; } = new List<EventSlotResponse>();
        public List<EventDocumentResponse> Documents { get; set; } = new List<EventDocumentResponse>();
    }

    public class EventSlotResponse
    {
        public long SlotId { get; set; }
        public DateTime SlotDate { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string SlotName { get; set; } = string.Empty;
        public decimal? TicketPrice { get; set; }
        public string GenderRestriction { get; set; } = string.Empty;
        public int? AgeRestriction { get; set; }
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
    }

    public class EventAnalyticsResponse
    {
        public long TotalEvents { get; set; }
        public long ActiveEvents { get; set; }
        public long TotalSlots { get; set; }
        public long TotalCapacity { get; set; }
    }
}
