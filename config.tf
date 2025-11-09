# Terraform Provider configuration
provider "aws" {
  region = "us-east-1"  # Update this with your preferred AWS region
}

# Create an S3 bucket for static hosting
resource "aws_s3_bucket" "nextjs_bucket" {
  bucket = "nextjs-project-bucket"  # Change to a unique name
  acl    = "public-read"  # Grant public read access to files

  website {
    index_document = "index.html"
    # error_document = "error.html"  # Optional: add an error page
  }
}

# Enable versioning for the S3 bucket (optional)
resource "aws_s3_bucket_versioning" "nextjs_bucket_versioning" {
  bucket = aws_s3_bucket.nextjs_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Upload the static site files to the S3 bucket (Assuming Next.js is built and output to /out folder)
resource "aws_s3_object" "nextjs_static_files" {
  for_each = fileset("out", "**/*")  # Assuming 'out' is your Next.js build directory

  bucket = aws_s3_bucket.nextjs_bucket.bucket
  key    = each.value
  source = "out/${each.value}"  # Path to the built Next.js static files
  acl    = "public-read"
}

# CloudFront distribution for CDN (Optional, to serve the static files via CDN)
resource "aws_cloudfront_distribution" "nextjs_cdn" {
  origin {
    domain_name = aws_s3_bucket.nextjs_bucket.bucket_regional_domain_name
    origin_id   = "S3-nextjs-project-bucket"

    s3_origin_config {
      origin_access_identity = "origin-access-identity/cloudfront/E1234567890"  # Replace with your CloudFront OAI
    }
  }

  enabled = true
  is_ipv6_enabled = true
  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]
    target_origin_id = "S3-nextjs-project-bucket"
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_100"  # Use "PriceClass_100" to use the cheapest CloudFront edge locations

  viewer_certificate {
    acm_certificate_arn = "arn:aws:acm:us-east-1:1234567890:certificate/your-certificate-id"  # Replace with your ACM certificate ARN
    ssl_support_method  = "sni-only"
  }

  # Optional: CloudFront caching behaviors, security headers, etc.
}

output "website_url" {
  value = aws_cloudfront_distribution.nextjs_cdn.domain_name
}
