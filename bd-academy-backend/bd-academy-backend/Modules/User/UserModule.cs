
using bd_academy_backend.Modules.User;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class UserServiceCollectionExtensions
    {
        public static IServiceCollection AddUserModuleDependencies(
             this IServiceCollection services)
        {
            services.AddScoped<UserService>();

            return services;
        }
    }
}