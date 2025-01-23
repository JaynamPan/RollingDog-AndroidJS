package meow.softer.rollingdog.init

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import meow.softer.rollingdog.R
import meow.softer.rollingdog.common.hideSystemBars
import meow.softer.rollingdog.ui.GameActivity
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class InitActivity : AppCompatActivity() {
    private val initTime: Long = 1800
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        hideSystemBars(window)
        setContentView(R.layout.activity_init)
        loadGame()
    }

    @OptIn(DelicateCoroutinesApi::class)
    private fun loadGame() {
        GlobalScope.launch {
            delay(initTime)
            withContext(Dispatchers.Main) {
                startActivity(Intent(this@InitActivity, GameActivity::class.java))
                finish()
            }
        }
    }

}