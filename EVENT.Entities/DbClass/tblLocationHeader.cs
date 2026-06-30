using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EXPO.Entities.DbClass
{
    public class tblLocationHeader
    {
        public Tbl_Expo_Location tblExpoLocation { get; set; }

        public List<Tbl_Expo_Location_Documents>tblExpoLocationDocuments { get; set; }
    }
}
