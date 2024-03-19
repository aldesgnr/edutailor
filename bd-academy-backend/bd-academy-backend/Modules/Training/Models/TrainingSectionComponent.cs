using bd_academy_backend.Modules.TrainingNamespace.DTO;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace bd_academy_backend.Modules.TrainingNamespace.Models
{

    public static class TrainingSectionComponentEnum
    {
        public const string
            QUIZ = "QUIZ",
            FILE = "FILE",
            SCENE = "SCENE";
    }

    [PrimaryKey(nameof(Id))]
    public class TrainingSectionComponent
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = null!;
        public Guid? DialogId { get; set; } = null;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        //Relationships one to one
        public Guid TrainingSectionId { get; set; }
        [ForeignKey("TrainingSectionId")]
        public TrainingSection TrainingSection { get; set; } = null!;


        public TrainingSectionComponentDTO toDTO()
        {
            TrainingSectionComponentDTO trainingSectionComponentDTO = new TrainingSectionComponentDTO();
            trainingSectionComponentDTO.Id = this.Id;
            trainingSectionComponentDTO.Title = this.Title;
            trainingSectionComponentDTO.Description = this.Description;
            trainingSectionComponentDTO.Type = this.Type;
            if (this.DialogId != null) trainingSectionComponentDTO.DialogId = this.DialogId;
            trainingSectionComponentDTO.Type = this.Type;
            trainingSectionComponentDTO.CreatedAt = this.CreatedAt;
            trainingSectionComponentDTO.DeletedAt = this.DeletedAt;
            trainingSectionComponentDTO.UpdatedAt = this.UpdatedAt;
            return trainingSectionComponentDTO;
        }

        public TrainingSectionComponent fromDTO(TrainingSectionComponentDTO trainingSectionComponentDTO)
        {
            this.Id = trainingSectionComponentDTO.Id;
            this.Title = trainingSectionComponentDTO.Title;
            this.Description = trainingSectionComponentDTO.Description;
            this.Type = trainingSectionComponentDTO.Type;
            if (trainingSectionComponentDTO.DialogId != null) this.DialogId = trainingSectionComponentDTO.DialogId;
            this.CreatedAt = trainingSectionComponentDTO.CreatedAt;
            this.DeletedAt = trainingSectionComponentDTO.DeletedAt;
            this.UpdatedAt = trainingSectionComponentDTO.UpdatedAt;

            return this;

        }
    }
}
