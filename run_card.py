#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Binance & Trojan PnL Cool Card - Desktop Native Floating Widget
Features:
- Solid dark theme with zero white borders (background_color="#0a0d14", transparent=False)
- High contrast, crisp readable toolbar
- 100% Resizable window (WS_THICKFRAME native borders + API resize + maximize button)
- Permanent API Key & Secret Persistence (binance_config.json + persistent WebView2 storage)
- Custom Image Upload & drag-and-drop
- Always-on-Top toggle
"""

import os
import sys
import json
import time
import threading
import ctypes
import webview

APP_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(APP_DIR, "binance_config.json")
STORAGE_DIR = os.path.join(APP_DIR, ".webview_storage")

if not os.path.exists(STORAGE_DIR):
    try:
        os.makedirs(STORAGE_DIR, exist_ok=True)
    except Exception:
        pass

class WindowApi:
    def __init__(self, window):
        self.window = window
        self.is_on_top = True
        self.is_maximized = False

    def close(self):
        self.window.destroy()

    def minimize(self):
        self.window.minimize()

    def toggle_maximize(self):
        try:
            if self.is_maximized:
                self.window.restore()
                self.is_maximized = False
            else:
                self.window.maximize()
                self.is_maximized = True
            return self.is_maximized
        except Exception:
            return False

    def toggle_pin(self, on_top_state):
        self.is_on_top = bool(on_top_state)
        self.window.on_top = self.is_on_top

    def set_size(self, width, height):
        try:
            self.window.resize(int(width), int(height))
            return True
        except Exception as e:
            print("Resize error:", e)
            return False

    def get_size(self):
        try:
            return {"width": self.window.width, "height": self.window.height}
        except Exception:
            return {"width": 740, "height": 530}

    def save_keys(self, api_key, secret_key, custom_image=""):
        try:
            cfg = {}
            if os.path.exists(CONFIG_FILE):
                try:
                    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                        cfg = json.load(f)
                except Exception:
                    pass
            cfg["api_key"] = api_key.strip()
            cfg["secret_key"] = secret_key.strip()
            if custom_image:
                cfg["custom_image"] = custom_image
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(cfg, f, indent=4)
            return True
        except Exception as e:
            print("Error saving config:", e)
            return False

    def load_keys(self):
        try:
            if os.path.exists(CONFIG_FILE):
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print("Error loading config:", e)
        return {"api_key": "", "secret_key": "", "custom_image": ""}

def enable_native_resize():
    """Adds WS_THICKFRAME to allow Windows to resize borders via mouse dragging."""
    if os.name != 'nt':
        return
    time.sleep(0.7)
    try:
        user32 = ctypes.windll.user32
        hwnd = user32.FindWindowW(None, "PnL Cool Card")
        if hwnd:
            GWL_STYLE = -16
            WS_THICKFRAME = 0x00040000
            SWP_FRAMECHANGED = 0x0020
            SWP_NOMOVE = 0x0002
            SWP_NOSIZE = 0x0001
            SWP_NOZORDER = 0x0004
            
            style = user32.GetWindowLongW(hwnd, GWL_STYLE)
            user32.SetWindowLongW(hwnd, GWL_STYLE, style | WS_THICKFRAME)
            user32.SetWindowPos(hwnd, 0, 0, 0, 0, 0, SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER)
    except Exception as e:
        print("Could not attach native resize border:", e)

def main():
    html_file = os.path.join(APP_DIR, "desktop_card.html")
    
    # Create the floating desktop widget window (solid dark background, NO transparency artifacts)
    window = webview.create_window(
        title="PnL Cool Card",
        url=f"file:///{html_file.replace('\\', '/')}",
        width=740,
        height=530,
        min_size=(460, 320),
        resizable=True,
        frameless=True,
        easy_drag=True,
        on_top=True,
        transparent=False,
        background_color="#0a0d14"
    )

    api = WindowApi(window)
    window.expose(
        api.close,
        api.minimize,
        api.toggle_maximize,
        api.toggle_pin,
        api.set_size,
        api.get_size,
        api.save_keys,
        api.load_keys
    )

    # Enable native Windows edge resizing in background thread
    threading.Thread(target=enable_native_resize, daemon=True).start()

    # Start native WebView2 with persistent storage and NO private mode
    webview.start(
        private_mode=False,
        storage_path=STORAGE_DIR,
        debug=False
    )

if __name__ == "__main__":
    main()
