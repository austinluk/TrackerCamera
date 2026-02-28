# TrackerCamera - Face Filter Tracker

A React Native camera app with real-time face detection and tracking capabilities.

## Features

- Real-time face detection and tracking using Vision Camera
- Face filter overlays powered by React Native Skia
- Camera permissions handling
- Photo capture with media library integration
- Built with Expo and TypeScript

## Getting Started

### Prerequisites

- Node.js installed
- iOS Simulator or Android Emulator
- Expo CLI

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npx expo start
   ```

3. Run on your device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go for physical device

## Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Vision Camera** - Camera functionality
- **React Native Skia** - 2D graphics rendering
- **Face Detector** - ML-powered face tracking

## Permissions

The app requires:

- Camera access
- Media library access (for saving photos)

## Project Structure

- `app/` - Screen components and navigation
- `components/` - Reusable UI components
- `constants/` - App-wide constants and theme colors
- `hooks/` - Custom React hooks

## Development

To modify the app, edit files in the `app/` directory. The project uses Expo Router for file-based routing.
