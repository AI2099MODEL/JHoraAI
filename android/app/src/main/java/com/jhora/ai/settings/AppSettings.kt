package com.jhora.ai.settings

import android.content.Context
import android.content.SharedPreferences

class AppSettings(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("jhora_ai_settings", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_LAST_URL = "last_url"
        private const val KEY_USER_LOGGED_IN = "user_logged_in"
        private const val KEY_DARK_MODE = "dark_mode"
        private const val KEY_SESSION_COOKIE = "session_cookie"
    }

    var lastUrl: String?
        get() = prefs.getString(KEY_LAST_URL, null)
        set(value) = prefs.edit().putString(KEY_LAST_URL, value).apply()

    var isUserLoggedIn: Boolean
        get() = prefs.getBoolean(KEY_USER_LOGGED_IN, false)
        set(value) = prefs.edit().putBoolean(KEY_USER_LOGGED_IN, value).apply()

    var isDarkMode: Boolean
        get() = prefs.getBoolean(KEY_DARK_MODE, false)
        set(value) = prefs.edit().putBoolean(KEY_DARK_MODE, value).apply()

    var sessionCookie: String?
        get() = prefs.getString(KEY_SESSION_COOKIE, null)
        set(value) = prefs.edit().putString(KEY_SESSION_COOKIE, value).apply()

    fun clear() {
        prefs.edit().clear().apply()
    }
}
