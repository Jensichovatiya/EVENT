using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Core.Common.Enum {
    public enum PaymentStatus {
        Pending = 1,
        Created = 2,
        Paid = 3,
        Cancelled = 4,
        RefundInProcess= 5,
        Refunded =6
    }
}
