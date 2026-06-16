using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_Agenda
    {
        public long AgendaId { get; set; }
        public long EventId { get; set; }
        public DateTime? Date { get; set; }
        public string? TopicNo { get; set; }
        public string TopicName { get; set; }
        public string? PresentBy { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public decimal? Hours { get; set; }
        public string? Description { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public long? SrNo { get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
    }
}
