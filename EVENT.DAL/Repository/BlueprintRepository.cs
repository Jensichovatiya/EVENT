using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Newtonsoft.Json;
using INvoice.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class BlueprintRepository : IBlueprintRepository
    {
        private readonly IGeneralFunctions _gf;

        public BlueprintRepository(IGeneralFunctions gf)
        {
            _gf = gf;
        }

        // ==========================================
        // BLUEPRINT CRUD
        // ==========================================

        public async Task<ApiResponseModel<List<BlueprintResponse>>> GetBlueprintsByEventAsync(long eventId)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@EventId", eventId } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventBlueprintList", parameters);
                var list = new List<BlueprintResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<BlueprintResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<BlueprintResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Blueprints retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<BlueprintResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<BlueprintResponse>> GetBlueprintByIdAsync(long blueprintId, string blueprintRId)
        {
            try
            {
                var parameters = new Dictionary<string, object>();
                if (blueprintId > 0) parameters.Add("@BlueprintId", blueprintId);
                if (!string.IsNullOrEmpty(blueprintRId)) parameters.Add("@BlueprintRId", blueprintRId);

                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventBlueprintById", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var bp = DataRowToObject.CreateItemFromRow<BlueprintResponse>(ds.Tables[0].Rows[0]);
                    return new ApiResponseModel<BlueprintResponse>
                    {
                        Success = true,
                        StatusCode = 200,
                        Message = "Blueprint retrieved successfully.",
                        Data = bp
                    };
                }

                return new ApiResponseModel<BlueprintResponse>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Blueprint not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<BlueprintResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> AddEditBlueprintAsync(BlueprintRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditEventBlueprint", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = (status == 200 || status == 201),
                        StatusCode = status,
                        Message = message,
                        Data = status == 201 ? Convert.ToString(row["BlueprintId"]) : request.BlueprintId.ToString()
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete blueprint operation."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> DeleteBlueprintAsync(long blueprintId, string blueprintRId)
        {
            try
            {
                var parameters = new Dictionary<string, object>();
                if (blueprintId > 0) parameters.Add("@BlueprintId", blueprintId);
                if (!string.IsNullOrEmpty(blueprintRId)) parameters.Add("@BlueprintRId", blueprintRId);

                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_DeleteEventBlueprint", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = (status == 200),
                        StatusCode = status,
                        Message = message,
                        Data = message
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to delete blueprint."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        // ==========================================
        // ZONE CRUD
        // ==========================================

        public async Task<ApiResponseModel<List<ZoneResponse>>> GetZonesByBlueprintAsync(long blueprintId)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@BlueprintId", blueprintId } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventZoneList", parameters);
                var list = new List<ZoneResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<ZoneResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<ZoneResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Zones retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<ZoneResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<ZoneResponse>> GetZoneByIdAsync(long zoneId, string zoneRId)
        {
            try
            {
                var parameters = new Dictionary<string, object>();
                if (zoneId > 0) parameters.Add("@ZoneId", zoneId);
                if (!string.IsNullOrEmpty(zoneRId)) parameters.Add("@ZoneRId", zoneRId);

                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventZoneById", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var zone = DataRowToObject.CreateItemFromRow<ZoneResponse>(ds.Tables[0].Rows[0]);
                    return new ApiResponseModel<ZoneResponse>
                    {
                        Success = true,
                        StatusCode = 200,
                        Message = "Zone retrieved successfully.",
                        Data = zone
                    };
                }

                return new ApiResponseModel<ZoneResponse>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Zone not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<ZoneResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> AddEditZoneAsync(ZoneRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditEventZone", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = (status == 200 || status == 201),
                        StatusCode = status,
                        Message = message,
                        Data = status == 201 ? Convert.ToString(row["ZoneId"]) : request.ZoneId.ToString()
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete zone operation."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> DeleteZoneAsync(long zoneId, string zoneRId)
        {
            try
            {
                var parameters = new Dictionary<string, object>();
                if (zoneId > 0) parameters.Add("@ZoneId", zoneId);
                if (!string.IsNullOrEmpty(zoneRId)) parameters.Add("@ZoneRId", zoneRId);

                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_DeleteEventZone", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = (status == 200),
                        StatusCode = status,
                        Message = message,
                        Data = message
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to delete zone."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        // ==========================================
        // SEAT CRUD
        // ==========================================

        public async Task<ApiResponseModel<List<ZoneSeatResponse>>> GetSeatsByZoneAsync(long zoneId, long eventId = 0)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@ZoneId", zoneId } };
                if (eventId > 0)
                {
                    parameters.Add("@EventId", eventId);
                }
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventZoneSeatList", parameters);
                var list = new List<ZoneSeatResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<ZoneSeatResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<ZoneSeatResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Seats retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<ZoneSeatResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> SaveZoneSeatsAsync(List<ZoneSeatRequest> request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditEventZoneSeat", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = (status == 200),
                        StatusCode = status,
                        Message = message,
                        Data = message
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to save seats."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        // ==========================================
        // ENTRY GATE CRUD
        // ==========================================

        public async Task<ApiResponseModel<List<EntryGateResponse>>> GetEntryGatesByEventAsync(long eventId)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@EventId", eventId } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventEntryGateList", parameters);
                var list = new List<EntryGateResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<EntryGateResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<EntryGateResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Gates retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<EntryGateResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> AddEditEntryGateAsync(EntryGateRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditEventEntryGate", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = (status == 200 || status == 201),
                        StatusCode = status,
                        Message = message,
                        Data = status == 201 ? Convert.ToString(row["EntryGateId"]) : request.EntryGateId.ToString()
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete entry gate operation."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        // ==========================================
        // ZONE PRICING CRUD
        // ==========================================

        public async Task<ApiResponseModel<List<ZonePricingResponse>>> GetZonePricingByEventAsync(long eventId)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@EventId", eventId } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventZonePricingList", parameters);
                var list = new List<ZonePricingResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<ZonePricingResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<ZonePricingResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Zone pricings retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<ZonePricingResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> AddEditZonePricingAsync(ZonePricingRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditEventZonePricing", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = (status == 200 || status == 201),
                        StatusCode = status,
                        Message = message,
                        Data = status == 201 ? Convert.ToString(row["ZonePricingId"]) : request.ZonePricingId.ToString()
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete zone pricing operation."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }
    }
}
