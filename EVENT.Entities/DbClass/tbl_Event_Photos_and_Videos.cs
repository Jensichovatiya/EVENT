using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Photos_and_Videos {
        public long FileId { get; set; }
        public long EventId { get; set; } 
        public string? FileName { get; set; }
        public string? FileType { get; set; }
        public string? FileExtension { get; set; }
        public long? EntryBy { get; set; }
        public DateTime EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? EventDate {  get; set; }
        public string? Description { get; set; }
        [XmlIgnore]
        [NotMapped]
        public string? EventName { get; set; }
    }
}