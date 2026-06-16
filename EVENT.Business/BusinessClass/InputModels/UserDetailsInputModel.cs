using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public  class UserDetailsInputModel {
        public int PageNo { get; set; }
        public int PageSize { get; set; }
        public string? FilterRoleId { get; set; }
        public long UserId { get; set; }
    }
}
