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
    public class FacilityController : ControllerBase
    {
        private readonly IFacilityRepository _facilityRepository;

        public FacilityController(IFacilityRepository facilityRepository)
        {
            _facilityRepository = facilityRepository;
        }

        [HttpGet("facilities")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFacilities(
            string searchText = null,
            int pageNumber = 1,
            int pageSize = 20)
        {
            var result = await _facilityRepository.GetFacilitiesAsync(
                searchText,
                pageNumber,
                pageSize);

            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("facilities")]
        public async Task<IActionResult> AddEditFacility([FromBody] FacilityRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _facilityRepository.AddEditFacilityAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("facilities/{id}")]
        public async Task<IActionResult> DeleteFacility(long id)
        {
            var result = await _facilityRepository.DeleteFacilityAsync(id);
            return StatusCode(result.StatusCode, result);
        }
    }
}
