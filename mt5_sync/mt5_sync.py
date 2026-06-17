"""
MT5 Sync Script - Runs on Windows alongside MetaTrader 5.
Automatically syncs trading data to the cloud dashboard.

Usage:
  1. Install: pip install MetaTrader5 requests
  2. Configure: Edit DASHBOARD_URL below
  3. Run: python mt5_sync.py
"""

import MetaTrader5 as mt5
import requests
import time
import json
from datetime import datetime, timedelta

# === CONFIGURATION ===
DASHBOARD_URL = "http://localhost:8000"  # Change to your dashboard URL
SYNC_INTERVAL = 60  # seconds between syncs
HISTORY_DAYS = 30    # how many days of history to sync


def connect_mt5():
    if not mt5.initialize():
        print(f"MT5 initialization failed: {mt5.last_error()}")
        return False
    print("Connected to MT5")
    return True


def get_account_info():
    info = mt5.account_info()
    if not info:
        return None
    return {
        "balance": info.balance,
        "equity": info.equity,
        "margin": info.margin,
        "free_margin": info.margin_free,
        "margin_level": info.margin_level,
        "profit": info.profit,
        "leverage": info.leverage,
        "currency": info.currency,
        "server": info.server,
        "login": info.login,
    }


def get_positions():
    positions = mt5.positions_get()
    if positions is None:
        return []
    result = []
    for pos in positions:
        result.append({
            "ticket": pos.ticket,
            "symbol": pos.symbol,
            "type": pos.type,
            "volume": pos.volume,
            "price_open": pos.price_open,
            "sl": pos.sl,
            "tp": pos.tp,
            "profit": pos.profit,
            "swap": pos.swap,
            "commission": pos.comment if hasattr(pos, "commission") else 0,
            "time": int(pos.time),
        })
    return result


def get_history():
    date_from = datetime.now() - timedelta(days=HISTORY_DAYS)
    date_to = datetime.now()
    deals = mt5.history_deals_get(date_from, date_to)
    if deals is None:
        return []
    result = []
    for deal in deals:
        if deal.entry == 0:
            continue
        result.append({
            "ticket": deal.ticket,
            "symbol": deal.symbol,
            "type": deal.type,
            "volume": deal.volume,
            "price": deal.price,
            "profit": deal.profit,
            "swap": deal.swap,
            "commission": deal.commission,
            "time": int(deal.time),
            "time_setup": int(deal.time) if hasattr(deal, "time_setup") else int(deal.time),
        })
    return result


def sync_to_dashboard(account_info, positions, history):
    data = {
        "account_info": account_info,
        "positions": positions,
        "history": history,
    }
    try:
        resp = requests.post(
            f"{DASHBOARD_URL}/api/mt5/sync",
            json=data,
            timeout=30,
        )
        if resp.status_code == 200:
            result = resp.json()
            print(f"Sync OK: {result['synced_trades']} new, {result['updated_trades']} updated, balance: ${result['account_balance']:.2f}")
        else:
            print(f"Sync failed: {resp.status_code} - {resp.text}")
    except requests.exceptions.RequestException as e:
        print(f"Connection error: {e}")


def main():
    print("=== MT5 Dashboard Sync ===")
    print(f"Dashboard: {DASHBOARD_URL}")
    print(f"Interval: {SYNC_INTERVAL}s")
    print()

    if not connect_mt5():
        return

    while True:
        try:
            account = get_account_info()
            if account:
                positions = get_positions()
                history = get_history()
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Syncing: {len(positions)} positions, {len(history)} history deals")
                sync_to_dashboard(account, positions, history)
            else:
                print("Could not get account info, retrying...")
        except Exception as e:
            print(f"Error: {e}")

        time.sleep(SYNC_INTERVAL)


if __name__ == "__main__":
    main()
