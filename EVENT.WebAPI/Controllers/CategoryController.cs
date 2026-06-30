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
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryController(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        [HttpPost("categories")]
        public async Task<IActionResult> AddEditCategory([FromBody] CategoryRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _categoryRepository.AddEditCategoryAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _categoryRepository.GetCategoriesAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("categories/{id}")]
        public async Task<IActionResult> GetCategoryById(string id)
        {
            var result = await _categoryRepository.GetCategoryByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("categories/status")]
        public async Task<IActionResult> UpdateCategoryStatus([FromBody] CategoryStatusUpdateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _categoryRepository.UpdateCategoryStatusAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(string id)
        {
            var result = await _categoryRepository.DeleteCategoryAsync(id);
            return StatusCode(result.StatusCode, result);
        }
    }
}
