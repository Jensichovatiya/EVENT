using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class AssetRepository : IAssetRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AssetRepository(
            IGeneralFunctions gf, 
            IConfiguration config, 
            IWebHostEnvironment env, 
            IHttpContextAccessor httpContextAccessor)
        {
            _gf = gf;
            _config = config;
            _env = env;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ApiResponseModel<AssetTypeResponse>> AddEditAssetTypeAsync(AssetTypeRequest request, IFormFile? iconFile)
        {
            try
            {
                // Save uploaded icon and resolve URL
                if (iconFile != null && iconFile.Length > 0)
                {
                    var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
                    var ext = Path.GetExtension(iconFile.FileName).ToLowerInvariant();

                    if (!allowed.Contains(ext))
                    {
                        return new ApiResponseModel<AssetTypeResponse>
                        {
                            Success = false,
                            StatusCode = 400,
                            Message = "Only image files allowed (jpg, png, gif, webp, svg)."
                        };
                    }

                    var folder = Path.Combine(_env.WebRootPath ?? Directory.GetCurrentDirectory(), "image", "asset-type");

                    if (!Directory.Exists(folder))
                        Directory.CreateDirectory(folder);

                    var fileName = $"{Guid.NewGuid()}{ext}";
                    var filePath = Path.Combine(folder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                        await iconFile.CopyToAsync(stream);

                    var requestContext = _httpContextAccessor.HttpContext?.Request;
                    if (requestContext != null)
                    {
                        request.IconUrl = $"{requestContext.Scheme}://{requestContext.Host}/image/asset-type/{fileName}";
                    }
                    else
                    {
                        request.IconUrl = $"/image/asset-type/{fileName}";
                    }
                }

                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditAssetType", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<AssetTypeResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<AssetTypeResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<AssetTypeResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<AssetTypeResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to add/edit asset type."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<AssetTypeResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<AssetTypeResponse>>> GetAssetTypesAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetAssetTypes");
                var list = new List<AssetTypeResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<AssetTypeResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<AssetTypeResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Asset types retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<AssetTypeResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<AssetResponse>> AddEditAssetAsync(AssetRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditAsset", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<AssetResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<AssetResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<AssetResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<AssetResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to add/edit asset."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<AssetResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<AssetResponse>>> GetAssetsAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetAssets");
                var list = new List<AssetResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<AssetResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<AssetResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Assets retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<AssetResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> AllocateReturnAssetAsync(AssetAllocationRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AllocateReturnAsset", parameters);

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
                        Data = status == 200 ? "Asset allocated/returned successfully" : null
                    };
                }
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Allocation failed."
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

        public async Task<ApiResponseModel<List<AssetInventoryResponse>>> GetAssetInventoryAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetAssetInventory");
                var list = new List<AssetInventoryResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<AssetInventoryResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<AssetInventoryResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Inventory retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<AssetInventoryResponse>>
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
