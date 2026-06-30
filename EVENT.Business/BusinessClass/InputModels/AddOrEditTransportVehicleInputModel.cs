using EVENT.Entities.DbClass;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Business.BusinessClass.InputModels {
    public class AddOrEditTransportVehicleInputModel {
        public tbl_Event_TransportVehicle tbl_Event_TransportVehicle { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? ImageFile { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? RCbookFrontPhoto { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? RCBookBackPhoto { get; set; }

    }
}
