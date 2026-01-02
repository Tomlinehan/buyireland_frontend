# Buy Ireland - Frontend

Modern, responsive frontend for BuyIreland.com - Own a piece of the Emerald Isle.

## Project Overview

This is a complete redesign of the BuyIreland.com website, featuring:
- Clean, modern UI with Irish-inspired color palette
- Fully responsive design (mobile-first)
- Vanilla JavaScript (no framework dependencies)
- Ready for Square integration for payments
- Optimized for performance and SEO

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - No dependencies
- **Square Web Payments SDK** - (To be integrated)

## Project Structure

```
Frontend/
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── main.js             # JavaScript functionality
├── images/                 # Product and brand images
├── index.html              # Home page
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Development Workflow

### Setup on New Computer

```bash
# Clone repository
git clone https://github.com/yourusername/buyireland-frontend.git
cd buyireland-frontend

# Open in browser
# Just open index.html in your browser, or use a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

### Daily Workflow

```bash
# Always pull latest changes first
git pull origin main

# Make your changes...

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main
```

## Pages (To Be Built)

- [x] Home page (index.html)
- [ ] Buy Now page
- [ ] What You Get page
- [ ] Our Story page
- [ ] FAQs page
- [ ] Contact page
- [ ] Testimonials page
- [ ] Terms & Privacy pages

## Features

### Completed
- Responsive navigation with mobile menu
- Hero section with CTA
- Features showcase
- Testimonials section
- Footer with links
- Smooth scroll animations
- Mobile-friendly design

### To Do
- Square payment integration
- Shopping cart functionality
- Backend API integration (Flask)
- Contact form
- Additional pages
- Image assets
- SEO meta tags optimization

## Backend Integration

The frontend is designed to work with the existing Flask/SQLite backend that polls the Square API.

API endpoints expected:
- `GET /api/products` - Get product details
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order status

## Deployment

### Option 1: Netlify (Recommended)
1. Push code to GitHub
2. Connect Netlify to your repo
3. Auto-deploys on every push to main

### Option 2: Manual Deployment
```bash
# SSH into server
ssh user@yourserver.com

# Pull latest changes
cd /var/www/buyireland-frontend
git pull origin main
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - Buy Ireland

## Contact

For questions or issues, contact: [your-email@example.com]
