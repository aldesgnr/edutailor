using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace bd_academy_backend.Modules.TrainingNamespace.Models
{


    [PrimaryKey(nameof(Id))]
    public class TrainingValue
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public string Value { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        //Relationships one to one
        public Guid TrainingId { get; set; }
        [ForeignKey("TrainingId")]
        [InverseProperty("TrainingValue")]
        public Training Training { get; set; } = null!;


    }
}
