export const testFiles = {
  'img/glass-of-water.svg': `<svg width="100" height="120" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
  <!-- Glass outline -->
  <path d="M20 20 L80 20 L75 100 L25 100 Z"
        fill="none"
        stroke="#666"
        stroke-width="2"/>

  <!-- Water -->
  <path d="M22 30 L78 30 L74 95 L26 95 Z"
        fill="#4A90E2"
        opacity="0.7"/>

  <!-- Water surface -->
  <ellipse cx="50" cy="30" rx="28" ry="3"
           fill="#2E7BCF"/>

  <!-- Glass rim -->
  <ellipse cx="50" cy="20" rx="30" ry="3"
           fill="none"
           stroke="#666"
           stroke-width="2"/>

  <!-- Highlight -->
  <path d="M25 25 L25 90"
        stroke="#CCE7FF"
        stroke-width="2"
        opacity="0.6"/>
</svg>`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <h1>Hello World!</h1>
    <img src="img/glass-of-water.svg" alt="Glass of Water" width="100" height="120">
</body>
</html>`
}
