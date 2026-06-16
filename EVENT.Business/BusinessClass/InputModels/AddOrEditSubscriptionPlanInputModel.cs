using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class AddOrEditSubscriptionPlanInputModel
    {
        public tbl_Subscription_Plan_Master SubscriptionPlanMasters { get; set; }
        public List<tbl_Subscription_Plan_Module>? SubscriptionPlanModule { get; set; }
    }
}
