# JHora AI Professional — Request Log

This log documents the complete HTTP request sent to the official PyJHora FastAPI microservice to validate the astrological calculations and panchanga data.

---

## 1. Request Details

*   **URL:** `https://jagannatha-hora-359167915530.europe-west1.run.app/horoscope`
*   **Method:** `POST`
*   **Headers:**
    ```http
    Host: jagannatha-hora-359167915530.europe-west1.run.app
    Content-Type: application/json
    Accept: application/json
    User-Agent: JHoraAI_Professional_WebProxy/1.0
    ```

---

## 2. Request Body (JSON Payload)

```json
{
  "date": "1995-10-15",
  "time": "08:30:00",
  "place": "New Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timezone": 5.5
}
```

---

## 3. Parameter Verification

| Field | Value | Type | Status | Context |
| :--- | :--- | :---: | :---: | :--- |
| `date` | `"1995-10-15"` | String | ✅ VALID | ISO 8601 YYYY-MM-DD representing birth date. |
| `time` | `"08:30:00"` | String | ✅ VALID | HH:MM:SS format representing standard local birth time. |
| `place` | `"New Delhi"` | String | ✅ VALID | Descriptive birth location string. |
| `latitude` | `28.6139` | Double | ✅ VALID | Precision coordinates for New Delhi, India. |
| `longitude` | `77.2090` | Double | ✅ VALID | Precision coordinates for New Delhi, India. |
| `timezone` | `5.5` | Double | ✅ VALID | Indian Standard Time (IST) offset relative to UTC (+5.5 hours). |
