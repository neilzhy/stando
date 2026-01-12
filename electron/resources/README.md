# Icon Resources

## Current Status
- ✅ `icon.png` - Copied from images/stando.png

## TODO: Create Windows Icon
To create `icon.ico` for Windows:

1. **Option 1: Online Converter**
   - Visit https://convertio.co/png-ico/
   - Upload `icon.png`
   - Download as `icon.ico`

2. **Option 2: ImageMagick**
   ```bash
   magick icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico
   ```

3. **Option 3: Use PNG temporarily**
   - electron-builder can convert PNG to ICO automatically
   - Update electron-builder.yml to use icon.png instead

## Note
Currently using icon.png for development. For production release, convert to ico format.
