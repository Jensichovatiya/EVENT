using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.WebAPI.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class AssetController : ControllerBase
    {
        private readonly IAssetRepository _assetRepository;

        public AssetController(IAssetRepository assetRepository)
        {
            _assetRepository = assetRepository;
        }

        [HttpPost("asset-types")]
        public async Task<IActionResult> AddEditAssetType([FromBody] AssetTypeRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _assetRepository.AddEditAssetTypeAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("asset-types")]
        public async Task<IActionResult> GetAssetTypes()
        {
            var result = await _assetRepository.GetAssetTypesAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("assets")]
        public async Task<IActionResult> AddEditAsset([FromBody] AssetRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _assetRepository.AddEditAssetAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("assets")]
        public async Task<IActionResult> GetAssets()
        {
            var result = await _assetRepository.GetAssetsAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("assets/allocation")]
        public async Task<IActionResult> AllocateReturnAsset([FromBody] AssetAllocationRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _assetRepository.AllocateReturnAssetAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("assets/inventory")]
        public async Task<IActionResult> GetAssetInventory()
        {
            var result = await _assetRepository.GetAssetInventoryAsync();
            return StatusCode(result.StatusCode, result);
        }
    }
}
