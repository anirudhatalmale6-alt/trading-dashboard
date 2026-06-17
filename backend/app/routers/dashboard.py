from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Trade, AccountInfo, DailyStats, TradingRule
from app.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    account = db.query(AccountInfo).order_by(desc(AccountInfo.synced_at)).first()
    balance = account.balance if account else 0
    equity = account.equity if account else 0

    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_trades = db.query(Trade).filter(
        Trade.close_time >= today,
        Trade.status == "CLOSED"
    ).all()
    daily_pnl = sum(t.profit or 0 for t in today_trades)

    all_closed = db.query(Trade).filter(Trade.status == "CLOSED").all()
    total_trades = len(all_closed)
    winners = [t for t in all_closed if (t.profit or 0) > 0]
    losers = [t for t in all_closed if (t.profit or 0) < 0]
    win_rate = (len(winners) / total_trades * 100) if total_trades > 0 else 0

    gross_profit = sum(t.profit for t in winners) if winners else 0
    gross_loss = abs(sum(t.profit for t in losers)) if losers else 0
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else None

    open_positions = db.query(Trade).filter(Trade.status == "OPEN").count()

    profits = [t.profit or 0 for t in all_closed]
    best_trade = max(profits) if profits else 0
    worst_trade = min(profits) if profits else 0
    avg_win = (gross_profit / len(winners)) if winners else 0
    avg_loss = (gross_loss / len(losers)) if losers else 0

    total_profit = sum(profits)

    streak = 0
    if all_closed:
        sorted_trades = sorted(all_closed, key=lambda t: t.close_time or t.open_time, reverse=True)
        if sorted_trades[0].profit and sorted_trades[0].profit > 0:
            for t in sorted_trades:
                if t.profit and t.profit > 0:
                    streak += 1
                else:
                    break
        else:
            for t in sorted_trades:
                if t.profit and t.profit <= 0:
                    streak -= 1
                else:
                    break

    equity_curve = []
    running_balance = balance - total_profit
    sorted_closed = sorted(all_closed, key=lambda t: t.close_time or t.open_time)
    for t in sorted_closed:
        running_balance += (t.profit or 0)
        equity_curve.append({
            "date": (t.close_time or t.open_time).isoformat(),
            "balance": round(running_balance, 2),
            "profit": t.profit or 0,
        })

    recent = db.query(Trade).order_by(desc(Trade.open_time)).limit(10).all()
    recent_trades = [
        {
            "id": t.id,
            "symbol": t.symbol,
            "direction": t.direction.value if hasattr(t.direction, "value") else t.direction,
            "volume": t.volume,
            "profit": t.profit or 0,
            "status": t.status.value if hasattr(t.status, "value") else t.status,
            "open_time": t.open_time.isoformat(),
            "close_time": t.close_time.isoformat() if t.close_time else None,
        }
        for t in recent
    ]

    max_drawdown = 0
    if equity_curve:
        peak = equity_curve[0]["balance"]
        for point in equity_curve:
            if point["balance"] > peak:
                peak = point["balance"]
            dd = (peak - point["balance"]) / peak * 100 if peak > 0 else 0
            max_drawdown = max(max_drawdown, dd)

    thirty_days_ago = today - timedelta(days=30)
    daily = db.query(DailyStats).filter(DailyStats.date >= thirty_days_ago).order_by(DailyStats.date).all()
    daily_stats_list = [
        {
            "date": d.date.isoformat(),
            "net_pnl": d.net_pnl,
            "total_trades": d.total_trades,
            "win_rate": d.win_rate,
        }
        for d in daily
    ]

    return DashboardStats(
        balance=round(balance, 2),
        equity=round(equity, 2),
        daily_pnl=round(daily_pnl, 2),
        total_trades=total_trades,
        open_positions=open_positions,
        win_rate=round(win_rate, 2),
        profit_factor=round(profit_factor, 2) if profit_factor else None,
        max_drawdown=round(max_drawdown, 2),
        best_trade=round(best_trade, 2),
        worst_trade=round(worst_trade, 2),
        avg_win=round(avg_win, 2),
        avg_loss=round(avg_loss, 2),
        total_profit=round(total_profit, 2),
        streak=streak,
        equity_curve=equity_curve,
        recent_trades=recent_trades,
        daily_stats=daily_stats_list,
    )
