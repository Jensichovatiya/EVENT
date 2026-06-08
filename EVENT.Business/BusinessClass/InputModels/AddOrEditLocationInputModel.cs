using Microsoft.AspNetCore.Http;
using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Business.BusinessClass.OutputModels
{
    public class AddOrEditLocationInputModel {
        public tbl_Event_Location TEL { get; set; }
        public List<tbl_Event_Location_Documents>? TELD { get; set; }
        [XmlIgnore]
        [NotMapped]
        public List<IFormFile>? Documents { get; set; }
    }
}
