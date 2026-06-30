using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Booking_Schedule {
        public long ScheduleId { get; set; }
        [Required]
        public long EventId { get; set; }
        public long? SlabId { get; set; }
        public long? TicketId { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public decimal? DiscountRate { get; set; }
        public string DiscountType { get; set; }
        public bool IsGroupDiscount { get; set; }
        public long? EntryBy { get; set; }
        public DateTime EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int NoOfPerson { get; set; }
        public int MaxPersonCanBook { get; set; }
        [XmlIgnore]
        public decimal? Amount { get; set; }
        [XmlIgnore]
        public decimal? TotalAmount { get; set; }
        [Required]
        public long SrNo { get; set; }
        [NotMapped]
        public DateTime? EventEndDate { get; set; }
        [XmlIgnore]
        public string? SlabName { get; set; }
        [XmlIgnore]
        public string? ticketName { get; set; }
        [XmlIgnore]
        [NotMapped]
        public string? EventName { get; set; }
        public List<tbl_Event_Booking_Schedule_Group_Discount>? Group_Discount { get; set; }

    }

}