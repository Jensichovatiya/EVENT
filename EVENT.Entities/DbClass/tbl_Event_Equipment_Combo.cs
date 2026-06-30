using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Equipment_Combo {
        public long EquipmentComboId { get; set; }
        public long StallId { get; set; }
        public long EventId { get; set; }
        public string ComboName { get; set; }
        public decimal? Price { get; set; }
        public decimal Commission{ get; set; }
        public long  SrNo { get; set; }
        public string Description { get; set; }
        public string? CommissionType { get; set; }
        public string? ImageFile { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public List<tbl_Event_Equipment_Combo_Item_Mapping>? TEECIM { get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
    }
}
