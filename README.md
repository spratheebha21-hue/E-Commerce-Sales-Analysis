# E-commerce Sales Analysis

This project demonstrates a lightweight full-stack analytics setup for an e-commerce sales dashboard. The backend uses R for analytics and Python for API exposure, while the frontend is a responsive single-page React dashboard that consumes the analytics results.

## Project Overview

The solution is designed to:

- read e-commerce sales data from PostgreSQL when available
- fall back to a built-in sample CSV dataset when PostgreSQL is not configured
- run business analytics in R
- serialize the output as JSON
- expose the processed data through a Python API
- render a responsive dashboard in React

The dashboard focuses on realistic e-commerce KPIs such as:

- total revenue
- total orders
- average order value
- revenue by month
- sales by category
- sales by region
- top products

## Tech Stack

- R 4.x for the analytics engine
- Python 3.x + FastAPI for the lightweight API service
- PostgreSQL for production data source integration
- React + Vite for the frontend dashboard

## Project Structure

```text
E-Commerce Analysis/
├── backend/
│   ├── analytics/
│   │   └── sales_analysis.R
│   ├── data/
│   │   └── sample_sales_data.csv
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── README.md
└── .venv/
```

## Analytics Workflow

1. The R script reads data from PostgreSQL if environment variables are available.
2. If PostgreSQL is not configured, it falls back to the sample CSV file.
3. The script calculates key metrics and aggregates data by month, category, region, and product.
4. The result is printed as JSON.
5. The Python FastAPI app calls the R script and returns the JSON through an API endpoint.
6. The React page requests the data and renders the dashboard.

## Setup Instructions

### 1. Prerequisites

Install:

- Python 3.10+
- R 4.x
- Node.js 18+
- npm

### 2. Backend Setup

From the project root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# or .venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

If you want to connect to PostgreSQL, copy the sample environment file and configure it:

```bash
copy .env.example .env
```

Then edit `.env` with your PostgreSQL connection details.

Example:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ecommerce
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### 3. Run the Python API

```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The endpoint will be available at:

```text
http://localhost:8000/api/analytics
```

### 4. Frontend Setup

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Runtime Behavior

The frontend calls the API at `http://localhost:8000/api/analytics`.

The API will respond with a JSON object like this:

```json
{
  "summary": {
    "total_revenue": 25513.9,
    "total_orders": 48,
    "avg_order_value": 531.54,
    "top_category": "Electronics"
  },
  "by_month": [
    { "month": "2024-01", "revenue": 4365.6, "order_count": 4 }
  ],
  "by_category": [
    { "category": "Electronics", "revenue": 11874.6 }
  ],
  "by_region": [
    { "region": "North", "revenue": 7769.8 }
  ],
  "top_products": [
    { "product": "Laptop Pro", "revenue": 3710, "units": 3 }
  ]
}
```

## PostgreSQL Seed Data and Migration Setup

This project includes a lightweight seed dataset for local testing, but it does not yet use a formal migration tool such as Alembic or Flyway. The R script is written to query a table named `ecommerce_sales` when PostgreSQL is configured.

### Recommended database table

```sql
CREATE TABLE ecommerce_sales (
    order_id INT,
    order_date DATE,
    customer_id VARCHAR(50),
    product_category VARCHAR(50),
    product_name VARCHAR(100),
    region VARCHAR(50),
    sales_channel VARCHAR(50),
    quantity INT,
    unit_price DECIMAL(10,2),
    discount_pct DECIMAL(5,2),
    order_status VARCHAR(50)
);
```

### Example seed insert data

