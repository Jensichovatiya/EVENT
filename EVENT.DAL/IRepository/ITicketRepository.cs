using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface ITicketRepository
    {
        Task<ApiResponseModel<TicketResponse>>  AddTicketAsync(TicketRequest request);
        Task<ApiResponseModel<EventPassResponse>> AddPassAsync(EventPassRequest request);
        Task<ApiResponseModel<EventAddOnResponse>> AddAddOnAsync(EventAddOnRequest request);
        Task<ApiResponseModel<string>> DeleteAddOnAsync(string publicId);
        Task<ApiResponseModel<EventPromoCodeResponse>> AddPromoCodeAsync(EventPromoCodeRequest request);
        Task<ApiResponseModel<string>> DeletePromoCodeAsync(string publicId);
        Task<ApiResponseModel<EventTaxResponse>> AddTaxAsync(EventTaxRequest request);
        Task<ApiResponseModel<string>> DeleteTaxAsync(string publicId);
        Task<ApiResponseModel<EventFeeResponse>> AddFeeAsync(EventFeeRequest request);
        Task<ApiResponseModel<string>> DeleteFeeAsync(string publicId);
        Task<ApiResponseModel<List<TicketResponse>>> GetTicketsAsync(long eventId);
        Task<ApiResponseModel<List<EventPassResponse>>> GetPassesAsync(long eventId);
        Task<ApiResponseModel<List<EventAddOnResponse>>> GetAddOnsAsync(long eventId);
        Task<ApiResponseModel<List<EventPromoCodeResponse>>> GetPromoCodesAsync(long eventId);
        Task<ApiResponseModel<List<EventTaxResponse>>> GetTaxesAsync(long eventId);
        Task<ApiResponseModel<List<EventFeeResponse>>> GetFeesAsync(long eventId);
    }
}


