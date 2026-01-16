# API Testing Script for Report Run System (PowerShell)
# Usage: .\test-api.ps1

$ErrorActionPreference = "Stop"

$BASE_URL = "http://localhost:3000"
$SCHEDULE_ID = "test_schedule_$(Get-Date -UFormat %s -Millisecond 0)"
$TIMESTAMP = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🧪 Testing Report Run API" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Base URL: $BASE_URL"
Write-Host "Schedule ID: $SCHEDULE_ID"
Write-Host ""

# Test 1: POST First Run
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Test 1: POST /api/report-run (First Run)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$body1 = @{
    schedule_id = $SCHEDULE_ID
    industry = "Technology & Software"
    sub_niche = "AI-powered CRM software"
    frequency = "weekly"
    run_at = $TIMESTAMP
    is_first_run = $true
    final_report = "<h1>Test Report #1</h1><p>This is the first test report.</p>"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$BASE_URL/api/report-run" -Method Post -Body $body1 -ContentType "application/json"
    Write-Host "✓ Success (HTTP 200)" -ForegroundColor Green
    $response1 | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "✗ Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Start-Sleep -Seconds 1

# Test 2: POST Subsequent Run
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Test 2: POST /api/report-run (Subsequent Run)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$TIMESTAMP2 = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$body2 = @{
    schedule_id = $SCHEDULE_ID
    industry = "Technology & Software"
    sub_niche = "AI-powered CRM software"
    frequency = "weekly"
    run_at = $TIMESTAMP2
    is_first_run = $false
    final_report = "<h1>Test Report #2</h1><p>This is the second test report.</p>"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$BASE_URL/api/report-run" -Method Post -Body $body2 -ContentType "application/json"
    Write-Host "✓ Success (HTTP 200)" -ForegroundColor Green
    $response2 | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "✗ Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Start-Sleep -Seconds 1

# Test 3: GET Reports
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Test 3: GET /api/reports/:schedule_id" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

try {
    $response3 = Invoke-RestMethod -Uri "$BASE_URL/api/reports/$SCHEDULE_ID" -Method Get
    Write-Host "✓ Success (HTTP 200)" -ForegroundColor Green
    $response3 | ConvertTo-Json -Depth 10 | Write-Host
    
    # Check if we got 2 executions
    if ($response3.total_executions -eq 2) {
        Write-Host "`n✓ Verified: 2 executions found" -ForegroundColor Green
    } else {
        Write-Host "`n⚠ Warning: Expected 2 executions, found $($response3.total_executions)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Start-Sleep -Seconds 1

# Test 4: Validation Error
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Test 4: Validation Error (Missing Fields)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$body4 = @{
    schedule_id = $SCHEDULE_ID
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri "$BASE_URL/api/report-run" -Method Post -Body $body4 -ContentType "application/json"
    Write-Host "✗ Expected 400, but request succeeded" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "✓ Correctly returned 400" -ForegroundColor Green
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        $errorResponse | ConvertTo-Json -Depth 10 | Write-Host
    } else {
        Write-Host "✗ Expected 400, got $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Start-Sleep -Seconds 1

# Test 5: Invalid Frequency
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Test 5: Validation Error (Invalid Frequency)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$body5 = @{
    schedule_id = $SCHEDULE_ID
    industry = "Technology"
    sub_niche = "AI"
    frequency = "hourly"
    run_at = $TIMESTAMP
    is_first_run = $false
    final_report = "Test"
} | ConvertTo-Json

try {
    $response5 = Invoke-RestMethod -Uri "$BASE_URL/api/report-run" -Method Post -Body $body5 -ContentType "application/json"
    Write-Host "✗ Expected 400, but request succeeded" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "✓ Correctly returned 400" -ForegroundColor Green
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        $errorResponse | ConvertTo-Json -Depth 10 | Write-Host
    } else {
        Write-Host "✗ Expected 400, got $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Start-Sleep -Seconds 1

# Test 6: Method Not Allowed
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Test 6: Method Not Allowed (GET on POST endpoint)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

try {
    $response6 = Invoke-RestMethod -Uri "$BASE_URL/api/report-run" -Method Get
    Write-Host "✗ Expected 405, but request succeeded" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 405) {
        Write-Host "✓ Correctly returned 405" -ForegroundColor Green
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        $errorResponse | ConvertTo-Json -Depth 10 | Write-Host
    } else {
        Write-Host "✗ Expected 405, got $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ All tests passed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test schedule ID: $SCHEDULE_ID"
Write-Host "Check the data directory for stored files:"
Write-Host "  - data\schedules\$SCHEDULE_ID.json"
Write-Host "  - data\executions\$SCHEDULE_ID.json"
Write-Host ""

