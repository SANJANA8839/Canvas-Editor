# Canvas Editor

A real-time collaborative drawing application that allows users to create and save digital artwork directly in the browser. Built with React, Fabric.js, and Firebase.

## Features

- **Drawing Tools**: Pen, shapes (rectangle, circle, line), and text tools
- **Color Selection**: Choose colors for all drawing elements
- **Object Manipulation**: Select, move, resize, and delete objects
- **Real-time Saving**: Automatically saves your work to Firebase

## Tech Stack

- **Frontend**: React js, Fabric.js 
- **Backend**: Firebase (Firestore)
- **Routing**: React Router
- **Build Tool**: Vite
- **Canvas** : fabric.js

## Getting Started

1. **Clone and run**

`ash
git clone https://github.com/SANJANA8839/Canvas-Editor.git
cd canvas-editor
`


`ash
npm install
`


`ash
npm run dev
`

## How It Works

The Canvas Editor uses Fabric.js to create an interactive canvas where users can draw and manipulate objects. Each drawing is saved to Firebase Firestore, allowing users to access their work from anywhere.

The application provides:
- A clean, intuitive user interface
- High-performance canvas rendering
- Efficient storage of drawing data

## Special Mentions

- **Fabric.js**: Powers the interactive canvas with excellent object manipulation capabilities
- **Firebase**: Provides real-time database functionality for saving and loading canvases

## License

MIT
