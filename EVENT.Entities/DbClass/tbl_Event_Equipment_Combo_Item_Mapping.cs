using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Equipment_Combo_Item_Mapping 
    {
        [Key]
        public long Id { get; set; }
        public long EquipmentComboId { get; set; }
        public long EquipmentItemId { get; set; }
        public int? SrNo { get; set; }
    }
}
