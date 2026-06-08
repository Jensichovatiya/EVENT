using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class HotelRoomOutputDetails {
        public long RoomId { get; set; }
        public long EventId { get; set; }
        public long HotelId { get; set; }
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public string? RoomType { get; set; }
        public int? NoOfRoom { get; set; }
        public string? BreakFast { get; set; }
        public string? BedType { get; set; }
        public string? RoomNO { get; set; }
        public int? PersonCapacity { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool? IsDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public string? RoomTypeName {  get; set; }
        public string? BedTypeName { get; set; }

        public string? BreakfastName { get; set; }

    }
}
