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
    public class ComponentController : ControllerBase
    {
        private readonly IComponentRepository _componentRepository;

        public ComponentController(IComponentRepository componentRepository)
        {
            _componentRepository = componentRepository;
        }

        // ── Components ─────────────────────────────────────────────────────────

        [HttpGet("components")]
        public async Task<IActionResult> GetComponents([FromQuery] string? searchText = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _componentRepository.GetComponentsAsync(searchText, pageNumber, pageSize);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("components/{id}")]
        public async Task<IActionResult> GetComponentById(long id)
        {
            var result = await _componentRepository.GetComponentByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>
        /// POST api/components
        /// Accepts multipart/form-data with optional IconFile.
        /// Pass all fields as form fields; IconFile (optional) overrides IconUrl.
        /// </summary>
        [HttpPost("components")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddEditComponent([FromForm] ComponentRequest request, IFormFile? IconFile = null)
        {
            if (request == null)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Request body is required." });

            // Save uploaded icon and resolve URL
            if (IconFile != null && IconFile.Length > 0)
            {
                var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
                var ext     = System.IO.Path.GetExtension(IconFile.FileName).ToLowerInvariant();

                if (!allowed.Contains(ext))
                    return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Only image files allowed (jpg, png, gif, webp, svg)." });

                var env    = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
                var folder = System.IO.Path.Combine(env.WebRootPath ?? System.IO.Directory.GetCurrentDirectory(), "image", "component");

                if (!System.IO.Directory.Exists(folder))
                    System.IO.Directory.CreateDirectory(folder);

                var fileName = $"{System.Guid.NewGuid()}{ext}";
                var filePath = System.IO.Path.Combine(folder, fileName);

                using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
                    await IconFile.CopyToAsync(stream);

                request.IconUrl = $"{Request.Scheme}://{Request.Host}/image/component/{fileName}";
            }

            TryValidateModel(request);
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _componentRepository.AddEditComponentAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("components/{id}")]
        public async Task<IActionResult> DeleteComponent(long id, [FromQuery] string? updatedBy = null, [FromQuery] string? updatedFrom = null)
        {
            var result = await _componentRepository.DeleteComponentAsync(id, updatedBy ?? string.Empty, updatedFrom ?? string.Empty);
            return StatusCode(result.StatusCode, result);
        }
    }
}
