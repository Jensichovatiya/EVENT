using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IEventRepository
    {
        Task<ApiResponseModel<EventResponse>> AddEditEvent(EventRequest model, List<IFormFile>? attachments);
        Task<ApiResponseModel<List<EventResponse>>> GetEventsAsync();
        Task<ApiResponseModel<EventResponse>> GetEventByIdAsync(string id);
        Task<ApiResponseModel<string>> UpdateEventStatusAsync(EventStatusUpdateRequest request);
        Task<ApiResponseModel<EventResponse>> DuplicateEventAsync(DuplicateEventRequest request);
        Task<ApiResponseModel<string>> DeleteEventSlotAsync(long slotId);
        Task<ApiResponseModel<string>> DeleteEventDocumentAsync(long documentId);
        Task<ApiResponseModel<EventAnalyticsResponse>> GetEventAnalyticsAsync();
    }
}
