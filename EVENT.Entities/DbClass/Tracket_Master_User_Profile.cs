using System;

namespace EVENT.Entities.DbClass
{
    public class Tracket_Master_User_Profile
    {
        public long ProfileId { get; set; }
        public long UserId { get; set; }
        public string? ImageFile { get; set; }
        public string? Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? Gender { get; set; }
        public string? DialCode { get; set; }
        public string? MobileNumber { get; set; }
        public string? AlternativeMobileNumber { get; set; }
        public string? WhatsappNumber { get; set; }
        public string? StreetName { get; set; }
        public string? AreaName { get; set; }
        public string? Landmark { get; set; }
        public string? Pincode { get; set; }
        public long? CityId { get; set; }
        public long? StateId { get; set; }
        public long? CountryId { get; set; }
        public string? CountryName { get; set; }
        public string? StateName { get; set; }
        public string? CityName { get; set; }
        public string? About { get; set; }
        public string? FacebookLink { get; set; }
        public string? WebsiteLink { get; set; }
        public string? YoutubeLink { get; set; }
        public string? InstagramLink { get; set; }
        public string? TwitterLink { get; set; }
        public string? LinkedinLink { get; set; }
        public string? PintrestLink { get; set; }
        public bool IsActive { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? CreatedFrom { get; set; }
        public long? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedFrom { get; set; }
    }
}
