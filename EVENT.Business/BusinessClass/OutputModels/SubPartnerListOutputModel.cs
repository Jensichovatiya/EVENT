using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class SubPartnerListOutputModel {
        public int Id { get; set; }
        public string SubPartnerName { get; set; }
        public int UserRole { get; set; }
        public string RoleName { get; set; }
        public DateTime EntryDate { get; set; }
        public bool IsActive { get; set; }
        public string CreatedByName { get; set; }
    }
}
