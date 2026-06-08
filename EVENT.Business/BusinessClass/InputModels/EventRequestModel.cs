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
    public class EventRequestModel
    {
        public tbl_Event_Header tblEventHeader { get; set; }
        public List<tbl_Event_Dates> EventDates { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? ThumbnailFile { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? BannerFile { get; set; }
    }
}
