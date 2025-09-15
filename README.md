# Curve Control Optimization Frontend Demo

A standalone web demo showcasing the Curve Control energy optimization engine. Try our optimization algorithms without installing anything - just enter your home details to see potential energy savings!

🌐 **[Try the Live Demo](https://your-demo-site.com)**

## Features

- **Interactive Optimization Demo** - See real optimization results instantly
- **No Installation Required** - Works in any modern web browser
- **Real Backend Integration** - Uses the actual Curve Control optimization engine
- **Beautiful Visualizations** - Interactive charts showing temperature schedules
- **Mobile Responsive** - Works on desktop, tablet, and mobile devices
- **Educational** - Learn how time-of-use optimization saves money

## What This Demo Shows

### 🏠 Basic Optimization
- Enter your home size, preferred temperature, and schedule
- Choose your utility rate plan and optimization level
- See projected annual savings and optimized temperature schedule

### 🎛️ Advanced Customization
- Set custom temperature preferences for each hour
- Fine-tune your comfort requirements
- See how detailed preferences affect optimization

### 📊 Results Visualization
- **Savings Summary**: Annual cost savings, percentage reduction, CO₂ avoided
- **Temperature Chart**: 24-hour optimized schedule with price overlay
- **Interactive Charts**: Zoom, hover for details, responsive design

## Technologies Used

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Charts**: ApexCharts.js for interactive visualizations
- **Backend**: Same Heroku optimization engine as the Home Assistant integration
- **Responsive**: CSS Grid and Flexbox for all device sizes

## Local Development

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for backend API calls)

### Quick Start
1. Clone this repository
2. Open `index.html` in your web browser
3. Start optimizing!

```bash
git clone https://github.com/boringbots/curve-control-optimization-frontend-demo.git
cd curve-control-optimization-frontend-demo
# Open index.html in your browser
```

### Development Server (Optional)
For local development with live reload:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## File Structure

```
frontend-demo/
├── index.html          # Main demo page
├── demo.css           # Responsive styling
├── demo.js            # Demo logic and API integration
├── README.md          # This file
└── assets/            # Images and resources (future)
```

## API Integration

The demo connects to the same optimization backend used by the Home Assistant integration:

- **Endpoint**: `https://optimal-temp-ha-backend-a69b8b7983db.herokuapp.com/generate_schedule`
- **Method**: POST
- **Format**: JSON
- **CORS**: Enabled for web demo access

### Request Format
```json
{
  "homeSize": 2000,
  "homeTemperature": 72,
  "location": 1,
  "timeAway": "08:00",
  "timeHome": "17:00",
  "savingsLevel": 2,
  "heatUpRate": 0.5535,
  "coolDownRate": 1.9335,
  "temperatureSchedule": {
    "highTemperatures": [75, 75, ...],
    "lowTemperatures": [69, 69, ...],
    "intervalMinutes": 30,
    "totalIntervals": 48
  }
}
```

### Response Format
```json
{
  "HourlyTemperature": [
    [1, 2, 3, ...],           // Interval numbers
    [75, 75, 78, ...],        // High bounds
    [69, 69, 72, ...]         // Low bounds
  ],
  "bestTempActual": [72.0, 72.5, ...],  // Optimized temperatures
  "costSavings": 199,
  "percentSavings": 13,
  "co2Avoided": 0.24
}
```

## Customization

### Styling
Edit `demo.css` to customize:
- Color scheme and branding
- Layout and spacing
- Responsive breakpoints
- Animation effects

### Functionality
Edit `demo.js` to customize:
- Form validation rules
- Chart appearance and data
- API endpoints
- User interactions

### Content
Edit `index.html` to customize:
- Copy and messaging
- Form fields and options
- Call-to-action buttons
- Educational content

## Deployment

### Static Hosting
This demo can be deployed to any static hosting service:

- **GitHub Pages**: Enable in repository settings
- **Netlify**: Connect to GitHub repository
- **Vercel**: Deploy with `vercel` command
- **AWS S3**: Upload files to S3 bucket with static hosting
- **Google Cloud Storage**: Enable static website hosting

### CDN Integration
For production deployment:
1. Optimize images and assets
2. Minify CSS and JavaScript
3. Enable gzip compression
4. Configure CDN caching headers

### Environment Configuration
For different environments, update the backend URL in `demo.js`:

```javascript
// Development
this.backendUrl = 'http://localhost:3000';

// Production
this.backendUrl = 'https://optimal-temp-ha-backend-a69b8b7983db.herokuapp.com';
```

## Browser Support

- ✅ **Chrome** 60+
- ✅ **Firefox** 55+
- ✅ **Safari** 12+
- ✅ **Edge** 79+
- ⚠️ **Internet Explorer** Not supported

## Performance

- **First Load**: ~500KB (including ApexCharts)
- **Subsequent Visits**: ~50KB (cached assets)
- **API Response Time**: ~2-5 seconds
- **Mobile Performance**: 90+ Lighthouse score

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use semantic HTML5 elements
- Follow CSS BEM methodology
- Write ES6+ JavaScript
- Ensure mobile responsiveness
- Test across browsers

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- **[Home Assistant Integration](https://github.com/boringbots/curve-control-ha-integration)** - Full HVAC control integration
- **[Custom Dashboard Card](https://github.com/boringbots/curve-control-card)** - Home Assistant frontend card
- **[Data Collection](https://github.com/boringbots/curve-control-ha-data-collection)** - Anonymous usage analytics

## Support

- **Demo Issues**: [GitHub Issues](https://github.com/boringbots/curve-control-optimization-frontend-demo/issues)
- **General Questions**: [Documentation](https://docs.curvecontrol.com)
- **Integration Support**: [Home Assistant Community](https://community.home-assistant.io)

---

**Ready to start saving?** Try the demo and see how much you could save with intelligent HVAC optimization!