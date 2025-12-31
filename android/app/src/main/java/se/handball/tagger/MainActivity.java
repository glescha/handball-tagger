package se.handball.tagger;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Enable WebView debugging (safe for debug builds; remove if you prefer)
    WebView.setWebContentsDebuggingEnabled(true);
  }
}
