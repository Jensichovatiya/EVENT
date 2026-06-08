using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Stall_Size {
        public long SizeId { get; set; }
        public long? EventId { get; set; }
        public string SizeUnit { get; set; }
        public decimal? Height { get; set; }
        public decimal? Width { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        [XmlIgnore]
        [NotMapped]
        public string? SizeName { get; set; }

    }
}