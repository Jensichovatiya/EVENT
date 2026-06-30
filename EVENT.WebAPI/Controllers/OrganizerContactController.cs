using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EVENT.API.Controllers
{
    [Route("api")]
    [ApiController]
    [AllowAnonymous]
    public class OrganizerContactController : ControllerBase
    {
        private readonly IOrganizerContactRepository _organizerContactRepository;

        public OrganizerContactController(
            IOrganizerContactRepository organizerContactRepository)
        {
            _organizerContactRepository = organizerContactRepository;
        }


        [HttpPost("organizer-contacts")]
        public async Task<IActionResult> AddEditOrganizerContact(
            [FromBody] OrganizerContactRequest request)
        {
            if (request == null)
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Invalid request."
                });
            }

            var result = await _organizerContactRepository
                .AddEditOrganizerContactAsync(request);

            return StatusCode(result.StatusCode, result);
        }

  
        [HttpGet("organizer-contacts")]
        public async Task<IActionResult> GetOrganizerContacts()
        {
            var result = await _organizerContactRepository
                .GetOrganizerContactsAsync();

            return StatusCode(result.StatusCode, result);
        }

  
        [HttpGet("organizer-contacts/{id}")]
        public async Task<IActionResult> GetOrganizerContactById(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Id is required."
                });
            }

            var result = await _organizerContactRepository
                .GetOrganizerContactByIdAsync(id);

            return StatusCode(result.StatusCode, result);
        }

    
        [HttpDelete("organizer-contacts/{id}")]
        public async Task<IActionResult> DeleteOrganizerContact(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new ApiResponseModel<object>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Id is required."
                });
            }

            var result = await _organizerContactRepository
                .DeleteOrganizerContactAsync(id);

            return StatusCode(result.StatusCode, result);
        }
    }
}