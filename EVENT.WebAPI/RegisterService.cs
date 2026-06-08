using EVENT.DAL;

namespace EVENT.WebApi {
    public static class RegisterService {
        public static void RegisterServices(IServiceCollection services) { 

            Configure(services, RepositoryRegistor.GetTypes()); 
        }

        private static void Configure(IServiceCollection services, Dictionary<Type, Type> types) {
            foreach (var type in types)
                services.AddScoped(type.Key, type.Value);
        }

        //public static void ConfigureLoggerService(this IServiceCollection services) {
        //    services.AddSingleton<ILoggerManager, LoggerManager>();
        //}
    }
}
