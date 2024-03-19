using System.ComponentModel.DataAnnotations;

namespace bd_academy_backend.Modules.TrainingNamespace.DTO
{
    public class TrainingFileDTO
    {
        public Guid Id { get; set; } 
        public Guid Training { get; set; } 
        public string? Name { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public string? Image { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
