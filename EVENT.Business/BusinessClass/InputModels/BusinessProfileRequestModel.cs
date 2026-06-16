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
    public class BusinessProfileRequestModel
    {
        public tbl_Master_User_BusinessProfile tbl_Master_User_BusinessProfile { get; set; }

        [XmlIgnore]
        [NotMapped]
        public IFormFile? ImageFile { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? ComapanyPhoto { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? CompanyVideo { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? UploadGSTCertificate { get; set; }

        [XmlIgnore]
        [NotMapped]
        public IFormFile? PancardPhotoPdf { get; set; }

        [XmlIgnore]
        [NotMapped]
        public IFormFile? CancelChequePhotoPdf { get; set; }

    }
}
