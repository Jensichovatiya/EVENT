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
    public class ReportController : ControllerBase
    {
        private readonly IReportRepository _reportRepository;

        public ReportController(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        [HttpGet("report/revenue")]
        public async Task<IActionResult> GetRevenueReport()
        {
            var result = await _reportRepository.GetRevenueReportAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("report/bookings")]
        public async Task<IActionResult> GetBookingReport()
        {
            var result = await _reportRepository.GetBookingReportAsync();
            return StatusCode(result.StatusCode, result);
        }
    }
}
