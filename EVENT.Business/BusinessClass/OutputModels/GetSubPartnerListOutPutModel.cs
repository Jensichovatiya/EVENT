using System;
using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class GetSubPartnerListOutPutModel {
        public long Id { get; set; }
        public long ParentUserId { get; set; }
        public string Name { get; set; }
        public string ParentUserName { get; set; }
        public int UserRole { get; set; }
        public string UserRoleName { get; set; }
        public int UserType { get; set; }
        public string UserTypeName { get; set; }
        public string MobileNo { get; set; }
        public string EmailId { get; set; }
        public string PartnerId { get; set; }
        public DateTime? EntryDate { get; set; }
        public int SrNo { get; set; }
    }
}
