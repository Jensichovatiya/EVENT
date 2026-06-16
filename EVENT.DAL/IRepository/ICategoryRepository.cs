using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface ICategoryRepository
    {
        Task<ApiResponseModel<CategoryResponse>> AddEditCategoryAsync(CategoryRequest request);
        Task<ApiResponseModel<List<CategoryResponse>>> GetCategoriesAsync();
        Task<ApiResponseModel<CategoryResponse>> GetCategoryByIdAsync(string id);
        Task<ApiResponseModel<string>> UpdateCategoryStatusAsync(CategoryStatusUpdateRequest request);
        Task<ApiResponseModel<string>> DeleteCategoryAsync(string id);
    }
}
