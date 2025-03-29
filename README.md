# Math Visualizations

A lightweight, modular framework for creating interactive mathematical visualizations using vanilla JavaScript. This project uses plain HTML, CSS, and JavaScript with Konva.js and GSAP for animations.

## Features

- Modular, extensible architecture
- Vanilla JavaScript (no framework dependencies)
- Express server for easy deployment
- Beautiful, interactive visualizations
- Consistent user interface across problems
- Responsive design for desktop and mobile
- Shared utility functions for geometry and animations

## Getting Started

### Prerequisites

- Node.js and npm

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/math-visualizations.git
   cd math-visualizations
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
/math-visualizations/
  /public/                 # All client-side files
    /css/
      styles.css           # Common styles
    /js/
      /libs/               # Third-party libraries
      /utils/              # Shared utility functions
        geometry.js        # Geometry calculations
        animation.js       # Animation helpers
      /problems/           # Each math problem gets its own folder
        /min-perimeter/    # Minimum perimeter triangle problem
          config.js        # Problem-specific configuration
          index.js         # Problem implementation
    /problems/             # HTML pages for each problem
      min-perimeter.html
    index.html             # Main landing page
  /server.js               # Express server
  package.json
  README.md
```

## Adding a New Problem

To add a new problem visualization, follow these steps:

1. **Create HTML Page**:
   - Copy the template from an existing problem (e.g., `public/problems/min-perimeter.html`)
   - Update title, description, and step labels
   - Save as `public/problems/<your-problem-name>.html`

2. **Create Problem Directory**:
   - Create a new folder in `public/js/problems/<your-problem-name>/`
   - Add these files:
     - `config.js`: Contains problem-specific configuration
     - `index.js`: Contains the problem implementation

3. **Implement Your Visualization**:
   - Start by defining your configuration in `config.js`
   - Implement the core visualization logic in `index.js`
   - Use the shared utility functions from `/js/utils/` whenever possible

4. **Update the Home Page**:
   - Add a new card to `index.html` for your problem

### Example: Adding a New Problem

Let's say you want to add a "Pythagorean Theorem" visualization:

1. **Create the HTML page**:
   ```html
   <!-- public/problems/pythagorean-theorem.html -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Pythagorean Theorem | Math Visualizations</title>
     <link rel="stylesheet" href="/css/styles.css">
   </head>
   <body>
     <!-- Header, content, and scripts similar to min-perimeter.html -->
     <!-- Update steps and description accordingly -->
     
     <!-- Include problem-specific scripts -->
     <script src="/js/problems/pythagorean-theorem/config.js"></script>
     <script src="/js/problems/pythagorean-theorem/index.js"></script>
   </body>
   </html>
   ```

2. **Create configuration file**:
   ```javascript
   // public/js/problems/pythagorean-theorem/config.js
   const config = {
     // Your problem-specific configuration
     triangle: {
       x: 100,
       y: 400,
       sideA: 200,
       sideB: 150
     },
     colors: {
       // Your color scheme
     },
     animDuration: 0.8
   };
   ```

3. **Implement visualization logic**:
   ```javascript
   // public/js/problems/pythagorean-theorem/index.js
   // Initialize your Konva stage and layers
   document.addEventListener('DOMContentLoaded', () => {
     // Set up your visualization
     initKonva();
     initEventListeners();
     // Other initialization code
   });
   
   // Implement step functions and other logic
   function drawStep1() {
     // Implementation
   }
   
   // Additional functions
   ```

4. **Add to homepage**:
   ```html
   <!-- Add to the problem-grid section in index.html -->
   <a href="/problems/pythagorean-theorem.html" class="problem-card">
     <div class="card-header">
       <h3>Pythagorean Theorem</h3>
     </div>
     <div class="card-body">
       <p>Interactive visualization of the Pythagorean Theorem.</p>
     </div>
   </a>
   ```

## Best Practices

1. **Reuse Common Utilities**: Leverage the shared utility functions in `/js/utils/` folder.

2. **Consistent UI**: Maintain the same UI pattern (steps sidebar, canvas, controls) for all problems.

3. **Responsive Design**: Ensure visualizations work well on both desktop and mobile.

4. **Performance**: Use animation sparingly and efficiently, especially for mobile devices.

5. **Documentation**: Document your code, especially for complex mathematical concepts.

## License

MIT

## Acknowledgments

- Konva.js for canvas manipulation
- GSAP for animations
