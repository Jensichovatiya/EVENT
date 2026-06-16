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
    public class AddOrEditPhotosVideosInputModel
    {       
        public List<tbl_Event_Photos_and_Videos> TEPV { get; set; }
        [XmlIgnore]
        [NotMapped]
        public List<IFormFile> Documents { get; set; }
    }
}
