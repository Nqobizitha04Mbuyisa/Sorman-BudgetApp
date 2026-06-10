import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Shield, Calendar, Save } from "lucide-react";
import { fmtDate } from "@/lib/utils";

import { useNavigate } from "react-router-dom";

export default function Profile() {
  //const { user, updateUser } = useAuth();
  const { user, updateUser, logout } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/users/me", { fullName: fullName });
      updateUser(data);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally { setSaving(false); }
  };
  
  const deleteAccount = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to permanently delete your account? This cannot be undone."
  );

  if (!confirmed) return;

  try {
    await api.delete("/users/me");

    toast.success("Account deleted");

    logout();

    nav("/register");

  } catch (err) {
    console.error(err);

    toast.error(
      err?.response?.data?.message ||
      "Failed to delete account"
    );
  }
};

  const initials = (user?.fullName || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-8 max-w-3xl" data-testid="profile-page">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Account</div>
        <h1 className="text-4xl font-bold mt-1">Profile settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details.</p>
      </div>

      <div className="glass rounded-2xl p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-[0_0_24px_rgba(0,122,255,0.35)]">
          {initials}
        </div>
        <div>
          <div className="text-xl font-bold">{user?.fullName}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Mail size={14} /> {user?.email}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-semibold">
            <Shield size={11} /> {user?.role}
          </div>
        </div>
      </div>

      <form onSubmit={save} className="glass rounded-2xl p-6 space-y-5" data-testid="profile-form">
        <h3 className="font-semibold">Account details</h3>
        <div>
          <Label className="text-xs uppercase tracking-[0.15em]">Full name</Label>
          <div className="relative mt-2">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} className="h-11 pl-9 neon-focus" data-testid="profile-name-input" />
          </div>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.15em]">Email</Label>
          <div className="relative mt-2">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={user?.email} disabled className="h-11 pl-9 bg-muted/40" data-testid="profile-email-input" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed in this version.</p>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.15em]">Member since</Label>
          <div className="relative mt-2">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={fmtDate(user?.createdAt)} disabled className="h-11 pl-9 bg-muted/40" />
          </div>
        </div>
        <Button type="submit" disabled={saving} className="h-11" data-testid="profile-save-btn">
          <Save size={16} className="mr-2" /> {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold">Account Overview</h3>

      <div className="mt-4 grid grid-cols-2 gap-4">
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        Member Since
      </div>
      <div className="mt-1 font-semibold">
        {fmtDate(user?.createdAt)}
      </div>
    </div>

    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        Role
      </div>
      <div className="mt-1 font-semibold">
        {user?.role}
      </div>
    </div>
  </div>
</div>


<div className="glass rounded-2xl p-6 border border-red-500/20">
  <h3 className="font-semibold text-red-500">
    Danger Zone
  </h3>

  <p className="text-sm text-muted-foreground mt-2">
    Permanently delete your account and all associated financial data.
    This action cannot be undone.
  </p>

  <Button
    type="button"
    variant="destructive"
    className="mt-4"
    onClick={deleteAccount}
  >
    Delete Account
  </Button>
</div>


    </div>
  );
}
