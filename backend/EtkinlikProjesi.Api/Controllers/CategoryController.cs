using EtkinlikProjesi.Api.Data;
using EtkinlikProjesi.Api.Dtos.Category;
using EtkinlikProjesi.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EtkinlikProjesi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoryController(AppDbContext context)
    {
        _context = context;
    }

    // Herkese açık — aktif kategorileri listele
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.EventCategories
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new CategoryResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(categories);
    }

    // Sadece Admin — kategori ekle
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateCategory(CreateCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Kategori adı boş olamaz.");

        var exists = await _context.EventCategories
            .AnyAsync(x => x.Name.ToLower() == request.Name.ToLower());

        if (exists)
            return BadRequest("Bu isimde bir kategori zaten mevcut.");

        var category = new EventCategory
        {
            Name = request.Name,
            Description = request.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.EventCategories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt
        });
    }

    // Sadece Admin — kategori sil (soft delete)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.EventCategories
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category == null)
            return NotFound("Kategori bulunamadı.");

        // Hard delete yerine soft delete — IsActive = false
        category.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok("Kategori pasif hale getirildi.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/activate")]
    public async Task<IActionResult> ActivateCategory(int id)
    {
        var category = await _context.EventCategories
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category == null)
        {
            return NotFound("Kategori bulunamadı.");
        }

        if (category.IsActive)
        {
            return BadRequest("Kategori zaten aktif.");
        }

        category.IsActive = true;

        await _context.SaveChangesAsync();

        return Ok("Kategori aktif hale getirildi.");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/deactivate")]
    public async Task<IActionResult> DeactivateCategory(int id)
    {
        var category = await _context.EventCategories
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category == null)
        {
            return NotFound("Kategori bulunamadı.");
        }

        if (!category.IsActive)
        {
            return BadRequest("Kategori zaten pasif.");
        }

        category.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok("Kategori pasif hale getirildi.");
    }
}