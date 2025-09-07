import { test, expect } from '@playwright/test';

test.describe('Blog Visual Regression Tests', () => {
  
  test('homepage should match visual snapshot', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForSelector('h1');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('homepage on mobile should match visual snapshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForSelector('h1');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });

  test('blog post page should match visual snapshot', async ({ page }) => {
    // Navigate to the most recent blog post
    await page.goto('/posts/2024-01-11-knihy-2023/');
    
    // Wait for content to load
    await page.waitForSelector('article');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the full page
    await expect(page).toHaveScreenshot('blog-post.png', { 
      fullPage: true 
    });
  });

  test('blog post on mobile should match visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/posts/2024-01-11-knihy-2023/');
    await page.waitForSelector('article');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('blog-post-mobile.png', { 
      fullPage: true 
    });
  });

  test('blog post with images should match visual snapshot', async ({ page }) => {
    // Test Svatý Xaverius post which has images but is more stable
    await page.goto('/posts/2019-05-28-svaty-xaverius/');
    
    await page.waitForSelector('article');
    await page.waitForLoadState('networkidle');
    
    // Wait for images to load
    await page.waitForFunction(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).every(img => img.complete);
    }, { timeout: 8000 });
    
    // Wait for layout stability
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('blog-post-with-images.png', {
      fullPage: true,
      threshold: 0.2,
      animations: 'disabled'
    });
  });

  test('typography rendering should be consistent', async ({ page }) => {
    await page.goto('/posts/2022-05-31-muj-stack/');
    
    await page.waitForSelector('article');
    await page.waitForLoadState('networkidle');
    
    // Wait for fonts and layout to stabilize
    await page.waitForTimeout(1000);
    
    // Focus on the article content only to test typography
    const article = page.locator('article');
    await expect(article).toHaveScreenshot('typography-test.png', {
      animations: 'disabled'
    });
  });

  test('header and navigation should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header');
    
    // Screenshot just the header
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header.png');
  });

  test('code blocks should render properly', async ({ page }) => {
    // Find a post with code blocks
    await page.goto('/posts/2022-05-31-muj-stack/');
    
    await page.waitForSelector('pre');
    await page.waitForLoadState('networkidle');
    
    // Screenshot the first code block
    const codeBlock = page.locator('pre').first();
    await expect(codeBlock).toHaveScreenshot('code-block.png');
  });

  test('responsive design breakpoints', async ({ page }) => {
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForSelector('h1');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-tablet.png');
  });

  test('post list items should be consistent', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.post-item');
    
    // Screenshot the first post item
    const postItem = page.locator('.post-item').first();
    await expect(postItem).toHaveScreenshot('post-list-item.png');
  });

});