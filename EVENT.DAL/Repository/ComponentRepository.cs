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
    public class ComponentRepository : IComponentRepository
    {
        private readonly IGeneralFunctions _gf;

        public ComponentRepository(IGeneralFunctions gf)
        {
            _gf = gf;
        }

        // ── Add / Edit Component ───────────────────────────────────────────────
        public async Task<ApiResponseModel<ComponentResponse>> AddEditComponentAsync(ComponentRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditComponent", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int    status  = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<ComponentResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<ComponentResponse>
                        {
                            Success    = true,
                            StatusCode = status,
                            Message    = message,
                            Data       = data
                        };
                    }

                    return new ApiResponseModel<ComponentResponse>
                    {
                        Success    = false,
                        StatusCode = status,
                        Message    = message
                    };
                }

                return new ApiResponseModel<ComponentResponse>
                {
                    Success    = false,
                    StatusCode = 500,
                    Message    = "Failed to add/edit component."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<ComponentResponse>
                {
                    Success    = false,
                    StatusCode = 500,
                    Message    = ex.Message,
                    Errors     = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        // ── Get All Components (with optional search + pagination) ─────────────
        public async Task<ApiResponseModel<List<ComponentResponse>>> GetComponentsAsync(
            string? searchText = null,
            int pageNumber = 1,
            int pageSize  = 20)
        {
            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "@SearchText",  searchText  ?? (object)DBNull.Value },
                    { "@PageNumber",  pageNumber },
                    { "@PageSize",    pageSize }
                };

                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetAllComponent", parameters);
                var list   = new List<ComponentResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<ComponentResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<ComponentResponse>>
                {
                    Success    = true,
                    StatusCode = 200,
                    Message    = "Components retrieved successfully.",
                    Data       = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<ComponentResponse>>
                {
                    Success    = false,
                    StatusCode = 500,
                    Message    = ex.Message,
                    Errors     = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        // ── Get Component By ID ────────────────────────────────────────────────
        public async Task<ApiResponseModel<ComponentResponse>> GetComponentByIdAsync(long componentId)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@ComponentId", componentId } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetComponentById", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int    status  = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<ComponentResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<ComponentResponse>
                        {
                            Success    = true,
                            StatusCode = status,
                            Message    = message,
                            Data       = data
                        };
                    }

                    return new ApiResponseModel<ComponentResponse>
                    {
                        Success    = false,
                        StatusCode = status,
                        Message    = message
                    };
                }

                return new ApiResponseModel<ComponentResponse>
                {
                    Success    = false,
                    StatusCode = 404,
                    Message    = "Component not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<ComponentResponse>
                {
                    Success    = false,
                    StatusCode = 500,
                    Message    = ex.Message,
                    Errors     = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        // ── Soft-delete Component ──────────────────────────────────────────────
        public async Task<ApiResponseModel<string>> DeleteComponentAsync(
            long   componentId,
            string updatedBy,
            string updatedFrom)
        {
            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "@ComponentId",  componentId }                };

                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_DeleteComponent", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row    = ds.Tables[0].Rows[0];
                    int    status  = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success    = status == 200,
                        StatusCode = status,
                        Message    = message,
                        Data       = status == 200 ? "Component deleted successfully." : null
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success    = false,
                    StatusCode = 400,
                    Message    = "Failed to delete component."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success    = false,
                    StatusCode = 500,
                    Message    = ex.Message,
                    Errors     = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }
    }
}
