using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class BookingSchedualPreviewOutputModel {
        public long ScheduleId { get; set; }
        [Required]
        public long EventId { get; set; }
        public long? SlabId { get; set; }
        public long? StallSizeId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public decimal? DiscountRate { get; set; }
        public string DiscountType { get; set; }
        public bool? IsGroupDiscount { get; set; }
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
        public string SlabName { get; set; }
        public string? Name { get; set; }

    }
}
