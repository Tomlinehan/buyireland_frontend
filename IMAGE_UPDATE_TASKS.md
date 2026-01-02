# Buy Ireland - Image Integration Task List

## Overview
Systematically add all downloaded images to their corresponding pages to match the original buyireland.com site.

---

## ✅ Completed
- [x] Downloaded all media outlet logos (9 logos)
- [x] Downloaded all design assets (backgrounds, icons, etc.)
- [x] Downloaded certificate package image
- [x] Downloaded founders photo
- [x] Applied header backgrounds to all subpages
- [x] Applied media logos to homepage

---

## 📋 Page-by-Page Image Integration Tasks

### 1. **index.html** (Homepage)
**Status**: ✅ Mostly Complete
- [x] Hero background (Silvermines, County Tipperary)
- [x] Logo in navigation
- [x] Media outlet logos section
- [ ] Consider adding product preview image

**Images Available**:
- `images/products/certificate-package.jpg` - Could add to features section
- `images/sheep.png` - Decorative element
- `images/book.png` - Could use as icon

---

### 2. **what-you-get.html**
**Status**: ⏳ Needs Images
- [x] Header background applied
- [ ] **Add certificate package photo** showing all contents
- [ ] **Add individual certificate images** (if available)
- [ ] **Add photo examples** included in package

**Action Items**:
```html
<!-- Add to content section -->
<div class="package-showcase">
    <img src="images/products/certificate-package.jpg" alt="Complete Certificate Package">
</div>

<!-- Or integrate into existing item-cards with actual product photos -->
```

**Images to Use**:
- `images/products/certificate-package.jpg` (2.3 MB) - Main package display
- `images/certificates/cert_bg.jpg` - Certificate background example
- `images/certificates/cert_bg2.jpg` - Alternative certificate style

---

### 3. **our-story.html**
**Status**: ⏳ Needs Images
- [x] Header background applied
- [ ] **Add founders photo** (John Beckett and Thomas Linehan)
- [ ] **Add company timeline images** (if available)

**Action Items**:
```html
<!-- Add to story section -->
<div class="founders-section">
    <img src="images/products/founders.jpg" alt="John Beckett and Thomas Linehan">
    <p>Founded in 2003 by John Beckett and Thomas Linehan</p>
</div>
```

**Images to Use**:
- `images/products/founders.jpg` - Founders photo

---

### 4. **buy-now.html**
**Status**: ⏳ Needs Images
- [x] Header background applied
- [ ] **Add product showcase images**
- [ ] **Add certificate preview**
- [ ] **Add package contents visualization**

**Action Items**:
- Add product gallery with certificate package
- Show what customers receive
- Include certificate examples

**Images to Use**:
- `images/products/certificate-package.jpg`
- `images/certificates/cert_bg.jpg`
- `images/sheep.png` (decorative)

---

### 5. **faqs.html**
**Status**: ✅ Complete (text-only page)
- [x] Header background applied
- No additional images needed (content-focused)

---

### 6. **contact.html**
**Status**: ⏳ Could Add Images
- [x] Header background applied
- [ ] Consider adding office photo or map (if available)
- [ ] Could use contact background from server

**Images Available**:
- `images/backgrounds/contact.jpg` (781 KB) - Could use as page header instead

---

### 7. **testimonials.html**
**Status**: ✅ Complete (text-only page)
- [x] Header background applied
- Consider adding customer photos (if available and with permission)

---

### 8. **terms.html** & **privacy.html**
**Status**: ✅ Complete (legal pages)
- [x] Header background applied
- No additional images needed

---

## 🎨 Design Assets Inventory

### Downloaded and Ready to Use:

**Backgrounds** (`images/backgrounds/`):
- `bi_bg.jpg` (884 KB) - Alternate general background
- `header-bg.jpg` (719 KB) - ✅ Currently used for subpage headers
- `home-header-bg.png` (1.5 MB) - Original homepage hero (available if needed)
- `contact.jpg` (781 KB) - Contact page specific background

**Product Images** (`images/products/`):
- `certificate-package.jpg` (2.3 MB) - Complete package photo
- `founders.jpg` - Founders photo for Our Story page

**Certificates** (`images/certificates/`):
- `cert_bg.jpg` (121 KB) - Certificate template 1
- `cert_bg2.jpg` (283 KB) - Certificate template 2

**Decorative** (`images/`):
- `sheep.png` (8 KB) - Irish sheep graphic
- `book.png` (4.3 KB) - Book icon
- `logo.png` (67 KB) - ✅ In use

**Icons** (`images/icons/`):
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`

**Media Logos** (`images/media-logos/`):
- All 9 logos ✅ In use on homepage

---

## 🔧 Implementation Priority

### High Priority (Do Now):
1. **what-you-get.html** - Add certificate package image
2. **our-story.html** - Add founders photo
3. **buy-now.html** - Add product showcase images

### Medium Priority (Nice to Have):
4. Update contact.html with contact-specific background
5. Add decorative sheep/book icons where appropriate
6. Consider using alternate backgrounds for variety

### Low Priority (Optional):
7. Add customer photos to testimonials (if available with permission)
8. Create image gallery for package contents
9. Add seasonal variations of Ireland photos

---

## 📝 Code Snippets for Quick Implementation

### Add Image to Content Section:
```html
<div class="content-image">
    <img src="images/products/certificate-package.jpg" alt="Description">
</div>
```

### Add Image with Caption:
```html
<figure class="product-showcase">
    <img src="images/products/certificate-package.jpg" alt="Complete Package">
    <figcaption>Everything included in your Irish land package</figcaption>
</figure>
```

### Side-by-Side Layout:
```html
<div class="image-text-row">
    <div class="image-col">
        <img src="images/products/founders.jpg" alt="Founders">
    </div>
    <div class="text-col">
        <h3>Our Story</h3>
        <p>Founded in 2003...</p>
    </div>
</div>
```

---

## 🎯 Next Steps

1. Review this task list
2. Start with high-priority pages (what-you-get, our-story, buy-now)
3. Add images systematically one page at a time
4. Test each page after adding images
5. Ensure responsive design works with new images
6. Optimize image sizes if needed (compress large files)

---

## 📊 Progress Tracker

- **Total Pages**: 9
- **Pages Complete**: 3 (index, faqs, testimonials, terms, privacy)
- **Pages Needing Images**: 3 (what-you-get, our-story, buy-now)
- **Optional Updates**: 1 (contact)

**Overall Completion**: ~70%

---

*Last Updated: 2026-01-02*
