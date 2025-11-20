using ABCStoreAPI.Service.Dto.Base;

namespace ABCStoreAPI.Service.Dto;

public class ProductCategoryDto : IDto<ProductCategoryDto, Database.Model.ProductCategory>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public static ProductCategoryDto toDto(Database.Model.ProductCategory category)
    {
        return new ProductCategoryDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }
}
