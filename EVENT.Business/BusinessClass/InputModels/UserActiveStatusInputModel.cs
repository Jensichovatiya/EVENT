using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels {
    public class UserActiveStatusInputModel {
        public long Id { get; set; }
        public bool? IsActive { get; set; }
    }
}
