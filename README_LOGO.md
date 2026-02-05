# Logo Setup Instructions

## Adding Your Logo Image

To use your actual SKYLINE INSTITUTE OF TECHNOLOGY logo image in both the web form and PDF:

### For Web Form (Easy)

1. **Place your logo file** in the `public` folder:
   - File name: `logo.png` (or `logo.jpg`, `logo.svg`)
   - Recommended size: 200x240 pixels (or maintain aspect ratio)
   - Supported formats: PNG, JPG, SVG

2. **File location**: 
   ```
   public/logo.png
   ```

3. The web form will automatically use the image, with SVG fallback if not found.

### For PDF Generation (Recommended: Base64)

**Option 1: Use Base64 Encoded Image (RECOMMENDED - Most Reliable)**

This is the most reliable method for PDF generation:

1. **Convert your logo to base64:**
   - Online tool: https://www.base64-image.de/ or https://base64.guru/converter/encode/image
   - Or use command line: 
     ```bash
     # Windows PowerShell:
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("logo.png"))
     
     # Mac/Linux:
     base64 -i logo.png
     ```

2. **Update the code:**
   - Open `src/components/pdf/PdfLogo.tsx`
   - Find the line: `const LOGO_BASE64 = '';`
   - Replace with: `const LOGO_BASE64 = 'YOUR_BASE64_STRING_HERE';`
   - Save the file

**Option 2: Use Absolute URL**

If your logo is hosted online:

1. Update `src/components/pdf/PdfLogo.tsx`:
   ```tsx
   const LOGO_URL = 'https://yourdomain.com/logo.png';
   ```
   Then modify the component to use `LOGO_URL` instead of SVG.

**Option 3: Keep SVG Version (Current)**

The current setup uses an SVG version of the logo which always works. If you're happy with the SVG version, no changes needed!

## Quick Setup Steps

1. **For Web**: Just place `logo.png` in the `public` folder
2. **For PDF**: Convert logo to base64 and paste into `PdfLogo.tsx`

## Current Behavior

- **Web Form**: Uses `/logo.png` if exists, otherwise SVG fallback
- **PDF Export**: Uses base64 if provided, otherwise SVG version (always works)

