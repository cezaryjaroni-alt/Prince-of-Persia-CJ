# Pracuj: Corporate Escape

A 3D parkour platformer inspired by **Prince of Persia: The Sands of Time** (2003), themed around the Polish job portal **Pracuj.pl**.

## 🎮 Game Features

### Visual Style
- **Pracuj.pl Color Palette**: Primary Blue (#0046AB), White, and Gold accents
- **Corporate Office Dungeon**: Floating cubicles, glass walls, and high-rise office windows
- **PS2-Era Graphics**: Low-poly aesthetics with bloom and scanline effects

### Core Mechanics

1. **Movement**: Fluid 3rd-person controls with WASD, wall-running, and ledge-grabbing
2. **Resume Rewind**: Press 'R' to reverse the last 5 seconds of gameplay with a blue digital glitch effect (3 charges)
3. **Hazards**:
   - 🔥 Burnout Spikes
   - 🪑 Meeting Traps (spinning obstacles)
   - 📉 Unpaid Internship Pitfalls
4. **Goal**: Reach the **Grand Offer** (golden briefcase) at the end of the level

### UI Elements
- **CV Progress Bar**: Health displayed as CV completion percentage
- **Rewind Charges**: Visual indicators for Resume Rewind uses

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Move |
| SPACE | Jump |
| SHIFT | Sprint |
| R | Resume Rewind |
| Mouse | Look around |

### Wall Running
- Run towards a wall at speed to initiate wall-running
- Jump while wall-running to perform a wall jump

## 🛠️ Tech Stack

- **3D Engine**: Three.js
- **Physics**: Cannon-es
- **Build Tool**: Vite
- **Post-Processing**: Three.js EffectComposer with custom PS2-era shader

## 📁 Project Structure

```
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── public/                 # Static assets
└── src/
    ├── main.js             # Entry point
    ├── game/
    │   ├── Game.js         # Main game orchestrator
    │   ├── Character.js    # Player controller
    │   ├── Physics.js      # Cannon.js wrapper
    │   ├── Level.js        # Level geometry & hazards
    │   ├── RewindSystem.js # Time rewind mechanic
    │   └── UI.js           # UI management
    ├── shaders/
    │   └── PS2Shader.js    # Retro visual effects
    └── styles/
        └── main.css        # Game styling
```

## 🎯 Design Philosophy

This game pays homage to the iconic Prince of Persia: The Sands of Time while incorporating corporate workplace humor themed around job hunting. The "Resume Rewind" mechanic replaces the Dagger of Time, and hazards are reimagined as workplace challenges.

## 📜 License

MIT License

---

*Navigate the Corporate Office Dungeon and find the Grand Offer!* 💼
