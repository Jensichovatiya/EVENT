using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Master_User_Profile
    {
        public long UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string DialCode { get; set; }
        public string MobileNumber { get; set; }
        public string AlternativeMobileNumber { get; set; }
        public string WhatsappNumber { get; set; }
        public string StreetName { get; set; }
        public string AreaName { get; set; }
        public long? Pincode { get; set; }
        public int? CityId { get; set; }
        public int? StateId { get; set; }
        public int? CountryId { get; set; }
        public string About { get; set; }
        public string? FacebookLink { get; set; }
        public string? WebsiteLink { get; set; }
        public string? YoutubeLink { get; set; }
        public string? InstagramLink { get; set; }
        public string? TwitterLink { get; set; }
        public string? LinkedinLink { get; set; }
        public string? PintrestLink { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string AlternativeDialCode { get; set; }
        public string WhatsappDialCode { get; set; }
        [NotMapped]
        public string? CityName { get; set; }
        [NotMapped]
        public string? StateName { get; set; }
        [NotMapped]
        public string? CountryName { get; set; }
    }
}
