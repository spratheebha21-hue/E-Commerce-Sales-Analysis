CREATE TABLE IF NOT EXISTS ecommerce_sales (
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
