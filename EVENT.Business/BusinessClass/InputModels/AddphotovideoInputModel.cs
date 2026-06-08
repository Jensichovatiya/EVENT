using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public class AddphotovideoInputModel {
        public long EventId { get; set; }
        public string? Description { get; set; }
        public string? EventDate {  get; set; }

    }
}
