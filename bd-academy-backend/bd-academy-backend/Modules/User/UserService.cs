using bd_academy_backend.Modules.User;
using bd_academy_backend.Modules.User.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.DotNet.Scaffolding.Shared.ProjectModel;
using Microsoft.EntityFrameworkCore;

namespace bd_academy_backend.Modules.User
{
    public class UserService
    {
        private readonly AppDBContext _dbContext;
        private readonly UserManager<Models.User> _userManager;
        private readonly UserStore<Models.User> _userStore;

        public UserService(AppDBContext dbContext, UserManager<Models.User> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _userStore = new UserStore<Models.User>(_dbContext);
        }

        public async Task<Models.User> UpdateUser(Models.User user, UserDTO userDTO)
        {
            user.FirstName = userDTO.FirstName;
            user.LastName = userDTO.LastName;
            await _dbContext.SaveChangesAsync();
            return user;
        }

        public async Task<Models.User> GetById(Guid id)
        {
            return await _userManager.FindByIdAsync(id.ToString());
        }

        public async Task<bool> ChangePassword(Models.User user, string password)
        {
            string hashedPassword = _userManager.PasswordHasher.HashPassword(user, password);
            await _userStore.SetPasswordHashAsync(user, hashedPassword);
            user.ResetPasswordExpDate = null;

            return await _dbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteUser(Models.User user)
        {
            user.Deleted = true;
            await _dbContext.SaveChangesAsync();
            return true;
        }


        public async Task<Models.User> GetByResetPasswordGuid(Guid guid)
        {
            return await _dbContext.Users.SingleOrDefaultAsync(x => x.ResetPasswordGuid == guid);
        }

        public async Task<bool> ResetPassword(Models.User user, ResetPasswordDTO resetPasswordDTO)
        {

            if (user.ResetPasswordExpDate < DateTime.UtcNow || user.ResetPasswordExpDate == null)
                return false;

            string hashedPassword = _userManager.PasswordHasher.HashPassword(user, resetPasswordDTO.Password);
            await _userStore.SetPasswordHashAsync(user, hashedPassword);
            user.ResetPasswordExpDate = null;

            return await _dbContext.SaveChangesAsync() > 0;
        }


    }
}

