using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EVENT.WebAPI.Controllers
{
    [ApiController]
    [Route("api/settings")]
    [AllowAnonymous]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingsRepository _settingsRepository;

        public SettingsController(ISettingsRepository settingsRepository)
        {
            _settingsRepository = settingsRepository;
        }

        [HttpGet("currencies")]
        public async Task<IActionResult> GetCurrencies()
        {
            var result = await _settingsRepository.GetCurrenciesAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("currencies")]
        public async Task<IActionResult> AddEditCurrency([FromBody] CurrencyRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _settingsRepository.AddEditCurrencyAsync(request);
            return StatusCode(result.StatusCode, result);
        }
    }
}
