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
    public DbSet<Cart> Cart { get; set; }
    public DbSet<CartProduct> CartProduct { get; set; }
    public DbSet<Order> Order { get; set; }
    public DbSet<Address> Address { get; set; }

    private static void MapSchemaTables(ModelBuilder modelBuilder)
    {
        var schema = "public";

        modelBuilder.Entity<Address>()
        .ToTable("Address", schema: schema);

        modelBuilder.Entity<Cart>()
        .ToTable("Cart", schema: schema);

        modelBuilder.Entity<CartProduct>()
        .ToTable("CartProduct", schema: schema);

        modelBuilder.Entity<ExchangeRate>()
       .ToTable("ExchangeRate", schema: schema);

        modelBuilder.Entity<Order>()
       .ToTable("Order", schema: schema);

        modelBuilder.Entity<Product>()
       .ToTable("Product", schema: schema);

        modelBuilder.Entity<ProductCategory>()
       .ToTable("ProductCategory", schema: schema);

        modelBuilder.Entity<ProductImage>()
       .ToTable("ProductImage", schema: schema);

        modelBuilder.Entity<SupportedCurrency>()
       .ToTable("SupportedCurrency", schema: schema);

        modelBuilder.Entity<UserDetails>()
       .ToTable("UserDetails", schema: schema);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        MapSchemaTables(modelBuilder);

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

        modelBuilder.Entity<CartProduct>()
            .HasOne(cp => cp.Product)
            .WithMany()
            .HasForeignKey(cp => cp.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CartProduct>()
            .HasOne(cp => cp.Cart)
            .WithMany(c => c.CartProducts)
            .HasForeignKey(cp => cp.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Cart>()
            .Property(c => c.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Order>()
            .Property(o => o.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Address>()
        .Property(a => a.AddressType)
        .HasConversion<string>();

        modelBuilder.Entity<Order>()
            .HasOne(o => o.ShippingAddress)
            .WithMany()
            .HasForeignKey(o => o.AddressId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
        .HasOne(o => o.UserDetails)
        .WithMany()
        .HasForeignKey(o => o.UserId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
        .HasOne(o => o.Cart)
        .WithMany()
        .HasForeignKey(o => o.CartId)
        .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserDetails>()
            .HasOne(o => o.BillingAddress)
            .WithMany()
            .HasForeignKey(o => o.AddressId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
