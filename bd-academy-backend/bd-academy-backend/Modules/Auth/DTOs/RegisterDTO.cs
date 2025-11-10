using System.ComponentModel.DataAnnotations;

namespace bd_academy_backend.Controllers.Auth.dto
{
    public class RegisterDTO
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Token { get; set; }


        [EmailAddress]
        [Required(ErrorMessage = "Email is required")]
        public string? Email { get; set; }
    }
}
