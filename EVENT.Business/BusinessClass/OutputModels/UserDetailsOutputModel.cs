using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public  class UserDetailsOutputModel {
        public int? Id { get; set; }

        public string? Name { get; set; }

        public string? EmailId { get; set; }

        public string? MobileNo { get; set; }

        public int? UserRole { get; set; }

        public string? RoleName { get; set; }

        public int? UserType { get; set; }

        public string? UserTypeName { get; set; }

        public DateTime? EntryDate { get; set; }
        public bool IsActive { get; set; }
    }
}
