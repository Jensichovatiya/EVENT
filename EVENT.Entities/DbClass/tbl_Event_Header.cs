using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass
{
    public  class tbl_Event_Header
    {
        public long EventId { get; set; }
        public string EventName { get; set; }
        public long EventCategoryId { get; set; }
        public string? EventSubCategoryId { get; set; }
        public string? ThumbnailImage { get; set; }
        public string? BannerImage { get; set; }
        public string About { get; set; }
        public string? FacebookLink { get; set; }
        public string? WebsiteLink { get; set; }
        public string? YoutubeLink { get; set; }
        public string? InstagramLink { get; set; }
        public string? TwitterLink { get; set; }
        public string? LinkedInLink { get; set; }
        public string? PintrestLink { get; set; }
        public string ListingType { get; set; }
        public bool IsBookingAccept { get; set; }
        public string BookingType { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }  
        public string Currency { get; set; }
        public bool? IsCancelled { get; set; }
        public int? CancelReason { get; set; }
        public string? CancelOtherReason { get; set; }
        public bool? IsCancelTermsAccepted { get; set; }
        public long? CancelledBy { get; set; }
        public DateTime? CancelledDate { get; set; }
        public int Status { get; set; }
        public string? RejectionReason { get; set; }
        public int? EventType { get; set; }
        public decimal? LiveStreamingPrice { get; set; }
        public int? LiveStreamingPriceType { get; set; }
        public bool IsPublishActive { get; set; }
        public bool IsPassBookingActive { get; set; }
        public string? LanguageId {  get; set; }

        [XmlIgnore]
        [NotMapped]
        public string? LanguageIds { get; set; }

    }
}





