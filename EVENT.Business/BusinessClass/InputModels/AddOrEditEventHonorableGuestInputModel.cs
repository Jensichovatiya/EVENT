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
    public class AddOrEditEventHonorableGuestInputModel
    {
        public tbl_Event_HonorableGuest tbl_Event_HonorableGuest { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? ImageFile { get; set; }

    }
}
