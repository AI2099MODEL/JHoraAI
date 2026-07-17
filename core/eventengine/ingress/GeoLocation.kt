package core.eventengine.ingress

data class GeoLocation(
    val placeName: String,
    val district: String?,
    val state: String?,
    val country: String,
    val latitude: Double,
    val longitude: Double,
    val altitude: Double,
    val timezoneId: String,
    val utcOffsetMinutes: Int,
    val locationSource: LocationSource
) {
    init {
        require(latitude in -90.0..90.0) { "Latitude must be between -90 and 90 degrees." }
        require(longitude in -180.0..180.0) { "Longitude must be between -180 and 180 degrees." }
        require(altitude >= -450.0) { "Altitude must be realistic (minimum valid altitude is ~ -418m at the Dead Sea)." }
    }
}
