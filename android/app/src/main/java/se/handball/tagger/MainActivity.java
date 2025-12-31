package se.handball.tagger;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {}

import android.os.Bundle;
import android.webkit.WebView;

@Override
protected void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  WebView.setWebContentsDebuggingEnabled(true);
}
