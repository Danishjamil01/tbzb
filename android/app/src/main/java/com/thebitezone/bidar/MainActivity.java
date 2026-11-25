package com.thebitezone.bidar;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(EdgeStatusBarPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
