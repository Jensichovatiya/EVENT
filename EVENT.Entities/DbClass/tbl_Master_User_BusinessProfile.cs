using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Master_User_BusinessProfile
    {
        public long BusinessProfileId { get; set; }
        public long UserId { get; set; }
        public string CompanyName { get; set; }
        public string? ImageFile { get; set; }
        public string? GSTNo { get; set; }
        public string Email { get; set; }
        public string DialCode { get; set; }
        public string MobileNumber { get; set; }
        public string WhatsappNumber { get; set; }
        public string CompanyWebsiteName { get; set; }
        public string CompanyCategory { get; set; }
        public string CompanySubCategory { get; set; }
        public string FlatNo { get; set; }
        public string StreetName { get; set; }
        public string AreaName { get; set; }
        public long? Pincode { get; set; }
        public int? CityId { get; set; }
        public int? StateId { get; set; }
        public int? CountryId { get; set; }
        public int? BusinessEstablishYear { get; set; }
        public string? ComapanyPhoto { get; set; }
        public string? CompanyVideo { get; set; }
        public string WhatsappDialCode { get; set; }
        public string? PancardNo { get; set; }
        public bool IsGST { get; set; }
        public bool IsAcceptBankDetails { get; set; }
        public string? BeneficiaryName { get; set; }
        public string? AccountType { get; set; }
        public string? BankName { get; set; }
        public string? BankIFSC { get; set; }
        public string? BankACNo { get; set; }
        public string? UploadGSTCertificate { get; set; }
        public string? PancardPhotoPdf { get; set; }
        public string? CancelChequePhotoPdf { get; set; }
        [NotMapped]
        public string? BusinessCityName { get; set; }
        [NotMapped]
        public string? BusinessStateName { get; set; }
        [NotMapped]
        public string? BusinessCountryName { get; set; }

    }
}
