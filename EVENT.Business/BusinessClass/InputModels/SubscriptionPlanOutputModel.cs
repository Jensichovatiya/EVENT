using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class SubscriptionPlanOutputModel
    {
        public long SubscriptionPlanId { get; set; }
        public string PlanName { get; set; }
        public decimal Price { get; set; }
        public decimal? GSTRate { get; set; }
        public decimal GSTAmount { get; set; }
        public decimal TotalRate { get; set; }
        public string RateType { get; set; }
        public int MaxAllowedExhibitionDays { get; set; }
        public decimal BeyondExhibitionDaysPerDayPrice { get; set; }
        public int MaxAllowedBooth { get; set; }
        public decimal BeyondMaxAllowedBoothPerBoothPrice { get; set; }
        public int NoCommissionTicketCount { get; set; }


        public List<SubscriptionModuleOutputModel> Modules { get; set; }

    }
    public class SubscriptionModuleOutputModel
    {
        public long? SubscriptionPlanId { get; set; }
        public long? ModuleId { get; set; }
        public string? ModuleName { get; set; }
        public string? GroupModuleName { get; set; }
    }

}
