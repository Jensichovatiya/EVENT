using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Master_User_KYC_Details
    {
        public long KycDetailId { get; set; }
        public long UserId { get; set; }
        public string BankAccountHolderName { get; set; }
        public string BankAccountNo { get; set; }
        public string BankName { get; set; }
        public string IFSCCode { get; set; }
        public string AccountType { get; set; }
        public string UPIId { get; set; }
        public string PancardNo { get; set; }
        public string? PancardImage { get; set; }
        public string? PassbookImage { get; set; }
    }
}
