if (!requireNamespace("jsonlite", quietly = TRUE)) {
  install.packages("jsonlite", repos = "https://cloud.r-project.org")
}

library(jsonlite)

fallback_data_path <- file.path("data", "sample_sales_data.csv")

read_sales_data <- function() {
  postgres_dsn <- Sys.getenv("POSTGRES_DSN", unset = "")

  if (nzchar(postgres_dsn)) {
    if (!requireNamespace("DBI", quietly = TRUE)) {
      install.packages("DBI", repos = "https://cloud.r-project.org")
    }
    if (!requireNamespace("RPostgres", quietly = TRUE)) {
      install.packages("RPostgres", repos = "https://cloud.r-project.org")
    }

    library(DBI)
    library(RPostgres)

    tryCatch({
      conn <- dbConnect(RPostgres::Postgres(), dbname = Sys.getenv("POSTGRES_DB", "postgres"),
                        host = Sys.getenv("POSTGRES_HOST", "localhost"),
                        port = as.integer(Sys.getenv("POSTGRES_PORT", "5432")),
                        user = Sys.getenv("POSTGRES_USER", "postgres"),
                        password = Sys.getenv("POSTGRES_PASSWORD", "postgres"),
                        bigint = "integer")
      query <- "SELECT * FROM ecommerce_sales ORDER BY order_date;"
      df <- dbGetQuery(conn, query)
      dbDisconnect(conn)
      if (nrow(df) > 0) return(df)
    }, error = function(e) {
      warning(paste("PostgreSQL query failed, falling back to CSV:", e$message))
    })
  }

  if (file.exists(fallback_data_path)) {
    return(read.csv(fallback_data_path, stringsAsFactors = FALSE))
  }

  stop("No PostgreSQL data source or sample CSV dataset found.")
}

build_analytics <- function(df) {
  df$order_date <- as.Date(df$order_date)
  df$revenue <- as.numeric(df$quantity) * as.numeric(df$unit_price) * (1 - as.numeric(df$discount_pct))

  summary_stats <- list(
    total_revenue = round(sum(df$revenue, na.rm = TRUE), 2),
    total_orders = length(unique(df$order_id)),
    total_customers = length(unique(df$customer_id)),
    avg_order_value = round(mean(tapply(df$revenue, df$order_id, sum), na.rm = TRUE), 2),
    top_category = names(sort(tapply(df$revenue, df$product_category, sum), decreasing = TRUE))[1]
  )

  monthly <- aggregate(revenue ~ format(order_date, "%Y-%m"), data = df, FUN = sum)
  names(monthly) <- c("month", "revenue")
  monthly$order_count <- aggregate(order_id ~ format(order_date, "%Y-%m"), data = df, FUN = function(x) length(unique(x)))$`order_id`
  monthly <- monthly[order(monthly$month), ]

  by_category <- aggregate(revenue ~ product_category, data = df, FUN = sum)
  by_category <- by_category[order(by_category$revenue, decreasing = TRUE), ]
  names(by_category) <- c("category", "revenue")

  by_region <- aggregate(revenue ~ region, data = df, FUN = sum)
  by_region <- by_region[order(by_region$revenue, decreasing = TRUE), ]
  names(by_region) <- c("region", "revenue")

  top_products <- aggregate(cbind(revenue = revenue, units = quantity) ~ product_name, data = df, FUN = sum)
  top_products <- top_products[order(top_products$revenue, decreasing = TRUE), ]
  top_products <- head(top_products, 5)
  top_products$product_name <- as.character(top_products$product_name)
  top_products <- top_products[, c("product_name", "revenue", "units")]
  names(top_products)[1] <- "product"

  list(
    summary = summary_stats,
    by_month = monthly,
    by_category = by_category,
    by_region = by_region,
    top_products = top_products
  )
}

df <- read_sales_data()
result <- build_analytics(df)
cat(toJSON(result, auto_unbox = TRUE, digits = 2, pretty = TRUE))
