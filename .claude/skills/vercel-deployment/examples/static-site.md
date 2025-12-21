# Example: Static Site Deployment

## Project Structure

### Basic HTML Site

```
static-site/
├── index.html
├── about.html
├── contact.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── images/
│   └── logo.png
└── 404.html
```

### With Build Step (Hugo, Jekyll, etc.)

```
static-site/
├── content/
├── layouts/
├── static/
├── config.toml
├── vercel.json
└── public/          # Generated output
```

## Basic HTML Site

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Static Site</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <header>
        <nav>
            <a href="/">Home</a>
            <a href="/about.html">About</a>
            <a href="/contact.html">Contact</a>
        </nav>
    </header>
    <main>
        <h1>Welcome to My Site</h1>
        <p>This is a static site deployed on Vercel.</p>
    </main>
    <script src="/js/app.js"></script>
</body>
</html>
```

### 404.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <main>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Go Home</a>
    </main>
</body>
</html>
```

### css/styles.css

```css
:root {
    --primary-color: #007bff;
    --text-color: #333;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--text-color);
    line-height: 1.6;
}

header {
    background: var(--primary-color);
    padding: 1rem;
}

nav a {
    color: white;
    text-decoration: none;
    margin-right: 1rem;
}

main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}
```

## Deployment

### Zero Config (Recommended)

```bash
# Just deploy - no config needed!
vercel --prod
```

### With vercel.json (Optional)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## With Build Step

### Hugo

```json
// vercel.json
{
  "buildCommand": "hugo",
  "outputDirectory": "public"
}
```

### Jekyll

```json
// vercel.json
{
  "buildCommand": "bundle exec jekyll build",
  "outputDirectory": "_site"
}
```

### Eleventy

```json
// vercel.json
{
  "buildCommand": "npx @11ty/eleventy",
  "outputDirectory": "_site"
}
```

## SPA Fallback

For single-page applications with client-side routing:

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Edge Cases

### Edge Case 1: Clean URLs

**Problem**: `/about.html` works but `/about` doesn't

**Solution**:

```json
{
  "cleanUrls": true
}
```

Now both `/about` and `/about.html` work.

### Edge Case 2: Trailing Slash Issues

**Problem**: `/about/` and `/about` behave differently

**Solution**:

```json
{
  "trailingSlash": false
}
```

### Edge Case 3: Assets Not Caching

**Problem**: Browser re-downloads CSS/JS on every visit

**Solution**: Add cache headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

### Edge Case 4: Custom 404 Not Working

**Problem**: Default 404 shows instead of custom

**Solution**: Ensure `404.html` is in root directory

### Edge Case 5: Redirect www to non-www

**Solution**:

```json
{
  "redirects": [
    {
      "source": "/:path(.*)",
      "has": [{ "type": "host", "value": "www.example.com" }],
      "destination": "https://example.com/:path",
      "permanent": true
    }
  ]
}
```

### Edge Case 6: Mixed Content Warning

**Problem**: HTTPS site loading HTTP resources

**Solution**: Use protocol-relative or HTTPS URLs:

```html
<!-- Wrong -->
<img src="http://example.com/image.png">

<!-- Right -->
<img src="https://example.com/image.png">
<!-- or -->
<img src="//example.com/image.png">
```

## Security Headers

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'"
        }
      ]
    }
  ]
}
```

## Deployment Checklist

- [ ] Custom 404.html created
- [ ] All internal links work
- [ ] Assets use relative or absolute HTTPS paths
- [ ] Meta tags for SEO added
- [ ] Favicon added
- [ ] Cache headers configured
- [ ] Security headers added
- [ ] Custom domain configured
