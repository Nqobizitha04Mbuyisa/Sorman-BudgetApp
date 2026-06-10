"""
Sorman - Personal Finance Management API
FastAPI mirror backend for live preview. Mirrors the contract of the
Java Spring Boot backend located at /app/backend-java.
"""
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta, date
from passlib.context import CryptContext
from jose import jwt, JWTError
from pathlib import Path
import os
import uuid
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# --------------------------------------------------------------------------- #
# Config & Globals
# --------------------------------------------------------------------------- #
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'Sorman-dev-secret-change-me-in-production-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60 * 24  # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

VALID_CATEGORIES = {"Food", "Transport", "Utilities", "Entertainment", "Salary", "Savings", "Other"}

app = FastAPI(title="Sorman API", version="1.0.0", description="Personal Finance Management System")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger("Sorman")
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


# --------------------------------------------------------------------------- #
# Models
# --------------------------------------------------------------------------- #
class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=80)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: Literal["USER", "ADMIN"]
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    user: UserResponse


class TransactionRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    type: Literal["INCOME", "EXPENSE"]
    amount: float = Field(..., gt=0)
    category: str
    description: Optional[str] = Field(None, max_length=240)
    occurred_on: date

    @field_validator("category")
    @classmethod
    def _cat(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"category must be one of {sorted(VALID_CATEGORIES)}")
        return v


class TransactionResponse(BaseModel):
    id: str
    type: str
    amount: float
    category: str
    description: Optional[str]
    occurred_on: date
    created_at: datetime
    updated_at: datetime


class BudgetLimitRequest(BaseModel):
    category: str
    monthly_limit: float = Field(..., gt=0)

    @field_validator("category")
    @classmethod
    def _cat(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"category must be one of {sorted(VALID_CATEGORIES)}")
        return v


class BudgetLimitResponse(BaseModel):
    id: str
    category: str
    monthly_limit: float
    spent: float
    remaining: float
    utilization: float  # 0..1
    status: str         # SAFE / WARNING / EXCEEDED
    created_at: datetime


class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    remaining_balance: float
    savings_rate: float
    monthly_income: float
    monthly_expenses: float
    transaction_count: int
    expense_by_category: dict
    monthly_trend: List[dict]
    recent_transactions: List[TransactionResponse]


class PagedTransactions(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    size: int
    total_pages: int


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION_MINUTES)
    payload = {"sub": subject, "role": role, "exp": expire, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if creds is None:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user


def serialize_user(doc: dict) -> UserResponse:
    return UserResponse(
        id=doc["id"],
        full_name=doc["full_name"],
        email=doc["email"],
        role=doc["role"],
        created_at=_to_dt(doc["created_at"]),
    )


def _to_dt(value) -> datetime:
    if isinstance(value, str):
        return datetime.fromisoformat(value)
    return value


def _to_date(value) -> date:
    if isinstance(value, str):
        return date.fromisoformat(value)
    if isinstance(value, datetime):
        return value.date()
    return value


def serialize_txn(doc: dict) -> TransactionResponse:
    return TransactionResponse(
        id=doc["id"],
        type=doc["type"],
        amount=doc["amount"],
        category=doc["category"],
        description=doc.get("description"),
        occurred_on=_to_date(doc["occurred_on"]),
        created_at=_to_dt(doc["created_at"]),
        updated_at=_to_dt(doc["updated_at"]),
    )


# --------------------------------------------------------------------------- #
# Auth endpoints
# --------------------------------------------------------------------------- #
@api_router.get("/")
async def root():
    return {"app": "Sorman API", "status": "ok", "version": "1.0.0"}


@api_router.get("/health")
async def health():
    return {"status": "UP"}


@api_router.post("/auth/register", response_model=AuthResponse, status_code=201)
async def register(payload: RegisterRequest):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "id": str(uuid.uuid4()),
        "full_name": payload.full_name.strip(),
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "role": "USER",
        "created_at": now,
        "updated_at": now,
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_doc["id"], user_doc["role"])
    return AuthResponse(token=token, user=serialize_user(user_doc))


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["role"])
    return AuthResponse(token=token, user=serialize_user(user))


@api_router.get("/auth/me", response_model=UserResponse)
async def me(current=Depends(get_current_user)):
    return serialize_user(current)


# --------------------------------------------------------------------------- #
# Categories
# --------------------------------------------------------------------------- #
@api_router.get("/categories")
async def list_categories(current=Depends(get_current_user)):
    return {"categories": sorted(VALID_CATEGORIES)}


# --------------------------------------------------------------------------- #
# Transactions
# --------------------------------------------------------------------------- #
@api_router.post("/transactions", response_model=TransactionResponse, status_code=201)
async def create_transaction(payload: TransactionRequest, current=Depends(get_current_user)):
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": current["id"],
        "type": payload.type,
        "amount": float(payload.amount),
        "category": payload.category,
        "description": payload.description,
        "occurred_on": payload.occurred_on.isoformat(),
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.transactions.insert_one(doc)
    return serialize_txn(doc)


