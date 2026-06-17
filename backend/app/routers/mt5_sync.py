from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Trade, AccountInfo
from app.schemas import MT5SyncData

router = APIRouter(prefix="/api/mt5", tags=["mt5-sync"])


@router.post("/sync")
def sync_mt5_data(data: MT5SyncData, db: Session = Depends(get_db)):
    synced_trades = 0
    updated_trades = 0

    acct = data.account_info
    account = AccountInfo(
        balance=acct.get("balance", 0),
        equity=acct.get("equity", 0),
        margin=acct.get("margin", 0),
        free_margin=acct.get("free_margin", 0),
        margin_level=acct.get("margin_level"),
        profit=acct.get("profit", 0),
        leverage=str(acct.get("leverage", "")),
        currency=acct.get("currency", "USD"),
        server=acct.get("server", ""),
        login=str(acct.get("login", "")),
    )
    db.add(account)

    for pos in data.positions:
        ticket = str(pos.get("ticket", ""))
        existing = db.query(Trade).filter(Trade.ticket == ticket).first()
        if existing:
            existing.profit = pos.get("profit", 0)
            existing.volume = pos.get("volume", existing.volume)
            existing.stop_loss = pos.get("sl", existing.stop_loss)
            existing.take_profit = pos.get("tp", existing.take_profit)
            updated_trades += 1
        else:
            trade = Trade(
                ticket=ticket,
                symbol=pos.get("symbol", ""),
                direction="BUY" if pos.get("type", 0) == 0 else "SELL",
                volume=pos.get("volume", 0),
                entry_price=pos.get("price_open", 0),
                stop_loss=pos.get("sl"),
                take_profit=pos.get("tp"),
                profit=pos.get("profit", 0),
                swap=pos.get("swap", 0),
                commission=pos.get("commission", 0),
                status="OPEN",
                open_time=datetime.fromtimestamp(pos.get("time", 0)),
                is_mt5_synced=True,
            )
            db.add(trade)
            synced_trades += 1

    for deal in data.history:
        ticket = str(deal.get("ticket", ""))
        existing = db.query(Trade).filter(Trade.ticket == ticket).first()
        if existing:
            existing.exit_price = deal.get("price", existing.exit_price)
            existing.profit = deal.get("profit", existing.profit)
            existing.status = "CLOSED"
            existing.close_time = datetime.fromtimestamp(deal.get("time", 0)) if deal.get("time") else None
            updated_trades += 1
        else:
            trade = Trade(
                ticket=ticket,
                symbol=deal.get("symbol", ""),
                direction="BUY" if deal.get("type", 0) == 0 else "SELL",
                volume=deal.get("volume", 0),
                entry_price=deal.get("price_open", deal.get("price", 0)),
                exit_price=deal.get("price", 0),
                stop_loss=deal.get("sl"),
                take_profit=deal.get("tp"),
                profit=deal.get("profit", 0),
                swap=deal.get("swap", 0),
                commission=deal.get("commission", 0),
                status="CLOSED",
                open_time=datetime.fromtimestamp(deal.get("time_setup", deal.get("time", 0))),
                close_time=datetime.fromtimestamp(deal.get("time", 0)) if deal.get("time") else None,
                is_mt5_synced=True,
            )
            db.add(trade)
            synced_trades += 1

    db.commit()
    return {
        "status": "success",
        "synced_trades": synced_trades,
        "updated_trades": updated_trades,
        "account_balance": acct.get("balance", 0),
    }


@router.get("/account", response_model=list)
def get_account_history(limit: int = 10, db: Session = Depends(get_db)):
    accounts = db.query(AccountInfo).order_by(AccountInfo.synced_at.desc()).limit(limit).all()
    return [
        {
            "id": a.id,
            "balance": a.balance,
            "equity": a.equity,
            "profit": a.profit,
            "synced_at": a.synced_at.isoformat(),
        }
        for a in accounts
    ]
