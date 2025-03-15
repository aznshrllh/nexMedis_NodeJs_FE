# NexMedis Frontend Application

A modern healthcare management system frontend built with React, TypeScript, and Vite.

## Overview

NexMedis is a comprehensive healthcare management system that allows users to browse medical products, manage shopping carts, track orders, and view analytics about top customers.

## Prerequisites

Before running this application, ensure you have the following installed:

- Node.js (v18 or newer)
- npm or yarn

## Backend Server

This frontend application requires the backend server to be running. You can find the backend repository at:

- [NexMedis Node.js Backend](https://github.com/aznshrllh/nexMedis_NodeJs_BackEnd)

### Setting up the backend:

1. Clone the backend repository:
   ```
   git clone https://github.com/aznshrllh/nexMedis_NodeJs_BackEnd.git
   ```
2. Follow the installation instructions in the backend repository's README
3. Start the backend server before running the frontend application

## Installation

1. Clone this repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```
   cd FE-nexMedis
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Configuration

By default, the application is configured to connect to a backend running on `http://localhost:3000`. If your backend is running on a different URL, update the `baseURL` in `src/configs/axiosInstance.ts`.

## Running the Application

1. Ensure the backend server is running first
2. Start the development server:
   ```
   npm run dev
   ```
3. Open your browser and navigate to the URL displayed in your terminal (typically `http://localhost:5173`)

## Building for Production

To build the application for production:

```
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Features

- **Authentication**: User registration and login
- **Product Catalog**: Browse, search, and filter medical products
- **Shopping Cart**: Add products to cart, adjust quantities
- **Order Management**: Place orders and track order history
- **Analytics**: View top customers by spending

## Tech Stack

- **React**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and development server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Zod**: Form validation
- **React Hook Form**: Form state management
- **ShadCN UI**: UI component library
- **Lucide React**: Icon library
- **TailwindCSS**: Utility-first CSS framework

## Project Structure

- `src/components/`: React components
- `src/pages/`: Page components
- `src/configs/`: Configuration files
- `src/lib/`: Utility functions
- `src/routes.ts`: Application routes

## License

This project is proprietary and confidential.

## Contact

For any inquiries, please contact the repository owner.
