package core.eventengine.ingress

interface LocationProvider {
    fun getCurrentLocation(): GeoLocation
}

class StubLocationProvider(private val stubLocation: GeoLocation) : LocationProvider {
    override fun getCurrentLocation(): GeoLocation = stubLocation
}

class BrowserLocationProvider : LocationProvider {
    override fun getCurrentLocation(): GeoLocation {
        return GeoLocation(
            placeName = "Greenwich Observatory",
            district = "London",
            state = "London",
            country = "United Kingdom",
            latitude = 51.4778,
            longitude = 0.0,
            altitude = 48.0,
            timezoneId = "Europe/London",
            utcOffsetMinutes = 0,
            locationSource = LocationSource.GEOCODED_ADDRESS
        )
    }
}

class DesktopLocationProvider : LocationProvider {
    override fun getCurrentLocation(): GeoLocation {
        return GeoLocation(
            placeName = "New York City",
            district = "Manhattan",
            state = "NY",
            country = "United States",
            latitude = 40.7128,
            longitude = -74.0060,
            altitude = 10.0,
            timezoneId = "America/New_York",
            utcOffsetMinutes = -300,
            locationSource = LocationSource.GEOCODED_ADDRESS
        )
    }
}

class GpsLocationProvider(
    private val latitude: Double,
    private val longitude: Double,
    private val altitude: Double = 0.0
) : LocationProvider {
    override fun getCurrentLocation(): GeoLocation {
        return GeoLocation(
            placeName = "GPS Current Coordinates",
            district = null,
            state = null,
            country = "Global GPS",
            latitude = latitude,
            longitude = longitude,
            altitude = altitude,
            timezoneId = "UTC",
            utcOffsetMinutes = 0,
            locationSource = LocationSource.GPS_CURRENT
        )
    }
}
