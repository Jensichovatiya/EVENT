using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class ShowBookingDetailsOutPutModel {
        public long BookingId { get; set; }
        public long EventId { get; set; }
        public int PassType { get; set; }
        public string EventDate { get; set; }
        public int Qty { get; set; }
        public decimal TotalAmount { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailId { get; set; }
        public string ManualAddress { get; set; }
        public string DialCode { get; set; }
        public string MobileNo { get; set; }
        public bool PrivacyPolicy { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? BannerImage { get; set; }
        public string? ThumbnailImage { get; set; }
        public string? Category { get; set; }
        public DateTime EventStartDate { get; set; }
        public DateTime EventEndDate { get; set; }
        public List<passdetails> pass {  get; set; }
    }
    public class passdetails {
        public long Id { get; set; }
        public string VisitorPassNo { get; set; }
        public long BookingId { get; set; }
        public long PassId { get; set; }
        public string EventName { get; set; }
        public string ItemType { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal TotalAmount { get; set; }
        public string ManualAddress { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string VisitorPassNoQRBase64 { get; set; }
        public string PassName { get; set; }
        public long? SrNo { get; set; }
    }
}
