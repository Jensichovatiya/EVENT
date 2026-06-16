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
    public class KycDetailsRequestModel
    {
        public tbl_Master_User_KYC_Details tbl_Master_User_KYC_Details { get; set; }

        [XmlIgnore]
        [NotMapped]
        public IFormFile? PancardImage { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? PassbookImage { get; set; }
    }
}
