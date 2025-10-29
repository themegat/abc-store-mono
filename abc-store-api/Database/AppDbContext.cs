namespace ABCStoreAPI.Database;

using ABCStoreAPI.Database.Model;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Product { get; set; }
    public DbSet<ProductCategory> ProductCategory { get; set; }
    public DbSet<ProductImage> ProductImage { get; set; }
    public DbSet<SupportedCurrency> SupportedCurrency { get; set; }
    public DbSet<ExchangeRate> ExchangeRate { get; set; }
    public DbSet<UserDetails> UserDetails { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.ProductCategory)
            .WithMany()
            .HasForeignKey(p => p.ProductCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductImage>()
        .HasOne(pi => pi.Product)
        .WithMany(p => p.ProductImages)
        .HasForeignKey(pi => pi.ProductId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ExchangeRate>()
            .HasOne(er => er.SupportedCurrency)
            .WithMany()
            .HasForeignKey(er => er.SupportedCurrencyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
