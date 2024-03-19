using Microsoft.AspNetCore.Identity;

namespace bd_academy_backend.Modules.User.Models
{
    public class User : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
        public Guid? ResetPasswordGuid { get; set; }
        public DateTime? ResetPasswordExpDate { get; set; }
        public bool Deleted { get; set; }

    }


}
