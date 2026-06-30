using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IAssetRepository
    {
        Task<ApiResponseModel<AssetTypeResponse>> AddEditAssetTypeAsync(AssetTypeRequest request, IFormFile? iconFile);
        Task<ApiResponseModel<List<AssetTypeResponse>>> GetAssetTypesAsync();
        Task<ApiResponseModel<AssetResponse>> AddEditAssetAsync(AssetRequest request);
        Task<ApiResponseModel<List<AssetResponse>>> GetAssetsAsync();
        Task<ApiResponseModel<string>> AllocateReturnAssetAsync(AssetAllocationRequest request);
        Task<ApiResponseModel<List<AssetInventoryResponse>>> GetAssetInventoryAsync();
    }
}
