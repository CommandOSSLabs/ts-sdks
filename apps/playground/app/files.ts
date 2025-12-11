export const testFilesSet1 = {
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

export const testFilesSet2 = {
  'img/sun.svg': `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Sun circle -->
  <circle cx="50" cy="50" r="20" fill="#FFD700"/>
  <!-- Sun rays -->
  <g stroke="#FFD700" stroke-width="3" stroke-linecap="round">
    <line x1="50" y1="15" x2="50" y2="5"/>
    <line x1="50" y1="95" x2="50" y2="85"/>
    <line x1="15" y1="50" x2="5" y2="50"/>
    <line x1="95" y1="50" x2="85" y2="50"/>
    <line x1="25" y1="25" x2="18" y2="18"/>
    <line x1="75" y1="75" x2="82" y2="82"/>
    <line x1="25" y1="75" x2="18" y2="82"/>
    <line x1="75" y1="25" x2="82" y2="18"/>
  </g>
</svg>`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Good Morning</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <h1>Good Morning!</h1>
    <img src="img/sun.svg" alt="Sun" width="100" height="100">
    <p>Have a wonderful day!</p>
</body>
</html>`
}

// For backward compatibility
export const testFiles = testFilesSet1
