using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Equipment_Item {
        public long EquipmentItemId { get; set; }
        public long EventId { get; set; }
        public long StallId { get; set; }
        public string EquipmentItemName { get; set; }
        public string QuantityUOM { get; set; }
        public int Quantity { get; set; }
        public string EquipmentCategory { get; set; }
        public string? CommissionType { get; set; }
        public decimal? Commission{ get; set; }
        public decimal? Price { get; set; }
        public string? Description { get; set; }
        public string? ImageFile { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
    }
}