# Domain-Specific Validation System

## Overview

The Chemical Equipment Visualizer now includes lightweight, rule-based validation logic that runs automatically during the data processing pipeline. Validation occurs **after data loading and before visualization**, ensuring data quality without blocking processing.

---

## Validation Rules

### Rule 1: Pressure Exceeds Safe Threshold
- **Threshold**: 300 bar
- **Type**: Warning
- **Condition**: When equipment pressure `> 300 bar`
- **Action**: Equipment flagged with warning message

### Rule 2: Temperature Outside Operating Range
- **Safe Range**: 0°C to 100°C
- **Type**: Warning
- **Condition**: When equipment temperature `< 0°C` or `> 100°C`
- **Action**: Equipment flagged with warning message

---

## Important Disclaimer

⚠️ **These validation thresholds are assumed values for demonstration purposes only.** They do NOT represent industrial safety standards or real operational limits. Real chemical equipment validation should be performed by domain experts and certified engineers with appropriate safety regulations.

---

## Execution Flow

```
1. User uploads CSV file
   ↓
2. Backend reads and parses CSV
   ↓
3. Equipment records extracted
   ↓
4. ➡️ VALIDATION RUNS HERE ⬅️
   ├─ Check each equipment record against validation rules
   ├─ Collect warning messages for violations
   └─ Continue processing regardless of violations
   ↓
5. Statistics calculated
   ↓
6. Data stored in database
   ↓
7. Frontend receives response WITH warnings
   ↓
8. User sees data AND warning notifications
```

---

## Implementation Details

### Backend (`backend/equipment_backend/api/views.py`)

**Validation Function**: `validate_equipment_data(equipment_list)`
- Takes list of equipment dictionaries as input
- Returns list of warning objects with details
- Each warning includes:
  - `type`: Rule identifier (e.g., `'pressure_high'`)
  - `severity`: Always `'warning'` for current rules
  - `message`: Summary message with count of violations
  - `details`: List of specific violations with equipment names

**Integration Points**:
- `upload_csv()`: Validates after parsing CSV, includes warnings in upload response
- `get_summary()`: Re-validates when retrieving saved session data

### Frontend (`desktop-frontend/main.py`)

**Display Methods**:
- `on_upload_success()`: Shows warnings immediately after file upload
- `on_session_loaded()`: Shows warnings when viewing historical data

**User Interaction**:
- Warning dialog displays on violations
- Shows first 2 details per rule + count of remaining violations
- Non-blocking: user can dismiss and continue working
- Status bar updates with warning count

---

## Warning Message Examples

### Pressure Violation
```
⚠️ 3 equipment record(s) with pressure exceeding 300 bar

  • Pump A: 320 bar (exceeds 300 bar threshold)
  • Compressor B: 450 bar (exceeds 300 bar threshold)
  ... and 1 more
```

### Temperature Violation
```
⚠️ 2 equipment record(s) with temperature outside 0-100°C range

  • Furnace X: 250°C (outside 0-100°C range)
  • Cooler Y: -5°C (outside 0-100°C range)
```

---

## Data Processing Guarantees

✅ **Processing continues**: Violations do NOT stop data processing  
✅ **All data included**: Invalid records are still processed and visualized  
✅ **Warnings logged**: All violations recorded and available in API response  
✅ **User informed**: Clear notifications shown in UI with actionable details  
✅ **Non-intrusive**: Warnings are informational, not errors  

---

## Modifying Validation Rules

To adjust validation thresholds, edit these constants in `backend/equipment_backend/api/views.py`:

```python
PRESSURE_SAFE_THRESHOLD = 300  # bar
TEMPERATURE_MIN_SAFE = 0  # Celsius
TEMPERATURE_MAX_SAFE = 100  # Celsius
```

Then redeploy the backend. The frontend automatically receives and displays updated warnings.

---

## Testing Validation

### Test Case 1: High Pressure
Create `test_pressure.csv`:
```csv
Equipment Name,Type,Flowrate,Pressure,Temperature
Pump1,Centrifugal,50,320,25
Pump2,Gear,30,280,22
```
**Expected**: Warning about Pump1 exceeding 300 bar

### Test Case 2: Temperature Out of Range
Create `test_temp.csv`:
```csv
Equipment Name,Type,Flowrate,Pressure,Temperature
Furnace1,Thermal,100,50,250
Cooler1,Cooling,80,40,-10
```
**Expected**: Warnings for both Furnace1 (>100°C) and Cooler1 (<0°C)

### Test Case 3: Mixed Violations
Create `test_mixed.csv`:
```csv
Equipment Name,Type,Flowrate,Pressure,Temperature
Equipment1,Type1,10,350,150
Equipment2,Type2,20,250,50
Equipment3,Type3,30,280,-20
```
**Expected**: Warnings for Equipment1 (pressure) and Equipment3 (temperature)

---

## API Response Structure

When validation warnings are present, the API includes them in the response:

```json
{
  "total_equipment": 3,
  "average_flowrate": 20.0,
  "average_pressure": 293.33,
  "average_temperature": 60.0,
  "equipment": [...],
  "validation_warnings": [
    {
      "type": "pressure_high",
      "severity": "warning",
      "message": "1 equipment record(s) with pressure exceeding 300 bar",
      "details": ["Equipment1: 350 bar (exceeds 300 bar threshold)"]
    },
    {
      "type": "temperature_out_of_range",
      "severity": "warning",
      "message": "1 equipment record(s) with temperature outside 0-100°C range",
      "details": ["Equipment3: -20°C (outside 0-100°C range)"]
    }
  ]
}
```

---

## Future Enhancements

Potential extensions (not implemented):
- ✋ More validation rules (flowrate limits, type-specific constraints)
- ✋ Configurable thresholds per equipment type
- ✋ Severity levels (warning vs. error)
- ✋ Custom rule engine
- ✋ Validation history and trend analysis

---

## Support

For questions about validation logic or to report false positives/negatives, please review:
1. Assumed threshold values in `views.py`
2. Domain-specific requirements for your use case
3. Consider consulting with process engineers for real-world applications
