using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Event_HonorableGuest
    {
        public long GuestId { get; set; } 
        public long EventId { get; set; }
        public string? ImageFile { get; set; }
        public string GuestName { get; set; }
        public string Designation { get; set; }
        public string Information { get; set; }
        public string? FacebookLink { get; set; }
        public string? WebsiteLink { get; set; }
        public string? YoutubeLink { get; set; }
        public string? InstagramLink { get; set; }
        public string? TwitterLink { get; set; }
        public string? LinkedInLink { get; set; }
        public string? PintrestLink { get; set; }
        public long EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; } 
        public DateTime? UpdateDate { get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public long CommonGuestId { get; set; }
    }
}
