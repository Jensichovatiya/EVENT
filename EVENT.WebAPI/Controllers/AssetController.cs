using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        // ── Asset Types ────────────────────────────────────────────────────────

        [HttpGet("asset-types")]
        public async Task<IActionResult> GetAssetTypes()
        {
            var result = await _assetRepository.GetAssetTypesAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("asset-types/{id}")]
        public async Task<IActionResult> GetAssetTypeById(long id)
        {
            var result = await _assetRepository.GetAssetTypeByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>
        /// POST api/asset-types
        /// Accepts multipart/form-data with optional IconFile.
        /// Pass all fields as form fields; IconFile (optional) overrides IconUrl.
        /// </summary>
        [HttpPost("asset-types")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddEditAssetType([FromForm] AssetTypeRequest obj, IFormFile? IconFile = null)
        {
            if (obj == null)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Model parameter is required." });

            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _assetRepository.AddEditAssetTypeAsync(obj, IconFile);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("asset-types/{id}")]
        public async Task<IActionResult> DeleteAssetType(long id)
        {
            var result = await _assetRepository.DeleteAssetTypeAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        // ── Assets ─────────────────────────────────────────────────────────────

        [HttpGet("assets")]
        public async Task<IActionResult> GetAssets()
        {
            var result = await _assetRepository.GetAssetsAsync();
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

        // ── Allocation ─────────────────────────────────────────────────────────

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
