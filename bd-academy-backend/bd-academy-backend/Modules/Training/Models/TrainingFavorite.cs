using bd_academy_backend.Modules.TrainingNamespace.DTO;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace bd_academy_backend.Modules.TrainingNamespace.Models
{

    [PrimaryKey(nameof(Id))]
    public class TrainingFavorite
    {

        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        //Relationships one to one
        [Required]
        public Guid? TrainingId { get; set; }
        [ForeignKey("TrainingId")]
        public Training? Training { get; set; }
        [Required]
        public Guid? TrainingCreatorId { get; set; }
        [ForeignKey("TrainingCreatorId")]
        public TrainingCreator? TrainingCreator { get; set; }




        //create function converts db model to DTO model
        public TrainingFavoriteDTO toDTO()
        {
            TrainingFavoriteDTO trainingFavoriteDTO = new TrainingFavoriteDTO();
            trainingFavoriteDTO.Id = this.Id;
            trainingFavoriteDTO.TrainingId = this.TrainingId;
            trainingFavoriteDTO.TrainingCreatorId = this.TrainingCreatorId;
            return trainingFavoriteDTO;
        }
        //create function converts db model to DTO model
        public TrainingFavorite fromDTO(TrainingFavoriteDTO trainingFavoriteDTO)
        {
            this.Id = trainingFavoriteDTO.Id;
            this.TrainingId = trainingFavoriteDTO.TrainingId;
            this.TrainingCreatorId = trainingFavoriteDTO.TrainingCreatorId;
            this.UpdatedAt = DateTime.Now;
            return this;
        }

    }

}
