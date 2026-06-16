using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class StallArrangementDisplayOutputModel {
        public long? SrNo { get; set; }
        public long Id { get; set; }
        public long ArrangementId { get; set; }
        public long EventId { get; set; }
        public string EventDate{ get; set; }

        public string ItemType { get; set; }
        public string ItemTypeName { get; set; }
        public int NoOfItem { get; set; }
        public int PerItemPerson { get; set; }
        public int TotalPerson { get; set; }
        public decimal PerPersonPrice { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AllAmount { get; set; }
        public int TotalSeating { get; set; }
        public int AllTotalPerson { get; set; }
        public long? ZoneId { get; set; }
        public string ZoneName { get; set; }
        public string EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public string UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
