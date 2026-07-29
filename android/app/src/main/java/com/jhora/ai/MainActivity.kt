package com.jhora.ai

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.jhora.ai.download.AppDownloadManager
import com.jhora.ai.permissions.PermissionHelper
import com.jhora.ai.settings.AppSettings
import com.jhora.ai.update.OtaUpdateManager
import com.jhora.ai.utils.Logger
import com.jhora.ai.utils.NetworkUtils
import com.jhora.ai.webview.AppWebChromeClient
import com.jhora.ai.webview.AppWebViewClient
import com.jhora.ai.webview.WebAppInterface

class MainActivity : AppCompatActivity() {

    companion object {
        const val FILECHOOSER_RESULTCODE = 1002
        private const val DEFAULT_URL = "https://ais-dev-hqixtkxxrplcdrfbw5q33r-443356580754.asia-east1.run.app"
    }

    private lateinit var webView: WebView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var splashScreen: View
    
    // Custom error layouts
    private lateinit var offlineScreen: LinearLayout
    private lateinit var errorScreen: LinearLayout
    private lateinit var crashScreen: LinearLayout
    private lateinit var errorDetailsText: TextView
    private lateinit var crashDetailsText: TextView

    private lateinit var settings: AppSettings
    private lateinit var downloadManager: AppDownloadManager

    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate()
        
        // Setup Uncaught Exception Handler to show custom native crash screen
        setupCrashHandler()

        // Enable Edge-to-Edge display
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        setContentView(R.layout.activity_main)

        // Bind Views
        webView = findViewById(R.id.webview)
        swipeRefresh = findViewById(R.id.swipe_refresh)
        progressBar = findViewById(R.id.progress_bar)
        splashScreen = findViewById(R.id.splash_screen)
        offlineScreen = findViewById(R.id.offline_screen)
        errorScreen = findViewById(R.id.error_screen)
        crashScreen = findViewById(R.id.crash_screen)
        errorDetailsText = findViewById(R.id.error_details)
        crashDetailsText = findViewById(R.id.crash_details)

