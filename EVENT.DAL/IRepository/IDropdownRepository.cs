using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IDropdownRepository
    {
        Task<ApiResponseModel<UserDDLResponse>> GetUserDDLAsync();
        Task<ApiResponseModel<EventDDLResponse>> GetEventDDLAsync();
        Task<ApiResponseModel<AssetDDLResponse>> GetAssetDDLAsync();
        Task<ApiResponseModel<BookingDDLResponse>> GetBookingDDLAsync();
        Task<ApiResponseModel<EventDropdownsResponse>> GetEventDropdownsAsync(long eventId = 0);
    }
}
