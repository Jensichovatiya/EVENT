using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class SubscriptionPlanPurchaseInputModel
    {
        public tbl_Payment_TransactionDetails TPT { get; set; }
        public tbl_Subscription_Plan_Purchase_History TSPPH { get; set; }
    }
}
