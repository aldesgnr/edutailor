using bd_academy_backend.Modules.TrainingNamespace.DTO;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;


namespace bd_academy_backend.Modules.TrainingNamespace.Models
{

    [PrimaryKey(nameof(Id))]
    public class TrainingSection
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        //Relationships one to many
        public List<TrainingSectionComponent> TrainingSectionComponents { get; set; } = new List<TrainingSectionComponent>();

        //Relationships one to one
        public Guid TrainingId { get; set; }
        [ForeignKey("TrainingId")]
        [InverseProperty("TrainingSections")]
        public Training Training { get; set; } = null!;

        public TrainingSectionDTO toDTO()
        {
            TrainingSectionDTO trainingSectionDTO = new TrainingSectionDTO();
            trainingSectionDTO.Id = this.Id;
            trainingSectionDTO.Title = this.Title;
            trainingSectionDTO.CreatedAt = this.CreatedAt;
            trainingSectionDTO.DeletedAt = this.DeletedAt;
            trainingSectionDTO.UpdatedAt = this.UpdatedAt;
            trainingSectionDTO.TrainingSectionComponents = this.TrainingSectionComponents.Select(trainingSectionComponent => trainingSectionComponent.toDTO()).ToList();
            return trainingSectionDTO;
        }

        public TrainingSection fromDTO(TrainingSectionDTO trainingSectionDTO)
        {
            this.Id = trainingSectionDTO.Id;
            this.Title = trainingSectionDTO.Title;
            this.UpdatedAt = DateTime.Now;
            if (trainingSectionDTO.CreatedAt != null)
            {
                this.CreatedAt = trainingSectionDTO.CreatedAt;

            }
            else
            {

                this.CreatedAt = this.CreatedAt;
            }
            return this;

        }
    }

}
