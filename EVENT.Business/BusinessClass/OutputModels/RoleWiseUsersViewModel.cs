using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class RoleWiseUsersViewModel {
        public List<tbl_Master_User> UserList { get; set; }
        public List<tbl_Master_Role>? tbl_Master_Roles { get; set; }
        public int RoleId { get; set; }

    }
}
