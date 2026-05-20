# Google Cloud Document AI Integration Setup

## Overview
Your receipt scanning feature now uses Google Cloud Document AI instead of Gemini for superior accuracy and structured data extraction.

## Architecture
- **Edge Function**: `process-receipt` handles authentication and API calls to Document AI
- **Frontend**: `TicketScanner.tsx` component captures images and displays results
- **Auto-populate**: Extracted data automatically fills the expense form

## Required Secrets Configuration

You mentioned you've already stored these secrets in Supabase. To make them available to the Edge Function, you need to add them using the Supabase CLI:

```bash
# Set GCP Service Account JSON
supabase secrets set GCP_SERVICE_ACCOUNT="<your-full-service-account-json>"

# Set GCP Processor ID (from Document AI console)
supabase secrets set GCP_PROCESSOR_ID="<your-processor-id>"

# Set GCP Project ID
supabase secrets set GCP_PROJECT_ID="chivito-bridge"
```

### Finding Your Values

1. **GCP_SERVICE_ACCOUNT**: The full JSON key content from your service account
   - Go to: Google Cloud Console → IAM & Admin → Service Accounts
   - Download the JSON key file
   - Copy the entire JSON content

2. **GCP_PROCESSOR_ID**: Your Expense Parser processor ID
   - Go to: Google Cloud Console → Document AI → Processors
   - Select your "Expense Parser"
   - Copy the processor ID from the URL or details page
   - Format: Should include the full path with location (e.g., `projects/PROJECT_ID/locations/us/processors/PROCESSOR_ID`)

3. **GCP_PROJECT_ID**: `chivito-bridge` (your GCP project ID)

## What Was Changed

### 1. New Edge Function: `process-receipt`
- Authenticates with Google Cloud using service account credentials
- Sends receipt images to Document AI Expense Parser
- Extracts: merchant name, total amount, currency, date, tax amount
- Auto-suggests expense category based on merchant name
- Returns structured JSON with confidence scores

### 2. Updated Frontend: `TicketScanner.tsx`
- Now calls `/functions/v1/process-receipt` instead of `/functions/v1/scan-ticket`
- Shows "Procesando con Google AI (3-5 seg)..." during processing
- Displays error for low-confidence results: "Análisis incompleto. Por favor verifica los datos o toma una foto más clara."
- Warning shown if confidence < 0.6

### 3. Improved Error Handling
- Specific messages for common failures (missing config, parsing errors, timeout)
- Low confidence detection with user-friendly prompts
- Graceful fallback with manual entry option

## Data Flow

```
User Takes Photo
    ↓
TicketScanner converts to base64
    ↓
POST /functions/v1/process-receipt
    ↓
Edge Function authenticates with GCP
    ↓
Document AI processes receipt
    ↓
Extract structured data
    ↓
Auto-populate expense form
    ↓
User reviews & saves
```

## Extracted Fields

From Document AI Expense Parser:
- ✅ Merchant/Supplier name (`comercio`)
- ✅ Total amount (`monto_total`)
- ✅ Currency (`moneda`)
- ✅ Receipt date (`fecha`)
- ✅ Tax/VAT amount (`tax_amount`)
- ✅ Suggested category (`categoria_sugerida`)
- ✅ Confidence score (`confianza`)

## Category Auto-Mapping

The system intelligently maps merchants to categories:
- **Comida**: restaurants, cafes, grocery stores (OXXO, Walmart, 7-Eleven)
- **Transporte**: Uber, taxis, gas stations (Pemex)
- **Salud**: pharmacies, hospitals, clinics
- **Entretenimiento**: cinemas, theaters, concerts
- **Servicios**: utilities (electricity, water, internet)
- **Otros**: fallback for unrecognized merchants

## Testing the Integration

1. Ensure secrets are configured (see above)
2. Take a clear photo of a receipt with visible:
   - Merchant name at top
   - Total amount
   - Date
3. Click "Escanear Ticket"
4. Wait 3-5 seconds for processing
5. Verify auto-populated fields
6. Adjust if needed
7. Click "Guardar"

## Troubleshooting

### Error: "Configuración de GCP incompleta"
**Solution**: Configure the three required secrets using the Supabase CLI commands above

### Error: "No se pudieron extraer datos del ticket"
**Causes**:
- Image too blurry or dark
- Receipt text not visible
- Non-receipt image

**Solution**: Take a clearer photo with better lighting

### Error: "Análisis con baja confianza"
**Causes**:
- Faded receipt
- Partial receipt visible
- Poor image quality

**Solution**: Verify extracted data manually before saving

### API Rate Limits
Document AI has quotas. For production:
- Monitor usage in GCP Console
- Consider caching results
- Implement request throttling if needed

## Benefits Over Gemini

1. **Structured Extraction**: Purpose-built for receipts/invoices
2. **Higher Accuracy**: Trained specifically on expense documents
3. **Enterprise Grade**: Google's production OCR technology
4. **Predictable Format**: Consistent field extraction
5. **Better Date/Money Parsing**: Normalized values for dates and currency

## Next Steps

1. Configure the three GCP secrets
2. Test with 5-10 different receipt types
3. Monitor accuracy and adjust category mappings as needed
4. Consider adding support for multiple currencies if expanding beyond Mexico

## Security Notes

- Service account credentials never exposed to frontend
- JWT authentication ensures only authorized users can call the function
- All sensitive data encrypted in transit
- GCP audit logs track all Document AI requests
