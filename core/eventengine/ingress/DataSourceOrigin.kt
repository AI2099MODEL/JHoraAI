package core.eventengine.ingress

enum class DataSourceOrigin {
    EMBEDDED_SWISS_EPHEMERIS,
    BACKUP_SWISS_EPHEMERIS_API,
    NASA_HORIZONS_VALIDATION,
    MOCK_STUB
}
