using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class RegisterSubPartnerInputModel
    {
        public string MobileNo { get; set; }
        public string Name { get; set; }
        public string PartnerId { get; set; }
        public int UserType { get; set; }
        public int UserRole { get; set; }
        public string DialCode { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public long EntryBy { get; set; }
        public List<tbl_Master_Country>? dialCodeList { get; set; }
        public List<tbl_Master_Role>? UserTypeList { get; set; }

    }
}
