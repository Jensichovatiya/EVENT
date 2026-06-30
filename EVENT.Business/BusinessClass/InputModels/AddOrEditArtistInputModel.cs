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
    public class AddOrEditArtistInputModel
    {
        public tbl_Event_Artist tbl_Event_Artist { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? ImageFile { get; set; }


    }
}
