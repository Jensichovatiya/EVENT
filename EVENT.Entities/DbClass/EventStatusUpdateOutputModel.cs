using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass
{
    public class EventStatusUpdateOutputModel
    {

        public long EventId { get; set; }
        public int EventStatus { get; set; }
        public long BaseUserId { get; set; }
        public string Reason { get; set; }

    }
}
