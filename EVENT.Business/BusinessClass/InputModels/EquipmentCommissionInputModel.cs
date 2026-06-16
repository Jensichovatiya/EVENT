using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public class EquipmentCommissionInputModel {
        public long EquipmentItemId { get; set; }
        public string EquipmentItemType { get; set; }
        public long Commission { get; set; }
        public string CommissionType { get; set; }
        public long CommissionSetBy { get; set; }
    }
}
