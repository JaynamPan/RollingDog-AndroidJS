package meow.softer.rollingdog.ui

import android.annotation.SuppressLint
import android.media.MediaPlayer
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import meow.softer.rollingdog.R
import meow.softer.rollingdog.common.hideSystemBars

class GameActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var mediaPlayer: MediaPlayer

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        hideSystemBars(window)
        setContentView(R.layout.activity_game)

        webView = this.findViewById(R.id.webview)
        webView.webViewClient = WebViewClient()

        //load the webpage
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        webView.loadUrl("file:///android_asset/index.html")
        playBgMusic()

    }

    private fun playBgMusic() {
        mediaPlayer = MediaPlayer.create(this, R.raw.bg)
        mediaPlayer.isLooping = true
        mediaPlayer.setVolume(0.7f, 0.7f)
        mediaPlayer.start()
    }

    override fun onRestart() {
        super.onRestart()
        mediaPlayer.start()
    }

    override fun onStop() {
        super.onStop()
        mediaPlayer.pause()
    }

    override fun onDestroy() {
        super.onDestroy()
        mediaPlayer.release()
    }
}