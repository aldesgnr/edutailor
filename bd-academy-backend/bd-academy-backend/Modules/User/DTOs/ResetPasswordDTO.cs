using System;
namespace bd_academy_backend.Modules.User.DTOs
{
    public class ResetPasswordDTO
    {
        public Guid ResetPasswordGuid { get; set; }
        public string Password { get; set; }
    }
}

