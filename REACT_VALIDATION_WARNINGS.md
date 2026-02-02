# React Frontend - Validation Warnings Display

## Overview
The React web frontend now displays validation warnings received from the backend API when users upload CSV files or load historical data.

---

## Changes Made

### 1. **Dashboard.jsx** - Warning State Management
**File**: [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)

**Added**:
- `warnings` state to track validation warnings
- Logic in `handleUpload()` to extract `validation_warnings` from API response
- Alert dialog showing validation warning details to user
- Pass `warnings` prop to `SummaryCards` component

**Code**:
```javascript
const [warnings, setWarnings] = useState([]);

async function handleUpload(file) {
  // ... existing upload logic ...
  
  // Extract and store validation warnings
  const validationWarnings = data.validation_warnings || [];
  setWarnings(validationWarnings);
  
  // Show alert if warnings exist
  if (validationWarnings && validationWarnings.length > 0) {
    let warningText = "⚠️ Data Validation Warnings:\n\n";
    validationWarnings.forEach(warning => {
      warningText += `${warning.message}\n`;
      warning.details.slice(0, 2).forEach(detail => {
        warningText += `  • ${detail}\n`;
      });
      if (warning.details.length > 2) {
        warningText += `  ... and ${warning.details.length - 2} more\n`;
      }
      warningText += "\n";
    });
    alert(warningText);
  }
}
```

### 2. **SummaryCards.jsx** - Warning Badge Display
**File**: [frontend/src/components/SummaryCards.jsx](frontend/src/components/SummaryCards.jsx)

**Added**:
- `warnings` prop to receive warnings from parent component
- `getWarningForCard()` function to match warnings to relevant cards
  - Pressure warnings displayed on "Avg Pressure" card
  - Temperature warnings displayed on "Avg Temperature" card
- Warning badge with amber styling and alert icon
- Ring styling on affected cards to visually highlight warnings

**Warning Badge Display**:
```jsx
{cardWarning && (
  <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" 
       style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
    <AlertTriangle className="w-3 h-3 text-amber-400" />
    <span className="text-xs text-amber-300">{cardWarning.message}</span>
  </div>
)}
```

---

## User Experience Flow

### Step 1: Upload CSV
```
User uploads CSV
    ↓
Frontend calls uploadCSV() → Backend processes
    ↓
Backend returns: {
  total_equipment: 3,
  average_pressure: 320,
  validation_warnings: [
    {
      type: 'pressure_high',
      message: '1 equipment record(s) with pressure exceeding 300 bar',
      details: ['Pump A: 320 bar (exceeds 300 bar threshold)']
    }
  ]
}
    ↓
Frontend receives warnings and shows alert
```

### Step 2: Alert Display
User sees popup alert:
```
⚠️ Data Validation Warnings:

1 equipment record(s) with pressure exceeding 300 bar
  • Pump A: 320 bar (exceeds 300 bar threshold)

Data processing will continue. Review details in the equipment table.
```

### Step 3: Summary Card Display
After dismissing alert, user sees:
- "Avg Pressure" card has amber ring border (highlights affected metric)
- Small warning badge below pressure value showing: "1 equipment record(s) with pressure exceeding 300 bar"

---

## Visual Examples

### Normal Card (No Warnings)
```
┌─────────────────────────┐
│ Avg Pressure            │
│ 280 bar                 │
│ ✓ +2.5% vs last upload  │
└─────────────────────────┘
```

### Card with Warning
```
┌─────────────────────────┐  ← Amber ring
│ Avg Pressure            │
│ 320 bar                 │
│ ✓ +2.5% vs last upload  │
│ ⚠️ 1 equipment record... │  ← Warning badge
└─────────────────────────┘
```

---

## Features

✅ **Real-time Warning Display**: Warnings shown immediately after upload  
✅ **Context-Aware Badges**: Warnings attached to relevant metric cards  
✅ **Non-Blocking**: User can dismiss alert and continue using app  
✅ **Visual Highlighting**: Amber ring indicates affected cards  
✅ **Detailed Information**: First 2 examples shown + count of remaining  
✅ **Responsive Design**: Works on desktop and mobile  

---

## Files Modified

1. **[frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)**
   - Added warnings state and extraction logic
   - Added alert display for warnings

2. **[frontend/src/components/SummaryCards.jsx](frontend/src/components/SummaryCards.jsx)**
   - Added warnings prop
   - Added warning badge UI
   - Added amber ring styling for affected cards

---

## Testing

### Test Case 1: Pressure Warning
1. Upload CSV with `Pump: pressure=350 bar`
2. **Expected**: Alert shows pressure warning
3. **Expected**: "Avg Pressure" card has amber ring + warning badge

### Test Case 2: Temperature Warning  
1. Upload CSV with `Furnace: temperature=250°C`
2. **Expected**: Alert shows temperature warning
3. **Expected**: "Avg Temperature" card has amber ring + warning badge

### Test Case 3: Multiple Warnings
1. Upload CSV with both high pressure AND out-of-range temperature
2. **Expected**: Alert shows both warnings
3. **Expected**: Both "Avg Pressure" and "Avg Temperature" cards highlighted

### Test Case 4: No Warnings
1. Upload CSV with normal values (pressure 250 bar, temp 50°C)
2. **Expected**: No alert appears
3. **Expected**: No warning badges on cards

---

## Integration Points

- **Backend** → Returns `validation_warnings` array in API response
- **Frontend Service** → [frontend/src/services/api.js](frontend/src/services/api.js) already parses response
- **Dashboard** → Receives warnings from API and manages state
- **SummaryCards** → Displays warnings visually on relevant cards
- **UI/UX** → User sees warnings inline with data, not as separate screen

---

## Future Enhancements

- ✋ Warning history/persistence across sessions
- ✋ Dismissible badges that can be re-displayed
- ✋ Export warnings to PDF report
- ✋ Warning severity levels (warning vs. critical)
- ✋ Filter/search equipment by warnings
