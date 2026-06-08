using EVENT.Entities.DbClass;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class AddOrEditRoleWiseAccessInputModel {
        public List<tbl_Role_Wise_Module_Access> ModuleAccess { get; set; }
        public int RoleId { get; set; }
        public bool IsAllowToCreateSubPartner { get; set; }
    }
}
