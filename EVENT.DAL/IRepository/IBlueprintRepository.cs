using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IBlueprintRepository
    {
        // Blueprint CRUD
        Task<ApiResponseModel<List<BlueprintResponse>>> GetBlueprintsByEventAsync(long eventId);
        Task<ApiResponseModel<BlueprintResponse>> GetBlueprintByIdAsync(long blueprintId, string blueprintRId);
        Task<ApiResponseModel<string>> AddEditBlueprintAsync(BlueprintRequest request);
        Task<ApiResponseModel<string>> DeleteBlueprintAsync(long blueprintId, string blueprintRId);

        // Zone CRUD
        Task<ApiResponseModel<List<ZoneResponse>>> GetZonesByBlueprintAsync(long blueprintId);
        Task<ApiResponseModel<ZoneResponse>> GetZoneByIdAsync(long zoneId, string zoneRId);
        Task<ApiResponseModel<string>> AddEditZoneAsync(ZoneRequest request);
        Task<ApiResponseModel<string>> DeleteZoneAsync(long zoneId, string zoneRId);

        // Seat CRUD
        Task<ApiResponseModel<List<ZoneSeatResponse>>> GetSeatsByZoneAsync(long zoneId, long eventId = 0);
        Task<ApiResponseModel<string>> SaveZoneSeatsAsync(List<ZoneSeatRequest> request);

        // Entry Gate CRUD
        Task<ApiResponseModel<List<EntryGateResponse>>> GetEntryGatesByEventAsync(long eventId);
        Task<ApiResponseModel<string>> AddEditEntryGateAsync(EntryGateRequest request);

        // Zone Pricing CRUD
        Task<ApiResponseModel<List<ZonePricingResponse>>> GetZonePricingByEventAsync(long eventId);
        Task<ApiResponseModel<string>> AddEditZonePricingAsync(ZonePricingRequest request);
    }
}
