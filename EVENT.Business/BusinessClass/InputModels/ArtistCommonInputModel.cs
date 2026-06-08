using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class ArtistCommonInputModel
    {
        public long ArtistId { get; set; }
        public int PageNo { get; set; }
        public int PageSize { get; set; }
    }
}
