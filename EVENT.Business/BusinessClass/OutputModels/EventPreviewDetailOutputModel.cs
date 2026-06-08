using EVENT.Entities.DbClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class EventPreviewDetailOutputModel {
        public long EventId { get; set; }
        public int EventStatus { get; set; }
        public List<tbl_Event_Dates> TblDates { get; set; }
        public List<tbl_Event_Photos_and_Videos> TblPhotoAndVideo { get; set; }
        public List<tbl_Event_Location_Documents> LocDocument { get; set; }
        public CreateEventPreviewOutputModel CraeteEventPreview { get; set; }
        public LocationPreviewOutputModel LocationPreview { get; set; }
        public List<BookingSchedualPreviewOutputModel>? BookingSchedualPreview { get; set; }

        public List<StallArrangementOutputModel> StallArrangement { get; set; }
        public List<SeasonPassOutputModel>? seasonPasses { get; set; }

    }
}
