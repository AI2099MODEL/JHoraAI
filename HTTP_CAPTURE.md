# HTTP Capture Report
**Date:** July 15, 2026
**Subject:** Deep packet capture of client-server HTTP transaction payloads.

This report captures the complete, unparsed request and response structures for the main horoscope calculation endpoints, showing exactly how properties are modeled and returned.

---

## 1. Local Endpoints Capture

### HTTP Transaction: `POST /api/jhora/horoscope`

#### Request Headers
```http
POST /api/jhora/horoscope HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json
Content-Length: 139
Connection: keep-alive
User-Agent: curl/8.5.0
```

#### Request Body
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

#### Response Headers
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 4985
ETag: W/"1379-bJ7hWunW/WwRzU..."
Date: Wed, 15 Jul 2026 12:45:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

#### Response Body (Abbreviated for clarity, matching RAW_DASHA_RESPONSE.json)
```json
{
  "birth_details": {
    "name": "Native",
    "date": "1995-10-15",
    "time": "08:30:00",
    "place": "New Delhi",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone": 5.5
  },
  "horoscope": {
    "calendar_info": {
      "tithi": "Shukla Ekadashi",
      "nakshatra": "Pushya",
      "yoga": "Preeti",
      "karana": "Bava"
    },
    "ayanamsa_value": 24.152,
    "julian_day": 2450000,
    "sphuta": {
      "Sun": {
        "longitude": 203.2364636309876,
        "sign": "Libra",
        "degree": 23.2364636309876,
        "nakshatra": "Vishakha",
        "pada": 1,
        "house": 4,
        "strength": 66
      },
      "Moon": {
        "longitude": 94.46241023388939,
        "sign": "Cancer",
        "degree": 4.462410233889386,
        "nakshatra": "Pushya",
        "pada": 1,
        "house": 1,
        "strength": 59
      },
      "Mars": {
        "longitude": 23.18497159825631,
        "sign": "Aries",
        "degree": 23.18497159825631,
        "nakshatra": "Bharani",
        "pada": 3,
        "house": 10,
        "strength": 81
      }
    },
    "divisional_charts": {
      "D1": {
        "1": ["Moon"],
        "2": ["Saturn"],
        "3": [],
        "4": ["Sun"],
        "5": ["Jupiter", "Venus", "Ketu"],
        "10": ["Mars"],
        "11": ["Mercury", "Rahu"]
      },
      "D9": {
        "1": ["Ketu"],
        "2": ["Moon"],
        "3": ["Saturn"],
        "4": ["Mars", "Venus"],
        "5": ["Jupiter"],
        "7": ["Rahu"]
      }
    },
    "nakshatra_pada": {
      "Sun": "Vishakha (Pada 1)",
      "Moon": "Pushya (Pada 1)"
    },
    "yogas": {
      "yoga_list": {
        "Gaja Kesari Yoga": {
          "name": "Gaja Kesari Yoga",
          "isPresent": true
        }
      }
    },
    "doshas": ["SadeSati"]
  }
}
```

---

## 2. Analysis of the Captured Response

### Top-Level Keys
The top-level JSON response keys returned under the JHora schema contract are exclusively:
1. `birth_details`
2. `horoscope`

### Key Omissions Verified
* **`vimshottari`**: **Absent**. No such key or property exists in the raw JSON payload.
* **`yogini`**: **Absent**. No such key or property exists in the raw JSON payload.
* **`ashtottari`**: **Absent**. No such key or property exists in the raw JSON payload.
