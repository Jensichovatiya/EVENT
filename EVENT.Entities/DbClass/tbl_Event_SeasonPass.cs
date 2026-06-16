using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_SeasonPass {
        public long SeasonPassId { get; set; }
        public long EventId { get; set; }
        public bool? SeatingArrangement { get; set; }
        public string? EventDate { get; set; }
        public long? TicketId { get; set; }
        public long ZoneId { get; set; }
        public string ItemType { get; set; }
        public long? TotalNoOfSeating { get; set; }
        public long? TotalPerson { get; set; }
        public decimal? TotalAmount { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        [NotMapped]
        [XmlIgnore]
        public string? SelectedSeatingTypes { get; set; }
        public long? SrNo { get; set; }



        public List<tbl_Event_SeasonPass_Details> seasonPassDetails { get; set; }


    }
}
