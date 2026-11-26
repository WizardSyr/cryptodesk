#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Binance & Trojan PnL Cool Card - Desktop Native Floating Widget
Features:
- Window Resizing (resizable=True, fluid scaling)
- Permanent API Key & Secret Persistence (private_mode=False, disk storage in binance_config.json)
- Custom Image Upload & drag-and-drop
- Always-on-Top toggle
"""

import os
import sys
import json
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

    def close(self):
        self.window.destroy()

    def minimize(self):
        self.window.minimize()

    def toggle_pin(self, on_top_state):
        self.is_on_top = bool(on_top_state)
        self.window.on_top = self.is_on_top

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

def main():
    html_file = os.path.join(APP_DIR, "desktop_card.html")
    
    # Create the floating desktop widget window (fully resizable)
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
        transparent=True,
        background_color="#0a0d14"
    )

    api = WindowApi(window)
    window.expose(api.close, api.minimize, api.toggle_pin, api.save_keys, api.load_keys)

    # Start native WebView2 with persistent storage and NO private mode
    webview.start(
        private_mode=False,
        storage_path=STORAGE_DIR,
        debug=False
    )

if __name__ == "__main__":
    main()
