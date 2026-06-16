using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_Chef
    {
        public long ChefId { get; set; }

        public long EventId { get; set; }

        public string? ImageFile { get; set; }

        public string ChefName { get; set; }

        public string? Speciality { get; set; }

        public string EmailId { get; set; }

        public string DialCode { get; set; }

        public string MobileNumber { get; set; }

        public string? Experience { get; set; }

        public string? FacebookLink { get; set; }

        public string? WebsiteLink { get; set; }

        public string? YoutubeLink { get; set; }

        public string? InstagramLink { get; set; }

        public string? TwitterLink { get; set; }

        public string? LinkedInLink { get; set; }

        public string? PintrestLink { get; set; }

        public string Description { get; set; }

        public decimal? HiringPrice { get; set; }

        public DateTime? PaymentDate { get; set; }

        public string PaymentType { get; set; }

        public string TransactionId { get; set; }

        public long? EntryBy { get; set; }

        public DateTime? EntryDate { get; set; }

        public long? UpdateBy { get; set; }

        public DateTime? UpdateDate { get; set; }

        public bool? IsDeleted { get; set; }

        public long? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }


    }
}