@api_router.get("/transactions", response_model=PagedTransactions)
async def list_transactions(
    current=Depends(get_current_user),
    page: int = Query(0, ge=0),
    size: int = Query(10, ge=1, le=100),
    type: Optional[Literal["INCOME", "EXPENSE"]] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    sort_by: str = Query("occurred_on"),
    sort_dir: Literal["asc", "desc"] = Query("desc"),
):
    query: dict = {"user_id": current["id"]}
    if type:
        query["type"] = type
    if category and category in VALID_CATEGORIES:
        query["category"] = category
    if search:
        query["description"] = {"$regex": search, "$options": "i"}
    if start_date or end_date:
        d = {}
        if start_date:
            d["$gte"] = start_date.isoformat()
        if end_date:
            d["$lte"] = end_date.isoformat()
        query["occurred_on"] = d

    direction = 1 if sort_dir == "asc" else -1
    sort_field = sort_by if sort_by in {"occurred_on", "amount", "created_at"} else "occurred_on"

    total = await db.transactions.count_documents(query)
    cursor = db.transactions.find(query, {"_id": 0}).sort(sort_field, direction).skip(page * size).limit(size)
    docs = await cursor.to_list(length=size)
    total_pages = (total + size - 1) // size if size else 1
    return PagedTransactions(
        items=[serialize_txn(d) for d in docs],
        total=total,
        page=page,
        size=size,
        total_pages=total_pages,
    )


