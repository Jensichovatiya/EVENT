﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace EVENT.Business.BusinessClass.InputModels {
    public class CancelEventInputModel {
        public long EventId { get; set; }
        public bool IsCancelled { get; set; } = true;
        public int CancelReason { get; set; }
        public string? CancelOtherReason { get; set; }
        public bool IsCancelTermsAccepted { get; set; }
        public long CancelledBy { get; set; }
        public DateTime CancelledDate { get; set; }
    }
}