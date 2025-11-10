

using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace bd_academy_backend.Modules.TrainingNamespace.Models
{

    [PrimaryKey(nameof(Id))]
    public class Training_TrainingCreator
    {
        public Guid Id { get; set; }
        public Guid TrainingId { get; set; }
        [ForeignKey("TrainingId")]
        public Training Training { get; set; } = null!;
        public Guid TrainingCreatorId { get; set; }
        [ForeignKey("TrainingCreatorId")]
        public TrainingCreator TrainingCreator { get; set; } = null!;

    }
}
