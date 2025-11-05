# Agricultural Resource Management System

An integrated system for managing agricultural resources, including farm data, marketplace, user management, and alerts. Built with a Django backend and a React frontend using shadcn-ui.

## Features

- **Farm Data Management**: Track and analyze agricultural data.
- **Marketplace**: Buy and sell agricultural products.
- **Farm Equipment Rental**: Rent agricultural equipment from other users or providers, with booking and payment integration.
- **Government Schemes Application**: Apply for and track government agricultural schemes, subsidies, and grants with automated form submissions and status updates.
- **User Management**: Handle user authentication and profiles.
- **Alerts System**: Receive notifications for important events.
- **API Integration**: RESTful APIs for seamless data exchange.
- **Responsive UI**: Modern, responsive interface built with React and Tailwind CSS.

## Tech Stack

### Backend
- **Django**: Web framework for the backend.
- **Python**: Programming language.
- **PostgreSQL/MySQL**: Database (configure in settings).

### Frontend
- **React**: JavaScript library for building user interfaces.
- **Vite**: Build tool for fast development.
- **shadcn-ui**: UI components library.
- **Tailwind CSS**: Utility-first CSS framework.
- **TypeScript**: Typed JavaScript.

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- pnpm (for frontend package management)
- pip (for Python dependencies)

## Installation and Setup

### Backend Setup

1. Navigate to the backend directory:
   ```sh
   cd DBMS-PROJECT
   ```

2. Create a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

4. Set up the database:
   - Configure your database settings in `agricultural_system/settings.py`.
   - Run migrations:
     ```sh
     python manage.py migrate
     ```

5. Create a superuser:
   ```sh
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```sh
   python manage.py runserver
   ```

For detailed setup, refer to [SETUP_GUIDE.md](SETUP_GUIDE.md).

### Frontend Setup

1. Navigate to the frontend directory:
   ```sh
   cd shadcn-ui
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```

3. Start the development server:
   ```sh
   pnpm run dev
   ```

The frontend will be available at `http://localhost:5173`.

### Quick Start

Use the provided script for a quick setup:
```sh
./quick-start.sh
```

This script sets up both backend and frontend environments.

## Usage

- Access the Django admin at `http://localhost:8000/admin`.
- Use the frontend interface for user interactions.
- API endpoints are available under `/api/`.

For integration details, see [README_INTEGRATION.md](README_INTEGRATION.md) and [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md).

## Project Structure

- `DBMS-PROJECT/`: Django backend application.
  - `agricultural_system/`: Main Django project.
  - `farm_data/`: Farm data management app.
  - `marketplace/`: Marketplace app.
  - `equipment_rental/`: Farm equipment rental app.
  - `government_schemes/`: Government schemes application app.
  - `users/`: User management app.
  - `alerts/`: Alerts system app.
  - `api/`: API endpoints.
- `shadcn-ui/`: React frontend application.
