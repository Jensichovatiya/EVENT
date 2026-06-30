using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class FacilityRepository : IFacilityRepository
    {
        private readonly IGeneralFunctions _gf;

        public FacilityRepository(IGeneralFunctions gf)
        {
            _gf = gf;
        }

        public async Task<ApiResponseModel<List<FacilityResponse>>> GetFacilitiesAsync(
        string searchText = null,
        int pageNumber = 1,
        int pageSize = 20)
        {
            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "@SearchText", searchText },
                    { "@PageNumber", pageNumber },
                    { "@PageSize", pageSize }
                };

                DataSet ds = await _gf.GetDataSetFromSPAsync(
                    "USP_GetEventMasterFacilities",
                    parameters);

                var list = new List<FacilityResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0]
                        .AsEnumerable()
                        .Select(DataRowToObject.CreateItemFromRow<FacilityResponse>)
                        .ToList();
                }

                return new ApiResponseModel<List<FacilityResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Facilities retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<FacilityResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }


        // ── Add / Edit facility -------------------------------------------------
        public async Task<ApiResponseModel<FacilityResponse>> AddEditFacilityAsync(FacilityRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@HeaderJson", jsonData } };

                DataSet ds = await _gf.GetDataSetFromSPAsync(
                    "USP_AddEditEventMasterFacility",
                    parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? string.Empty;

                    if (status == 200 || status == 201)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<FacilityResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<FacilityResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }

                    return new ApiResponseModel<FacilityResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }

                return new ApiResponseModel<FacilityResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to add/edit facility."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<FacilityResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        // ── Delete facility -----------------------------------------------------
        public async Task<ApiResponseModel<string>> DeleteFacilityAsync(long facilityId)
        {
            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "@FacilityId", facilityId }
                };

                DataSet ds = await _gf.GetDataSetFromSPAsync(
                    "USP_DeleteEventMasterFacility",
                    parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? string.Empty;

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "Facility deleted successfully." : null
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to delete facility."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }
    }
}
