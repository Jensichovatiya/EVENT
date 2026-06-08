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
    public class UserProfileViewModel {
        public GetUserDetailsInputModel GetUserDetails { get; set; }
        public KycDetailsRequestModel KycDetails { get; set; }
    }
}
