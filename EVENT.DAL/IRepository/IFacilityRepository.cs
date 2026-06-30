using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
  public interface IFacilityRepository
{
    Task<ApiResponseModel<List<FacilityResponse>>> GetFacilitiesAsync(
        string searchText = null,
        int pageNumber = 1,
        int pageSize = 20);

    Task<ApiResponseModel<FacilityResponse>> AddEditFacilityAsync(FacilityRequest request);

    Task<ApiResponseModel<string>> DeleteFacilityAsync(long facilityId);
}
}
