using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Hotel {
        public long HotelId { get; set; }
        public long EventId { get; set; }
        public string? ImageFile { get; set; }
        public string? Name { get; set; }
        public string DialCode { get; set; }
        public string MobileNo { get; set; }
        public string? StarType { get; set; }
        public string Address { get; set; }
        public string? Amenities { get; set; }
        public string Description { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool? IsDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public TimeSpan? CheckInTime { get; set; }
        public TimeSpan? CheckOutTime { get; set; }
   
        public decimal? Payout { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? PaymentType { get; set; }
        public string? TransactionId { get; set; }


        [XmlIgnore]
        [NotMapped]
        public string? AmeniIds { get; set; }
        [XmlIgnore]
        [NotMapped]
        public string? AmenityNames { get; set; }

    }
}
