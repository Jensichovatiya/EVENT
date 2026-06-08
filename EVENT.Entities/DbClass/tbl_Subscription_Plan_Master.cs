using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Subscription_Plan_Master
    {
        public long Id { get; set; }
        public string? Name { get; set; }
        public decimal? Rate { get; set; }
        public string? RateType { get; set; }
        public int? MaxAllowedExhibitionDays { get; set; }
        public decimal? BeyondExhibitionDaysPerDayPrice { get; set; }
        public int? MaxAllowedBooth { get; set; }
        public decimal? BeyondMaxAllowedBoothPerBoothPrice { get; set; }
        public int? NoCommissionTicketCount { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public decimal? GSTRate { get; set; }

        public DateTime? UpdateDate { get; set; }
    }
}
