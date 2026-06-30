using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IOrganizerContactRepository
    {
        Task<ApiResponseModel<OrganizerContactResponse>> AddEditOrganizerContactAsync(OrganizerContactRequest request);
        Task<ApiResponseModel<List<OrganizerContactResponse>>> GetOrganizerContactsAsync();
        Task<ApiResponseModel<OrganizerContactResponse>> GetOrganizerContactByIdAsync(string id);
        Task<ApiResponseModel<string>> DeleteOrganizerContactAsync(string id);
    }
}


