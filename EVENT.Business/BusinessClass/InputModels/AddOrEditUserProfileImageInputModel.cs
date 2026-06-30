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
    public class AddOrEditUserProfileImageInputModel {
        public long UserId { get; set; }
        public string Name { get; set; }

        [NotMapped]
        [XmlIgnore]
        public IFormFile? ImageFile { get; set; }
    }
}
