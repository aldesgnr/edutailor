using bd_academy_backend.Modules.TrainingNamespace.Models;
using Microsoft.AspNetCore.Identity;

namespace bd_academy_backend.Modules.Shared.Services
{
    public class DataProvider
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<User.Models.User> _userManager;
        private readonly AppDBContext _dbContext;

        public DataProvider(RoleManager<IdentityRole> roleManager, UserManager<User.Models.User> userManager, AppDBContext dbContext)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _dbContext = dbContext;
        }

        public async Task CreateRoles()
        {
            _dbContext.Database.EnsureCreated();

            if (!await _roleManager.RoleExistsAsync(UserRole.ADMIN))
                await _roleManager.CreateAsync(new IdentityRole(UserRole.ADMIN));
            if (!await _roleManager.RoleExistsAsync(UserRole.USER))
                await _roleManager.CreateAsync(new IdentityRole(UserRole.USER));
            if (!await _roleManager.RoleExistsAsync(UserRole.CREATOR))
                await _roleManager.CreateAsync(new IdentityRole(UserRole.CREATOR));
        }

        public async Task CreateAdmin()
        {
            _dbContext.Database.EnsureCreated();

            if (await _userManager.FindByEmailAsync("admin@admin.pl") == null)
            {
                User.Models.User user = new()
                {
                    Email = "admin@admin.pl",
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = "Admin"
                };
                await _userManager.CreateAsync(user, "mju7&UJM");

                if (await _roleManager.RoleExistsAsync(UserRole.ADMIN))
                {
                    await _userManager.AddToRoleAsync(user, UserRole.ADMIN);
                }
            }
        }

        public async Task CreateTrainingCreator()
        {
            _dbContext.Database.EnsureCreated();
            var adminUser = await _userManager.FindByEmailAsync("admin@admin.pl");
            if (adminUser != null)
            {

                var trainingCreator = new TrainingCreator();
                trainingCreator.UserId = adminUser.Id;

                await _dbContext.TrainingCreator.AddAsync(trainingCreator);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}

