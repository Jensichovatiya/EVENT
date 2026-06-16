using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Core.Common.Enum {
    public enum PaymentProcessStatus {
        Created,
        Authorized,
        Captured,
        Refunded,
        Failed,
        Paid,
        Cancelled,
        RefundInProcess
    }
}
