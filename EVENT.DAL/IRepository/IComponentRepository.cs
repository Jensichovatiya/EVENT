    using EVENT.Business.BusinessClass;
using EVENT.Web.Models;

namespace EVENT.DAL.IRepository
{
    public interface IComponentRepository
    {
        Task<ApiResponseModel<ComponentResponse>> AddEditComponentAsync(ComponentRequest request);

        Task<ApiResponseModel<List<ComponentResponse>>> GetComponentsAsync(
            string? searchText = null,
            int pageNumber = 1,
            int pageSize = 20);

        Task<ApiResponseModel<ComponentResponse>> GetComponentByIdAsync(long componentId);

        Task<ApiResponseModel<string>> DeleteComponentAsync(
            long componentId,
            string updatedBy,
            string updatedFrom);
    }
}