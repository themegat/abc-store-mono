using ABCStoreAPI.Database;
using Microsoft.EntityFrameworkCore;

namespace ABCStoreAPI.Repository;

public interface IGenericRepository<T> where T : class
{
    T? GetById(int id);
    IQueryable<T> GetAll();
    void Add(T entity);
    void Remove(T entity);
}

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public GenericRepository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public T? GetById(int id)
    {
        return _dbSet.Find(id);
    }

    public IQueryable<T> GetAll()
    {
        return _dbSet.AsQueryable();
    }

    public void Add(T entity)
    {
        _dbSet.Add(entity);
    }

    public void Remove(T entity)
    {
        _dbSet.Remove(entity);
    }

}
