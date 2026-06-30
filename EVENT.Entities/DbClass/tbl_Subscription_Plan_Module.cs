using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class tbl_Subscription_Plan_Module
    {
        public long Id { get; set; }
        public long? SubscriptionPlanId { get; set; }
        public long? ModuleId { get; set; }
    }
}
