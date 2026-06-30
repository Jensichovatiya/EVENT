using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class StallArrangementOutputModel {
        public bool SeatingArrangement { get; set; }
        public int? ArrangementType { get; set; }
        public int? EventType { get; set; }
        public string? EventDate { get; set; }
        public long? TicketId { get; set; }
        public string? TicketName { get; set; }
        public long ZoneId { get; set; }
        public string? ZoneName { get; set; }
        public string? MainItemType { get; set; }
        public string? MainItemName { get; set; }
        public long? TotalNoOfSeating { get; set; }
        public long? AllTotalPerson { get; set; }
        public decimal AllTotalAmount { get; set; }
        public long EventId { get; set; }
        public long? ArrangementId { get; set; }
        public string? ItemType { get; set; }
        public string? ItemName { get; set; }
        public int NoOfItem { get; set; }
        public int? PerItemPerson { get; set; }
        public int? TotalPerson { get; set; }
        public decimal PerPersonPrice { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Description { get; set; }
    }
}
