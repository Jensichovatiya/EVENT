using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public class UpdateDescriptionRequest {
        public long FileId { get; set; }
        public string Description { get; set; }
    }
}