@api_router.get("/transactions/{txn_id}", response_model=TransactionResponse)
async def get_transaction(txn_id: str, current=Depends(get_current_user)):
    doc = await db.transactions.find_one({"id": txn_id, "user_id": current["id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return serialize_txn(doc)


@api_router.put("/transactions/{txn_id}", response_model=TransactionResponse)
async def update_transaction(txn_id: str, payload: TransactionRequest, current=Depends(get_current_user)):
    doc = await db.transactions.find_one({"id": txn_id, "user_id": current["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Transaction not found")
    update = {
        "type": payload.type,
        "amount": float(payload.amount),
        "category": payload.category,
        "description": payload.description,
        "occurred_on": payload.occurred_on.isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.transactions.update_one({"id": txn_id}, {"$set": update})
    doc.update(update)
    return serialize_txn(doc)


@api_router.delete("/transactions/{txn_id}", status_code=204)
async def delete_transaction(txn_id: str, current=Depends(get_current_user)):
    result = await db.transactions.delete_one({"id": txn_id, "user_id": current["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return None


# --------------------------------------------------------------------------- #
# Budget Limits
# --------------------------------------------------------------------------- #
async def _compute_spent_for_category(user_id: str, category: str, month_start: date, month_end: date) -> float:
    pipeline = [
        {"$match": {
            "user_id": user_id,
            "category": category,
            "type": "EXPENSE",
            "occurred_on": {"$gte": month_start.isoformat(), "$lte": month_end.isoformat()},
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    result = await db.transactions.aggregate(pipeline).to_list(1)
    return float(result[0]["total"]) if result else 0.0


def _current_month_range() -> tuple[date, date]:
    today = date.today()
    start = today.replace(day=1)
    # last day of month
    if today.month == 12:
        end = date(today.year, 12, 31)
    else:
        end = date(today.year, today.month + 1, 1) - timedelta(days=1)
    return start, end


def _budget_status(util: float) -> str:
    if util >= 1.0:
        return "EXCEEDED"
    if util >= 0.8:
        return "WARNING"
    return "SAFE"


@api_router.post("/budgets", response_model=BudgetLimitResponse, status_code=201)
async def create_budget(payload: BudgetLimitRequest, current=Depends(get_current_user)):
    existing = await db.budgets.find_one({"user_id": current["id"], "category": payload.category})
    now_iso = datetime.now(timezone.utc).isoformat()
    if existing:
        await db.budgets.update_one(
            {"id": existing["id"]},
            {"$set": {"monthly_limit": float(payload.monthly_limit), "updated_at": now_iso}},
        )
        existing["monthly_limit"] = float(payload.monthly_limit)
        doc = existing
    else:
        doc = {
            "id": str(uuid.uuid4()),
            "user_id": current["id"],
            "category": payload.category,
            "monthly_limit": float(payload.monthly_limit),
            "created_at": now_iso,
            "updated_at": now_iso,
        }
        await db.budgets.insert_one(doc)

    start, end = _current_month_range()
    spent = await _compute_spent_for_category(current["id"], doc["category"], start, end)
    util = spent / doc["monthly_limit"] if doc["monthly_limit"] else 0.0
    return BudgetLimitResponse(
        id=doc["id"],
        category=doc["category"],
        monthly_limit=doc["monthly_limit"],
        spent=spent,
        remaining=max(doc["monthly_limit"] - spent, 0.0),
        utilization=round(util, 4),
        status=_budget_status(util),
        created_at=_to_dt(doc["created_at"]),
    )


@api_router.get("/budgets", response_model=List[BudgetLimitResponse])
async def list_budgets(current=Depends(get_current_user)):
    docs = await db.budgets.find({"user_id": current["id"]}, {"_id": 0}).to_list(100)
    start, end = _current_month_range()
    response = []
    for d in docs:
        spent = await _compute_spent_for_category(current["id"], d["category"], start, end)
        util = spent / d["monthly_limit"] if d["monthly_limit"] else 0.0
        response.append(BudgetLimitResponse(
            id=d["id"],
            category=d["category"],
            monthly_limit=d["monthly_limit"],
            spent=spent,
            remaining=max(d["monthly_limit"] - spent, 0.0),
            utilization=round(util, 4),
            status=_budget_status(util),
            created_at=_to_dt(d["created_at"]),
        ))
    return response


@api_router.delete("/budgets/{budget_id}", status_code=204)
async def delete_budget(budget_id: str, current=Depends(get_current_user)):
    result = await db.budgets.delete_one({"id": budget_id, "user_id": current["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
    return None


# --------------------------------------------------------------------------- #
# Dashboard
# --------------------------------------------------------------------------- #
@api_router.get("/dashboard/summary", response_model=DashboardSummary)
async def dashboard_summary(current=Depends(get_current_user)):
    user_id = current["id"]
    start, end = _current_month_range()

    # All-time totals
    pipeline_total = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
    ]
    totals = {r["_id"]: float(r["total"]) for r in await db.transactions.aggregate(pipeline_total).to_list(10)}
    total_income = totals.get("INCOME", 0.0)
    total_expenses = totals.get("EXPENSE", 0.0)

    # Monthly totals
    pipeline_month = [
        {"$match": {
            "user_id": user_id,
            "occurred_on": {"$gte": start.isoformat(), "$lte": end.isoformat()},
        }},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
    ]
    month_totals = {r["_id"]: float(r["total"]) for r in await db.transactions.aggregate(pipeline_month).to_list(10)}
    monthly_income = month_totals.get("INCOME", 0.0)
    monthly_expenses = month_totals.get("EXPENSE", 0.0)

    # Expense breakdown
    pipeline_cat = [
        {"$match": {"user_id": user_id, "type": "EXPENSE"}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
    ]
    expense_by_category = {r["_id"]: round(float(r["total"]), 2) for r in await db.transactions.aggregate(pipeline_cat).to_list(50)}

    # Monthly trend (last 6 months)
    today = date.today()
    trend = []
    for i in range(5, -1, -1):
        # compute month i months ago
        year = today.year
        month = today.month - i
        while month <= 0:
            month += 12
            year -= 1
        first = date(year, month, 1)
        if month == 12:
            last = date(year, 12, 31)
        else:
            last = date(year, month + 1, 1) - timedelta(days=1)
        pipe = [
            {"$match": {
                "user_id": user_id,
                "occurred_on": {"$gte": first.isoformat(), "$lte": last.isoformat()},
            }},
            {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}},
        ]
        m_totals = {r["_id"]: float(r["total"]) for r in await db.transactions.aggregate(pipe).to_list(10)}
        trend.append({
            "month": first.strftime("%b %y"),
            "income": round(m_totals.get("INCOME", 0.0), 2),
            "expense": round(m_totals.get("EXPENSE", 0.0), 2),
        })

    # Recent
    recent_docs = await db.transactions.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    recent = [serialize_txn(d) for d in recent_docs]

    txn_count = await db.transactions.count_documents({"user_id": user_id})
    remaining = total_income - total_expenses
    savings_rate = (remaining / total_income) if total_income > 0 else 0.0

    return DashboardSummary(
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        remaining_balance=round(remaining, 2),
        savings_rate=round(savings_rate, 4),
        monthly_income=round(monthly_income, 2),
        monthly_expenses=round(monthly_expenses, 2),
        transaction_count=txn_count,
        expense_by_category=expense_by_category,
        monthly_trend=trend,
        recent_transactions=recent,
    )


# --------------------------------------------------------------------------- #
# User profile
# --------------------------------------------------------------------------- #
class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=80)


@api_router.put("/users/me", response_model=UserResponse)
async def update_profile(payload: ProfileUpdateRequest, current=Depends(get_current_user)):
    update = {}
    if payload.full_name:
        update["full_name"] = payload.full_name.strip()
    if update:
        update["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"id": current["id"]}, {"$set": update})
        current.update(update)
    return serialize_user(current)


# --------------------------------------------------------------------------- #
# App wiring
# --------------------------------------------------------------------------- #
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def seed_admin():
    """Seed an admin account so testers/recruiters can log in immediately."""
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@finova.io")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@12345")

    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        now = datetime.now(timezone.utc).isoformat()
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "full_name": "Sorman Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "ADMIN",
            "created_at": now,
            "updated_at": now,
        })
        logger.info(f"Seeded admin user: {admin_email}")
    else:
        logger.info("Admin user already present, skipping seed.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
