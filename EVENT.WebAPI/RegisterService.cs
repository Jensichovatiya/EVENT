using EVENT.DAL;
using INvoice.Models;

namespace EVENT.WebApi {
    public static class RegisterService {
        public static void RegisterServices(IServiceCollection services) { 

            services.AddScoped<IGeneralFunctions, GeneralFunctions>();
            Configure(services, RepositoryRegistor.GetTypes()); 
        }

        private static void Configure(IServiceCollection services, Dictionary<Type, Type> types) {
            foreach (var type in types)
                services.AddScoped(type.Key, type.Value);
        }
    }
}
