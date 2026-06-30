using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EVENT.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommonController : ControllerBase
    {
        private readonly IDropdownRepository _dropdownRepository;

        public CommonController(IDropdownRepository dropdownRepository)
        {
            _dropdownRepository = dropdownRepository;
        }

        [HttpGet("user/ddl")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserDDL()
        {
            var result = await _dropdownRepository.GetUserDDLAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("event/ddl")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEventDDL()
        {
            var result = await _dropdownRepository.GetEventDDLAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("event/dropdowns")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEventDropdowns([FromQuery] long eventId = 0)
        {
            var result = await _dropdownRepository.GetEventDropdownsAsync(eventId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("asset/ddl")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAssetDDL()
        {
            var result = await _dropdownRepository.GetAssetDDLAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("booking/ddl")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookingDDL()
        {
            var result = await _dropdownRepository.GetBookingDDLAsync();
            return StatusCode(result.StatusCode, result);
        }
    }
}
