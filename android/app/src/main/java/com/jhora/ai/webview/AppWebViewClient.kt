package com.jhora.ai.webview

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.CookieManager
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import com.jhora.ai.MainActivity
import com.jhora.ai.utils.Logger
import com.jhora.ai.utils.NetworkUtils

class AppWebViewClient(private val activity: MainActivity) : WebViewClient() {

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url ?: return false
        val urlString = url.toString()

        Logger.d("shouldOverrideUrlLoading: $urlString")

        // Handle Deep links or external protocols
        if (urlString.startsWith("tel:") || urlString.startsWith("mailto:") || urlString.startsWith("sms:")) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, url)
                activity.startActivity(intent)
                return true
            } catch (e: Exception) {
                Logger.e("Failed to handle external intent: $urlString", e)
            }
        }

        // Handle social apps redirects (WhatsApp, Telegram, etc.)
        if (urlString.contains("whatsapp.com") || urlString.contains("t.me") || urlString.contains("telegram.me")) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, url)
                activity.startActivity(intent)
                return true
            } catch (e: Exception) {
                Logger.e("Failed to open WhatsApp/Telegram", e)
            }
        }

        // External browser redirect for non-app domains
        val host = url.host
        if (host != null && !host.contains("ais-dev-hqixtkxxrplcdrfbw5q33r-443356580754.asia-east1.run.app") && 
            !host.contains("ais-pre-hqixtkxxrplcdrfbw5q33r-443356580754.asia-east1.run.app") &&
            !host.contains("localhost") && !host.contains("127.0.0.1") && !host.contains("google.com")) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, url)
                activity.startActivity(intent)
                return true
            } catch (e: Exception) {
                Logger.e("Failed to launch external browser", e)
            }
        }

        return false
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        Logger.d("onPageStarted: $url")
        activity.showProgressBar(true)

        // Sync session cookies
        CookieManager.getInstance().flush()
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        Logger.d("onPageFinished: $url")
        activity.showProgressBar(false)
        activity.hideSplashScreen()
        activity.showErrorScreen(false)
        activity.showOfflineScreen(false)

        if (url != null) {
            activity.saveLastUrl(url)
        }

        // Ensure CookieManager persists session
        CookieManager.getInstance().flush()
    }

    override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
        super.onReceivedError(view, request, error)
        
        // Only trigger error/offline screens for main frame requests
        if (request?.isForMainFrame == true) {
            val description = error?.description?.toString() ?: "Unknown error"
            Logger.e("onReceivedError: $description for URL: ${request.url}")

            activity.showProgressBar(false)
            activity.hideSplashScreen()

            if (!NetworkUtils.isInternetAvailable(activity)) {
                activity.showOfflineScreen(true)
            } else {
                activity.showErrorScreen(true, description)
            }
        }
    }
}
