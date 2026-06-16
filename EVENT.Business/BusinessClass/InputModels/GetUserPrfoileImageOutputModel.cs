using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class GetUserPrfoileImageOutputModel {
       
        public long UserId { get; set; }
        public string Name { get; set; }
        public string ImageFile { get; set; }
       
    }
}
