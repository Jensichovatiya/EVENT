using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class EventDetailsOutputModel {
        public long SrNo { get; set; }
        public long EventId { get; set; }
        public string EventName { get; set; }
        public int? EventCategoryId { get; set; }
        public string CategoryName { get; set; }
        public string? EventSubCategoryId { get; set; }
        public string SubcategoryName { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public int StallCount { get; set; }
        public int StallOverallCount { get; set; }
        public int UserCount { get; set; }
        public int VisitorCount { get; set; }
        public string ThumbnailImage { get; set; }
        public string BannerImage { get; set; }
        public string StateName { get; set; }
        public string CityName { get; set; }
        public bool IsBookingAccept { get; set; }
        public int BookingType { get; set; }
        public bool IsCancelled { get; set; }
        public int CancelReason { get; set; }
        public string? CancelOtherReason { get; set; }
        public bool IsCancelTermsAccepted { get; set; }
        public long CancelledBy { get; set; }
        public DateTime CancelledDate { get; set; }
        public int Status { get; set; }
        public int StateId { get; set; }
        public int ZoneId { get; set; }
        public string ZoneName { get; set; }
        public int SizeId { get; set; }
        public string SizeUnit { get; set; }
        public int? SlabId { get; set; }
        public string SlabName { get; set; }
        public int? FoodStallId { get; set; }
        public string FoodStallName { get; set; }
        public bool IsPublishActive { get; set; }
        public bool IsPassBookingActive { get; set; }
        public bool IsAnyBookingDone { get; set; }
        public string? ListingType { get; set; }


    }
}