        // Adjust for Edge-to-Edge system bars padding
        val mainLayout = findViewById<View>(R.id.main_layout)
        ViewCompat.setOnApplyWindowInsetsListener(mainLayout) { view, windowInsets ->
            val insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom)
            windowInsets
        }

        // Initialize Settings and Download Helpers
        settings = AppSettings(this)
        downloadManager = AppDownloadManager(this)

        // Configure Swipe Refresh (Pull to Refresh)
        swipeRefresh.setColorSchemeResources(R.color.accent_blue)
        swipeRefresh.setOnRefreshListener {
            Logger.d("Pull to refresh triggered")
            webView.reload()
        }

        // Ensure pull to refresh only triggers when webview is at top scroll position
        webView.viewTreeObserver.addOnScrollChangedListener {
            swipeRefresh.isEnabled = (webView.scrollY == 0)
        }

        // Initialize WebView
        configureWebView()

        // Handle Deep Linking / Intent URL
        val targetUrl = getStartupUrl()
        Logger.i("Loading startup URL: $targetUrl")

        if (NetworkUtils.isInternetAvailable(this)) {
            webView.loadUrl(targetUrl)
        } else {
            showOfflineScreen(true)
        }

        // Request permissions dynamically
        if (!PermissionHelper.hasPermissions(this)) {
            PermissionHelper.requestPermissions(this)
        }

        // Trigger background OTA check on start
        OtaUpdateManager(this).checkForUpdates(manual = false)

        // Setup Retry Buttons
        findViewById<Button>(R.id.btn_retry_offline).setOnClickListener {
            if (NetworkUtils.isInternetAvailable(this)) {
                showOfflineScreen(false)
                webView.loadUrl(webView.url ?: targetUrl)
            } else {
                Toast.makeText(this, "Still offline. Please check connection.", Toast.LENGTH_SHORT).show()
            }
        }

        findViewById<Button>(R.id.btn_retry_error).setOnClickListener {
            showErrorScreen(false)
            webView.loadUrl(targetUrl)
        }

        findViewById<Button>(R.id.btn_restart_crash).setOnClickListener {
            val intent = packageManager.getLaunchIntentForPackage(packageName)
            intent?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
            finish()
        }
    }

    private fun configureWebView() {
        val webSettings = webView.settings
        
        // Essential capabilities
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT
        
        // Viewport and responsiveness
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true
        webSettings.setSupportZoom(true)
        webSettings.builtInZoomControls = true
        webSettings.displayZoomControls = false

        // File and content access
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.mediaPlaybackRequiresUserGesture = false

        // Hardware acceleration
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        // Geolocation
        webSettings.setGeolocationEnabled(true)

        // Configure custom WebView clients
        webView.webViewClient = AppWebViewClient(this)
        webView.webChromeClient = AppWebChromeClient(this)

        // Register secure JS Bridge
        webView.addJavascriptInterface(WebAppInterface(this), "AndroidShell")

        // Enable cookie syncing across pages
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)
    }

    private fun getStartupUrl(): String {
        // Deep linking check
        val intentData: Uri? = intent.data
        if (intentData != null) {
            Logger.d("Deep link received: $intentData")
            return intentData.toString()
        }
        
        // Fallback to persisted URL or default app URL
        return settings.lastUrl ?: DEFAULT_URL
    }

    private fun setupCrashHandler() {
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Logger.e("Critical app crash!", throwable)
            runOnUiThread {
                showCrashScreen(throwable.localizedMessage ?: "Unknown Fatal Exception")
            }
            // Do not call finish or default handler immediately to keep the crash view visible
        }
    }

    fun showProgressBar(show: Boolean) {
        progressBar.visibility = if (show) View.VISIBLE else View.GONE
    }

    fun updateProgress(progress: Int) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            progressBar.setProgress(progress, true)
        } else {
            progressBar.progress = progress
        }
        if (progress >= 100) {
            swipeRefresh.isRefreshing = false
        }
    }

    fun hideSplashScreen() {
        if (splashScreen.visibility == View.VISIBLE) {
            splashScreen.animate()
                .alpha(0f)
                .setDuration(400)
                .withEndAction { splashScreen.visibility = View.GONE }
                .start()
        }
    }

    fun showOfflineScreen(show: Boolean) {
        offlineScreen.visibility = if (show) View.VISIBLE else View.GONE
        if (show) {
            webView.visibility = View.GONE
            hideSplashScreen()
        } else {
            webView.visibility = View.VISIBLE
        }
    }

    fun showErrorScreen(show: Boolean, details: String = "") {
        errorScreen.visibility = if (show) View.VISIBLE else View.GONE
        if (show) {
            errorDetailsText.text = details
            webView.visibility = View.GONE
            hideSplashScreen()
        } else {
            webView.visibility = View.VISIBLE
        }
    }

    private fun showCrashScreen(details: String) {
        crashScreen.visibility = View.VISIBLE
        crashDetailsText.text = "Error Stack:\n$details"
        webView.visibility = View.GONE
        swipeRefresh.visibility = View.GONE
        progressBar.visibility = View.GONE
        splashScreen.visibility = View.GONE
        offlineScreen.visibility = View.GONE
        errorScreen.visibility = View.GONE
    }

    fun saveLastUrl(url: String) {
        settings.lastUrl = url
    }

    fun saveUserLoginState(loggedIn: Boolean) {
        settings.isUserLoggedIn = loggedIn
    }

    fun setUploadMessageCallback(callback: ValueCallback<Array<Uri>>?) {
        filePathCallback = callback
    }

    // Handles back button navigation safely (navigates page history instead of quitting)
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            Logger.d("Back button pressed, navigating back in WebView history")
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    // Handle results from Camera photo capture or Document file chooser selection
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (filePathCallback == null) return
            val results: Array<Uri>? = when {
                resultCode == RESULT_OK -> {
                    if (data == null || data.data == null) {
                        // Camera capture path
                        val cameraPhotoPath = data?.getStringExtra("PhotoPath")
                        if (cameraPhotoPath != null) {
                            arrayOf(Uri.parse(cameraPhotoPath))
                        } else {
                            null
                        }
                    } else {
                        // File picker single/multiple path
                        val dataString = data.dataString
                        if (dataString != null) {
                            arrayOf(Uri.parse(dataString))
                        } else {
                            null
                        }
                    }
                }
                else -> null
            }
            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        } else {
            super.onActivityResult(requestCode, resultCode, data)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PermissionHelper.REQUEST_CODE_CAMERA_LOCATION) {
            val allGranted = grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            if (allGranted) {
                Logger.d("All requested permissions granted by user")
            } else {
                Toast.makeText(this, "Some features (like location-based charts or taking photos) require permissions to function.", Toast.LENGTH_LONG).show()
            }
        }
    }
}
