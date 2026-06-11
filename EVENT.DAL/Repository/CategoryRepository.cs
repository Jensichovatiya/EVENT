using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;

        public CategoryRepository(IGeneralFunctions gf, IConfiguration config)
        {
            _gf = gf;
            _config = config;
        }

        public async Task<ApiResponseModel<CategoryResponse>> AddEditCategoryAsync(CategoryRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditEventCategory", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<CategoryResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<CategoryResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<CategoryResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<CategoryResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete category operation."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<CategoryResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<CategoryResponse>>> GetCategoriesAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventCategories");
                var list = new List<CategoryResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<CategoryResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<CategoryResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Categories retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<CategoryResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<CategoryResponse>> GetCategoryByIdAsync(string rid)
        {
            try
            {
                var parameters = new Dictionary<string, object>();
                if (long.TryParse(rid, out long id))
                {
                    parameters.Add("@CategoryId", id);
                }
                else
                {
                    parameters.Add("@CategoryRId", rid);
                }
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventCategories", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var cat = DataRowToObject.CreateItemFromRow<CategoryResponse>(ds.Tables[0].Rows[0]);
                    return new ApiResponseModel<CategoryResponse>
                    {
                        Success = true,
                        StatusCode = 200,
                        Message = "Category retrieved successfully.",
                        Data = cat
                    };
                }

                return new ApiResponseModel<CategoryResponse>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Category not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<CategoryResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> UpdateCategoryStatusAsync(CategoryStatusUpdateRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_UpdateEventCategoryStatus", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "Category status updated successfully" : null
                    };
                }
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to update category status."
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

        public async Task<ApiResponseModel<string>> DeleteCategoryAsync(string id)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@CategoryRId", id } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_DeleteEventCategory", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "Category deleted successfully" : null
                    };
                }
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to delete category."
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
