# Cosmic Runner

A web-based side-scrolling platform game where players navigate through a space station to reach energy checkpoints, featuring dynamic background animation and particle effects.

## Learning Journey

*May 11, 2025* - Today marks another day of JavaScript practice where I enhanced the design and mechanics for a key part of my coding journey after University. This project helped me strengthen my skills in the Intermediate Object-Oriented Programming section of FreeCodeCamp. Some repositories will now include notes on what I've learned and skills I've gained to track my progress.

## Features

* Smooth side-scrolling platform gameplay with intuitive controls.
* **Dynamic space background** with parallax stars and planets.
* **Player Character** with jumping mechanics and collision detection.
* **Multiple platforms** to navigate through the level.
* **Energy Checkpoints** that must be collected in sequential order.
* **Data Fragments** to collect for bonus points.
* **Particle Effects** when jumping, collecting items, and activating checkpoints.
* **Score System** tracking your progress.
* **Pause/Resume** functionality with a dedicated screen.
* **Responsive Design** that adjusts to different screen sizes.
* **Clean UI** with start, checkpoint, and pause screens.

## How to Play

1. Click the **"LAUNCH MISSION"** button on the start screen to begin the game.
2. Use the **Arrow Keys** (← →) or **A and D** keys to move your character left and right.
3. Press the **Space Bar**, **Up Arrow**, or **W** key to jump.
4. Navigate across platforms to reach glowing **Energy Checkpoints** in sequential order.
5. Collect purple **Data Fragments** to increase your score.
6. Press **Escape** or **P** to pause the game, and click **Resume** to continue.
7. Complete all checkpoints to finish the mission.

## Game Controls

* **Move Left**: Left Arrow or A
* **Move Right**: Right Arrow or D
* **Jump**: Space, Up Arrow, or W
* **Pause/Resume**: Escape or P

## How to View Project

```bash
# Clone the repository
git clone https://github.com/yourusername/cosmic-code-runner.git
```
```bash
# Navigate to the project directory
cd cosmic-code-runner
```

# Open index.html in your browser:
```bash
open index.html    # Mac
```

OR

```bash
start index.html   # Windows
```

# Alternative Methods
If you prefer to run it on a local server:

Using Python
```bash
# For Python 3
python3 -m http.server

# Then open in your browser:
# http://localhost:8000
```

Using Node.js
```bash
# Using npx and http-server
npx http-server

# Then open in your browser:
# http://localhost:8080
```

OR

* Visit the GitHub Pages site at: https://quantumdaveldn.github.io/cosmic-code-runner/

## Technologies Used

* HTML5
* CSS3
* JavaScript (Vanilla)
* HTML5 Canvas for game rendering

## Project Structure

├── index.html # Main HTML file with game structure

├── styles.css # CSS for styling UI elements

├── script.js  # JavaScript for game mechanics and animation

├── README.md  # This file

└── .gitignore # Specifies files for Git to ignore

## Game Mechanics

* **Platform Physics**: The character can jump on platforms and bounce off their bottoms.
* **World Scrolling**: The world scrolls when the player reaches the edge of the screen.
* **Checkpoint System**: Checkpoints must be claimed in sequential order.
* **Particle System**: Visual effects are generated when interacting with game elements.
* **Responsive Design**: The game adjusts to different screen sizes to maintain playability.

## Future Improvements 

* Add different level designs with increasing difficulty.
* Implement enemies or obstacles to avoid.
* Add sound effects and background music.
* Create a level editor for custom level creation.
* Include more collectible types with different effects.
* Add a high-score system with local storage.
* Implement more character customization options.
* Create additional visual effects for environment interaction.
* Add mobile touch controls for better cross-platform support.

## License

This project is open source and available under the MIT License.
