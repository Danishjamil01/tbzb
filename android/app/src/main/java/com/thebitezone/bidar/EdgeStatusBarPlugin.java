package com.thebitezone.bidar;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.view.View;
import android.view.Window;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.util.WebColor;
import java.util.Locale;

/**
 * Ensures edge-to-edge status bar tinting works reliably across Android 14, 15, and 16
 * (including devices with older System WebViews where CSS safe-area passthrough is disabled).
 */
@CapacitorPlugin(name = "EdgeStatusBar")
public class EdgeStatusBarPlugin extends Plugin {

    private int currentColor = Color.WHITE;
    private StatusBarBackdropDrawable backdropDrawable;

    @PluginMethod
    public void setBar(final PluginCall call) {
        final String colorHex = call.getString("color");
        final boolean isLight = Boolean.TRUE.equals(call.getBoolean("isLight", false));

        if (colorHex == null || colorHex.isEmpty()) {
            call.reject("Color must be provided");
            return;
        }

        final int parsedColor;
        try {
            parsedColor = WebColor.parseColor(colorHex.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            call.reject("Invalid hex color: " + colorHex);
            return;
        }

        getBridge().executeOnMainThread(() -> {
            if (getActivity() == null) {
                call.resolve();
                return;
            }

            currentColor = parsedColor;
            Window window = getActivity().getWindow();
            View decorView = window.getDecorView();

            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);
            if (controller != null) {
                controller.setAppearanceLightStatusBars(isLight);
            }

            if (backdropDrawable == null) {
                backdropDrawable = new StatusBarBackdropDrawable(decorView);
            }
            backdropDrawable.setStatusBarColor(currentColor);

            if (decorView.getBackground() != backdropDrawable) {
                decorView.setBackground(backdropDrawable);
            } else {
                decorView.invalidate();
            }

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                setLegacyStatusBarColor(window, currentColor);
            }

            call.resolve();
        });
    }

    @SuppressWarnings("deprecation")
    private void setLegacyStatusBarColor(Window window, int color) {
        window.setStatusBarColor(color);
    }

    private static final class StatusBarBackdropDrawable extends Drawable {

        private final View decorView;
        private final Paint statusPaint = new Paint();
        private final Paint basePaint = new Paint();

        StatusBarBackdropDrawable(View decorView) {
            this.decorView = decorView;
            this.statusPaint.setColor(Color.WHITE);
            this.basePaint.setColor(Color.WHITE);
        }

        void setStatusBarColor(int color) {
            this.statusPaint.setColor(color);
            invalidateSelf();
        }

        @Override
        public void draw(@NonNull Canvas canvas) {
            Rect bounds = getBounds();
            canvas.drawRect(bounds, basePaint);

            int topInset = 0;
            WindowInsetsCompat rootInsets = ViewCompat.getRootWindowInsets(decorView);
            if (rootInsets != null) {
                Insets bars = rootInsets.getInsets(
                    WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout()
                );
                topInset = bars.top;
            }

            if (topInset <= 0) {
                topInset = decorView.getPaddingTop();
            }

            if (topInset > 0) {
                canvas.drawRect(0, 0, bounds.width(), topInset, statusPaint);
            }
        }

        @Override
        public void setAlpha(int alpha) {
            statusPaint.setAlpha(alpha);
            basePaint.setAlpha(alpha);
        }

        @Override
        public void setColorFilter(@Nullable ColorFilter colorFilter) {
            statusPaint.setColorFilter(colorFilter);
            basePaint.setColorFilter(colorFilter);
        }

        @Override
        @SuppressWarnings("deprecation")
        public int getOpacity() {
            return PixelFormat.OPAQUE;
        }
    }
}
