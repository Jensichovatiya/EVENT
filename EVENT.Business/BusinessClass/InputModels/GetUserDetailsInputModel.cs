using EVENT.Entities.DbClass;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class GetUserDetailsInputModel
    {

        public long UserId { get; set; }
        public string Name { get; set; }
        public string ImageFile { get; set; }
        public string Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string DialCode { get; set; }
        public string AlternativeDialCode { get; set; }
        public string WhatsappDialCode { get; set; }
        public string MobileNumber { get; set; }
        public string AlternativeMobileNumber { get; set; }
        public string WhatsappNumber { get; set; }
        public string StreetName { get; set; }
        public string AreaName { get; set; }
        public string Pincode { get; set; }
        public int? CityId { get; set; }
        public int? StateId { get; set; }
        public int? CountryId { get; set; }
        public string About { get; set; }
        public string FacebookLink { get; set; }
        public string WebsiteLink { get; set; }
        public string YoutubeLink { get; set; }
        public string InstagramLink { get; set; }
        public string TwitterLink { get; set; }
        public string LinkedinLink { get; set; }
        public string PintrestLink { get; set; }
        public int? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public int? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        [NotMapped]
        public string? CityName { get; set; }
        [NotMapped]
        public string? StateName { get; set; }
        [NotMapped]
        public string? CountryName { get; set; }

        // KYC Details
        //public long? KycDetailId { get; set; }
        //public string BankAccountHolderName { get; set; }
        //public string BankAccountNo { get; set; }
        //public string IFSCCode { get; set; }
        //public string UPIId { get; set; }
        //public string? PancardImage { get; set; }
        //public string? PassbookImage { get; set; }

        // Business Profile Information
        public long? BusinessProfileId { get; set; }
        public string CompanyName { get; set; }
        public string BusinessImageFile { get; set; }
        public string? GSTNo { get; set; }
        public string BusinessEmail { get; set; }
        public string BusinessDialCode { get; set; }
        public string BusinessWhatsappDialCode { get; set; }
        public string BusinessMobileNumber { get; set; }
        public string BusinessWhatsappNumber { get; set; }
        public string CompanyWebsiteName { get; set; }
        public string CompanyCategory { get; set; }
        public string CompanySubCategory { get; set; }
        public string FlatNo { get; set; }
        public string BusinessStreetName { get; set; }
        public string BusinessAreaName { get; set; }
        public string BusinessPincode { get; set; }
        public int? BusinessCityId { get; set; }
        public int? BusinessStateId { get; set; }
        public int? BusinessCountryId { get; set; }
        public int? BusinessEstablishYear { get; set; }
        public string ComapanyPhoto { get; set; }
        public string CompanyVideo { get; set; }
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
        public List<BankAccountList>? BankList { get; set; }
        public List<BusinessAccountList>? BusinessList { get; set; }
        [NotMapped]
        public string? BusinessCityName { get; set; }
        [NotMapped]
        public string? BusinessStateName { get; set; }
        [NotMapped]
        public string? BusinessCountryName { get; set; }

    }
    public class UserBusinessProfileFileUploadModel
    {
        public IFormFile? BusinessImageFile { get; set; }
        public IFormFile? ComapanyPhoto { get; set; }
        public IFormFile? CompanyVideo { get; set; }
        public IFormFile? UploadGSTCertificate { get; set; }
        public IFormFile? PancardPhotoPdf { get; set; }
        public IFormFile? CancelChequePhotoPdf { get; set; }
    }
    public class BankAccountList
    {
        public long KycDetailId { get; set; }
        public string BankName { get; set; }
    }
    public class BusinessAccountList
    {
        public long BusinessProfileId { get; set; }
        public string CompanyName { get; set; }
    }
}