```sql
INSERT INTO ecommerce_sales (
    order_id, order_date, customer_id, product_category, product_name, region,
    sales_channel, quantity, unit_price, discount_pct, order_status
) VALUES
(1001, '2024-01-05', 'C-1001', 'Electronics', 'Laptop Pro', 'North', 'Online', 2, 1400.00, 0.10, 'Completed'),
(1002, '2024-01-07', 'C-1002', 'Home', 'Air Purifier', 'West', 'Online', 3, 240.00, 0.15, 'Completed'),
(1003, '2024-01-12', 'C-1003', 'Fashion', 'Running Shoes', 'South', 'Store', 4, 120.00, 0.08, 'Completed'),
(1004, '2024-01-18', 'C-1004', 'Electronics', 'Noise Cancelling Headphones', 'East', 'Online', 5, 180.00, 0.12, 'Completed'),
(1005, '2024-02-03', 'C-1005', 'Beauty', 'Skincare Kit', 'North', 'Online', 2, 95.00, 0.10, 'Completed'),
(1006, '2024-02-11', 'C-1006', 'Home', 'Smart Thermostat', 'West', 'Store', 1, 320.00, 0.05, 'Completed'),
(1007, '2024-02-16', 'C-1007', 'Electronics', 'Smartwatch', 'South', 'Online', 3, 260.00, 0.10, 'Completed'),
(1008, '2024-02-22', 'C-1008', 'Fashion', 'Office Chair', 'East', 'Store', 2, 190.00, 0.08, 'Completed'),
(1009, '2024-03-01', 'C-1009', 'Beauty', 'Hair Dryer', 'North', 'Online', 6, 70.00, 0.18, 'Completed'),
(1010, '2024-03-09', 'C-1010', 'Home', 'Robot Vacuum', 'West', 'Online', 1, 430.00, 0.12, 'Completed'),
(1011, '2024-03-14', 'C-1011', 'Electronics', '4K Monitor', 'South', 'Store', 2, 420.00, 0.09, 'Completed'),
(1012, '2024-03-21', 'C-1012', 'Beauty', 'Perfume Set', 'East', 'Online', 3, 150.00, 0.15, 'Completed'),
(1013, '2024-04-02', 'C-1013', 'Electronics', 'Laptop Pro', 'North', 'Store', 1, 1400.00, 0.15, 'Completed'),
(1014, '2024-04-10', 'C-1014', 'Fashion', 'Leather Jacket', 'West', 'Online', 2, 260.00, 0.20, 'Completed'),
(1015, '2024-04-17', 'C-1015', 'Home', 'Air Fryer', 'South', 'Store', 4, 180.00, 0.10, 'Completed'),
(1016, '2024-04-27', 'C-1016', 'Beauty', 'Face Serum', 'East', 'Online', 5, 80.00, 0.12, 'Completed'),
(1017, '2024-05-05', 'C-1017', 'Electronics', 'Tablet', 'North', 'Online', 3, 500.00, 0.12, 'Completed'),
(1018, '2024-05-13', 'C-1018', 'Home', 'Pressure Cooker', 'West', 'Store', 2, 170.00, 0.10, 'Completed'),
(1019, '2024-05-21', 'C-1019', 'Fashion', 'Premium Backpack', 'South', 'Online', 7, 110.00, 0.08, 'Completed'),
(1020, '2024-05-28', 'C-1020', 'Electronics', 'Wireless Speaker', 'East', 'Store', 4, 120.00, 0.15, 'Completed'),
(1021, '2024-06-04', 'C-1021', 'Beauty', 'Body Lotion', 'North', 'Online', 6, 45.00, 0.10, 'Completed'),
(1022, '2024-06-11', 'C-1022', 'Home', 'Espresso Machine', 'West', 'Online', 2, 390.00, 0.18, 'Completed'),
(1023, '2024-06-19', 'C-1023', 'Electronics', 'Gaming Console', 'South', 'Store', 1, 550.00, 0.14, 'Completed'),
(1024, '2024-06-24', 'C-1024', 'Fashion', 'Sneakers', 'East', 'Online', 5, 140.00, 0.10, 'Completed'),
(1025, '2024-07-02', 'C-1025', 'Beauty', 'Makeup Bundle', 'North', 'Store', 3, 100.00, 0.12, 'Completed'),
(1026, '2024-07-07', 'C-1026', 'Home', 'Water Filter', 'West', 'Online', 2, 220.00, 0.15, 'Completed'),
(1027, '2024-07-16', 'C-1027', 'Electronics', 'USB-C Dock', 'South', 'Store', 8, 90.00, 0.08, 'Completed'),
(1028, '2024-07-23', 'C-1028', 'Fashion', 'Desk Lamp', 'East', 'Online', 4, 80.00, 0.05, 'Completed'),
(1029, '2024-08-05', 'C-1029', 'Beauty', 'Electric Shaver', 'North', 'Online', 1, 200.00, 0.20, 'Completed'),
(1030, '2024-08-16', 'C-1030', 'Home', 'Standing Desk', 'West', 'Store', 1, 680.00, 0.10, 'Completed'),
(1031, '2024-08-21', 'C-1031', 'Electronics', 'Webcam', 'South', 'Online', 6, 110.00, 0.15, 'Completed'),
(1032, '2024-08-29', 'C-1032', 'Fashion', 'Travel Bag', 'East', 'Store', 3, 130.00, 0.12, 'Completed'),
(1033, '2024-09-04', 'C-1033', 'Beauty', 'Premium Candle Set', 'North', 'Online', 2, 75.00, 0.18, 'Completed'),
(1034, '2024-09-12', 'C-1034', 'Home', 'Ceiling Fan', 'West', 'Online', 3, 190.00, 0.10, 'Completed'),
(1035, '2024-09-18', 'C-1035', 'Electronics', 'Wireless Charger', 'South', 'Store', 5, 60.00, 0.05, 'Completed'),
(1036, '2024-09-24', 'C-1036', 'Fashion', 'Casual Blazer', 'East', 'Online', 2, 210.00, 0.15, 'Completed'),
(1037, '2024-10-03', 'C-1037', 'Beauty', 'Skin Analyzer', 'North', 'Store', 2, 260.00, 0.12, 'Completed'),
(1038, '2024-10-10', 'C-1038', 'Home', 'Air Fryer', 'West', 'Online', 4, 180.00, 0.15, 'Completed'),
(1039, '2024-10-20', 'C-1039', 'Electronics', 'Smartwatch', 'South', 'Store', 2, 260.00, 0.08, 'Completed'),
(1040, '2024-10-27', 'C-1040', 'Fashion', 'Winter Coat', 'East', 'Online', 1, 300.00, 0.18, 'Completed'),
(1041, '2024-11-04', 'C-1041', 'Beauty', 'Hair Straightener', 'North', 'Online', 4, 150.00, 0.10, 'Completed'),
(1042, '2024-11-12', 'C-1042', 'Home', 'Dehumidifier', 'West', 'Store', 1, 230.00, 0.14, 'Completed'),
(1043, '2024-11-18', 'C-1043', 'Electronics', 'Projector', 'South', 'Online', 2, 720.00, 0.10, 'Completed'),
(1044, '2024-11-26', 'C-1044', 'Fashion', 'Formal Shirt', 'East', 'Store', 3, 90.00, 0.08, 'Completed'),
(1045, '2024-12-02', 'C-1045', 'Beauty', 'Gift Box', 'North', 'Online', 8, 65.00, 0.16, 'Completed'),
(1046, '2024-12-07', 'C-1046', 'Home', 'Massage Gun', 'West', 'Online', 2, 240.00, 0.20, 'Completed'),
(1047, '2024-12-15', 'C-1047', 'Electronics', 'Monitor Arm', 'South', 'Store', 4, 120.00, 0.12, 'Completed'),
(1048, '2024-12-28', 'C-1048', 'Fashion', 'Winter Boots', 'East', 'Online', 3, 200.00, 0.10, 'Completed');
```

### Seed migration strategy

For a small project like this, the simplest pattern is:

1. create the table
2. insert the seed rows
3. keep the seed script in a versioned folder such as `backend/migrations/`
4. later extend it with additional inserts or transformations as the dataset grows

Example folder layout:

```text
backend/
├── migrations/
│   ├── 001_create_ecommerce_sales.sql
│   └── 002_seed_ecommerce_sales.sql
```

### Notes

- The sample CSV is included to make the project runnable without a database.
- The R script is the source of analytics logic and is designed to be easily extended with more metrics or forecasting logic.
- The frontend is intentionally simple and focused on a single analytic view for quick demonstration.

## Future Enhancements

Potential next steps:

- add advanced filters by date, region, and category
- add charts using a charting library such as Recharts
- connect to a real PostgreSQL schema
- add authentication and role-based dashboard views
- deploy the backend and frontend separately
