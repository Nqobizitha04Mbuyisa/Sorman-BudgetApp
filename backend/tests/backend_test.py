"""
Backend regression tests for Finova FastAPI mirror backend.
Covers: auth, categories, transactions, budgets, dashboard, profile, auth-guard.
"""
import os
import uuid
from datetime import date, timedelta

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://moneytrack-app").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@finova.io"
ADMIN_PASSWORD = "Admin@12345"


# --------------------------- Fixtures -----------------------------------------
@pytest.fixture(scope="session")
def http():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(http):
    r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def user_creds():
    suffix = uuid.uuid4().hex[:8]
    return {
        "full_name": "TEST_User",
        "email": f"test_{suffix}@finova.io",
        "password": "TestPass@123",
    }


@pytest.fixture(scope="session")
def user_auth(http, user_creds):
    r = http.post(f"{API}/auth/register", json=user_creds)
    assert r.status_code == 201, f"register failed: {r.status_code} {r.text}"
    data = r.json()
    return {
        "token": data["token"],
        "user": data["user"],
        "headers": {"Authorization": f"Bearer {data['token']}", "Content-Type": "application/json"},
    }


# --------------------------- Health -------------------------------------------
def test_health(http):
    r = http.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json().get("status") == "UP"


# --------------------------- Auth ---------------------------------------------
class TestAuth:
    def test_register_creates_user_returns_token(self, http):
        suffix = uuid.uuid4().hex[:8]
        payload = {"full_name": "TEST_Reg", "email": f"reg_{suffix}@finova.io", "password": "Strong@123"}
        r = http.post(f"{API}/auth/register", json=payload)
        assert r.status_code == 201
        body = r.json()
        assert "token" in body and isinstance(body["token"], str) and body["token"]
        assert body["user"]["email"] == payload["email"]
        assert body["user"]["role"] == "USER"
        assert body["user"]["full_name"] == "TEST_Reg"

    def test_register_duplicate_email_409(self, http, user_creds, user_auth):
        # user_auth fixture already registered user_creds
        r = http.post(f"{API}/auth/register", json=user_creds)
        assert r.status_code == 409

    def test_login_admin_success(self, http):
        r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        body = r.json()
        assert body["user"]["role"] == "ADMIN"
        assert body["user"]["email"] == ADMIN_EMAIL
        assert isinstance(body["token"], str)

    def test_login_wrong_password_401(self, http):
        r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pass"})
        assert r.status_code == 401

    def test_me_returns_current_user(self, http, admin_headers):
        r = http.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_token_401(self, http):
        r = http.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token_401(self, http):
        r = http.get(f"{API}/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
        assert r.status_code == 401


# --------------------------- Categories ---------------------------------------
def test_categories_returns_seven_system_categories(http, admin_headers):
    r = http.get(f"{API}/categories", headers=admin_headers)
    assert r.status_code == 200
    cats = r.json()["categories"]
    assert set(cats) == {"Food", "Transport", "Utilities", "Entertainment", "Salary", "Savings", "Other"}


def test_categories_requires_auth(http):
    r = http.get(f"{API}/categories")
    assert r.status_code == 401


# --------------------------- Transactions -------------------------------------
class TestTransactions:
    def test_create_expense_and_income(self, http, user_auth):
        today = date.today().isoformat()
        exp = http.post(f"{API}/transactions", headers=user_auth["headers"], json={
            "type": "EXPENSE", "amount": 50.5, "category": "Food",
            "description": "TEST_lunch", "occurred_on": today
        })
        assert exp.status_code == 201
        body = exp.json()
        assert body["type"] == "EXPENSE"
        assert body["amount"] == 50.5
        assert body["category"] == "Food"
        assert "id" in body

        inc = http.post(f"{API}/transactions", headers=user_auth["headers"], json={
            "type": "INCOME", "amount": 5000, "category": "Salary",
            "description": "TEST_salary", "occurred_on": today
        })
        assert inc.status_code == 201
        assert inc.json()["type"] == "INCOME"

        # Persist check via GET
        get_r = http.get(f"{API}/transactions/{body['id']}", headers=user_auth["headers"])
        assert get_r.status_code == 200
        assert get_r.json()["description"] == "TEST_lunch"

    def test_create_invalid_category_422(self, http, user_auth):
        r = http.post(f"{API}/transactions", headers=user_auth["headers"], json={
            "type": "EXPENSE", "amount": 10, "category": "Groceries",
            "occurred_on": date.today().isoformat()
        })
        assert r.status_code == 422

    def test_list_with_filters_and_pagination(self, http, user_auth):
        # ensure some data exists
        for i, cat in enumerate(["Food", "Transport", "Utilities"]):
            http.post(f"{API}/transactions", headers=user_auth["headers"], json={
                "type": "EXPENSE", "amount": 10 + i, "category": cat,
                "description": f"TEST_filter_{cat}",
                "occurred_on": (date.today() - timedelta(days=i)).isoformat(),
            })

        r = http.get(f"{API}/transactions", headers=user_auth["headers"],
                     params={"page": 0, "size": 2, "type": "EXPENSE", "sort_by": "occurred_on", "sort_dir": "desc"})
        assert r.status_code == 200
        body = r.json()
        assert body["page"] == 0
        assert body["size"] == 2
        assert len(body["items"]) <= 2
        assert body["total"] >= 3
        for item in body["items"]:
            assert item["type"] == "EXPENSE"

        # category filter
        r2 = http.get(f"{API}/transactions", headers=user_auth["headers"],
                      params={"category": "Food"})
        assert r2.status_code == 200
        for item in r2.json()["items"]:
            assert item["category"] == "Food"

        # search filter
        r3 = http.get(f"{API}/transactions", headers=user_auth["headers"],
                      params={"search": "TEST_filter_Food"})
        assert r3.status_code == 200
        assert r3.json()["total"] >= 1

    def test_update_owned_transaction(self, http, user_auth):
        created = http.post(f"{API}/transactions", headers=user_auth["headers"], json={
            "type": "EXPENSE", "amount": 12.5, "category": "Other",
            "description": "TEST_to_update", "occurred_on": date.today().isoformat()
        }).json()
        tid = created["id"]

        r = http.put(f"{API}/transactions/{tid}", headers=user_auth["headers"], json={
            "type": "EXPENSE", "amount": 99.99, "category": "Other",
            "description": "TEST_updated", "occurred_on": date.today().isoformat()
        })
        assert r.status_code == 200
        assert r.json()["amount"] == 99.99
        assert r.json()["description"] == "TEST_updated"

        # verify persistence
        g = http.get(f"{API}/transactions/{tid}", headers=user_auth["headers"]).json()
        assert g["amount"] == 99.99
        assert g["description"] == "TEST_updated"

    def test_update_non_owned_returns_404(self, http, user_auth, admin_headers):
        # create with admin
        created = requests.post(f"{API}/transactions", headers=admin_headers, json={
            "type": "EXPENSE", "amount": 5, "category": "Food",
            "description": "TEST_admin_only", "occurred_on": date.today().isoformat()
        }).json()
        tid = created["id"]
        r = http.put(f"{API}/transactions/{tid}", headers=user_auth["headers"], json={
            "type": "EXPENSE", "amount": 1, "category": "Food",
            "occurred_on": date.today().isoformat()
        })
        assert r.status_code == 404
        # cleanup
        requests.delete(f"{API}/transactions/{tid}", headers=admin_headers)

    def test_delete_owned_transaction(self, http, user_auth):
        created = http.post(f"{API}/transactions", headers=user_auth["headers"], json={
            "type": "EXPENSE", "amount": 1, "category": "Other",
            "description": "TEST_to_delete", "occurred_on": date.today().isoformat()
        }).json()
        tid = created["id"]
        r = http.delete(f"{API}/transactions/{tid}", headers=user_auth["headers"])
        assert r.status_code == 204
        g = http.get(f"{API}/transactions/{tid}", headers=user_auth["headers"])
        assert g.status_code == 404


# --------------------------- Budgets ------------------------------------------
class TestBudgets:
    def test_create_budget_and_upsert(self, http, user_auth):
        r = http.post(f"{API}/budgets", headers=user_auth["headers"],
                      json={"category": "Food", "monthly_limit": 200})
        assert r.status_code == 201
        b = r.json()
        assert b["category"] == "Food"
        assert b["monthly_limit"] == 200
        assert "spent" in b and "remaining" in b and "utilization" in b and "status" in b

        # upsert with new limit
        r2 = http.post(f"{API}/budgets", headers=user_auth["headers"],
                       json={"category": "Food", "monthly_limit": 500})
        assert r2.status_code == 201
        assert r2.json()["monthly_limit"] == 500
        assert r2.json()["id"] == b["id"]

    def test_list_budgets_has_computed_fields(self, http, user_auth):
        r = http.get(f"{API}/budgets", headers=user_auth["headers"])
        assert r.status_code == 200
        budgets = r.json()
        assert isinstance(budgets, list) and len(budgets) >= 1
        for b in budgets:
            assert b["status"] in {"SAFE", "WARNING", "EXCEEDED"}
            assert b["monthly_limit"] > 0
            assert "spent" in b and "remaining" in b and "utilization" in b

    def test_delete_budget(self, http, user_auth):
        c = http.post(f"{API}/budgets", headers=user_auth["headers"],
                      json={"category": "Transport", "monthly_limit": 100}).json()
        r = http.delete(f"{API}/budgets/{c['id']}", headers=user_auth["headers"])
        assert r.status_code == 204


# --------------------------- Dashboard ----------------------------------------
def test_dashboard_summary_shape(http, user_auth):
    r = http.get(f"{API}/dashboard/summary", headers=user_auth["headers"])
    assert r.status_code == 200
    data = r.json()
    for key in ["total_income", "total_expenses", "remaining_balance", "savings_rate",
                "monthly_income", "monthly_expenses", "transaction_count",
                "expense_by_category", "monthly_trend", "recent_transactions"]:
        assert key in data, f"missing {key}"
    assert isinstance(data["expense_by_category"], dict)
    assert isinstance(data["monthly_trend"], list) and len(data["monthly_trend"]) == 6
    for entry in data["monthly_trend"]:
        assert "month" in entry and "income" in entry and "expense" in entry
    assert isinstance(data["recent_transactions"], list)


# --------------------------- Profile ------------------------------------------
def test_profile_update(http, user_auth):
    r = http.put(f"{API}/users/me", headers=user_auth["headers"], json={"full_name": "TEST_Renamed"})
    assert r.status_code == 200
    assert r.json()["full_name"] == "TEST_Renamed"
    # verify persistence
    g = http.get(f"{API}/auth/me", headers=user_auth["headers"])
    assert g.json()["full_name"] == "TEST_Renamed"


# --------------------------- Auth-guard ---------------------------------------
@pytest.mark.parametrize("method,path", [
    ("GET", "/auth/me"),
    ("GET", "/categories"),
    ("GET", "/transactions"),
    ("POST", "/transactions"),
    ("GET", "/budgets"),
    ("POST", "/budgets"),
    ("GET", "/dashboard/summary"),
    ("PUT", "/users/me"),
])
def test_endpoints_require_auth(http, method, path):
    r = http.request(method, f"{API}{path}", json={})
    assert r.status_code == 401, f"{method} {path} returned {r.status_code}"
