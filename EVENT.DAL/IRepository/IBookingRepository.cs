using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IBookingRepository
    {
        Task<ApiResponseModel<BookingResponse>> CreateUpdateBookingAsync(BookingRequest request);
        Task<ApiResponseModel<List<BookingResponse>>> GetBookingsAsync();
        Task<ApiResponseModel<BookingResponse>> GetBookingByIdAsync(string id);
        Task<ApiResponseModel<string>> CancelBookingAsync(CancelBookingRequest request);
        Task<ApiResponseModel<SeatAvailabilityResponse>> CheckSeatAvailabilityAsync(SeatAvailabilityRequest request);
    }
}
