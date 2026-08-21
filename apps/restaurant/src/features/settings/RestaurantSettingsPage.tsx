import { useEffect, useState } from "react";
import { Save, Store, UserRound } from "lucide-react";
import { C } from "../shared/theme";
import { getMyRestaurant, updateRestaurant, type Restaurant } from "../../api/restaurants";
import { getCurrentUserProfile, updateCurrentUserProfile } from "../../auth/auth";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
  country: "Canada",
  currency: "CAD",
  timezone: "America/Toronto",
};

const phoneRegex = /^\+?[0-9()\-\s]{7,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RestaurantSettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [personalForm, setPersonalForm] = useState({ first_name: "", last_name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personalSaving, setPersonalSaving] = useState(false);
  const [error, setError] = useState("");
  const [personalError, setPersonalError] = useState("");
  const [success, setSuccess] = useState("");
  const [personalSuccess, setPersonalSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ phone?: string; email?: string }>({});

  useEffect(() => {
    async function loadRestaurant() {
      try {
        setLoading(true);
        setError("");

        const [profile, restaurantData] = await Promise.all([
          getCurrentUserProfile(),
          getMyRestaurant(),
        ]);

        setRestaurant(restaurantData);
        setPersonalForm({
          first_name: profile.first_name ?? "",
          last_name: profile.last_name ?? "",
        });
        setForm({
          name: restaurantData.name ?? "",
          slug: restaurantData.slug ?? "",
          description: restaurantData.description ?? "",
          phone: restaurantData.phone ?? "",
          email: restaurantData.email ?? "",
          address: restaurantData.address ?? "",
          city: restaurantData.city ?? "",
          province: restaurantData.province ?? "",
          postal_code: restaurantData.postal_code ?? "",
          country: restaurantData.country ?? "Canada",
          currency: restaurantData.currency ?? "CAD",
          timezone: restaurantData.timezone ?? "America/Toronto",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load restaurant details");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, []);

  const handleChange = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "phone") {
      setValidationErrors((prev) => ({
        ...prev,
        phone: value && !phoneRegex.test(value) ? "Please enter a valid phone number." : undefined,
      }));
    }

    if (field === "email") {
      setValidationErrors((prev) => ({
        ...prev,
        email: value && !emailRegex.test(value) ? "Please enter a valid email address." : undefined,
      }));
    }
  };

  const validateForm = () => {
    const nextErrors: { phone?: string; email?: string } = {};

    if (form.phone && !phoneRegex.test(form.phone)) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    if (form.email && !emailRegex.test(form.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        province: form.province.trim() || null,
        postal_code: form.postal_code.trim() || null,
        country: form.country.trim() || "Canada",
        currency: form.currency.trim() || "CAD",
        timezone: form.timezone.trim() || "America/Toronto",
      };

      const updated = await updateRestaurant(payload);
      setRestaurant(updated);
      setSuccess("Restaurant information updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update restaurant");
    } finally {
      setSaving(false);
    }
  };

  const handlePersonalSave = async () => {
    const firstName = personalForm.first_name.trim();
    const lastName = personalForm.last_name.trim();

    if (!firstName || !lastName) {
      setPersonalError("First name and last name are required.");
      return;
    }

    try {
      setPersonalSaving(true);
      setPersonalError("");
      setPersonalSuccess("");

      await updateCurrentUserProfile({
        first_name: firstName,
        last_name: lastName,
      });

      setPersonalSuccess("Personal details updated successfully.");
    } catch (err) {
      setPersonalError(err instanceof Error ? err.message : "Failed to update personal details");
    } finally {
      setPersonalSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
     

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs" style={{ color: C.red }}>
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs" style={{ color: C.green }}>
          {success}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 text-sm" style={{ borderColor: C.border, color: C.muted }}>
          Loading restaurant details...
        </div>
      ) : (
        <>
          <div className="rounded-2xl  border bg-white p-5" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${C.red}15`, color: C.red }}>
                <UserRound size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: C.text }}>
                  Personal settings
                </h3>
                <p className="text-xs" style={{ color: C.muted }}>
                  Update your account name
                </p>
              </div>
            </div>

            {personalError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs" style={{ color: C.red }}>
                {personalError}
              </div>
            )}

            {personalSuccess && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs" style={{ color: C.green }}>
                {personalSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
                First name
                <input
                  value={personalForm.first_name}
                  onChange={(e) => setPersonalForm({ ...personalForm, first_name: e.target.value })}
                  className="rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: C.border, color: C.text }}
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
                Last name
                <input
                  value={personalForm.last_name}
                  onChange={(e) => setPersonalForm({ ...personalForm, last_name: e.target.value })}
                  className="rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: C.border, color: C.text }}
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handlePersonalSave}
                disabled={personalSaving}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                style={{ background: C.red, opacity: personalSaving ? 0.7 : 1 }}
              >
                <Save size={16} />
                {personalSaving ? "Saving..." : "Save personal details"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5" style={{ borderColor: C.border }}>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${C.red}15`, color: C.red }}>
                 <Store size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: C.text }}>
                  Restaurant settings
                </h3>
                <p className="text-xs" style={{ color: C.muted }}>
                 Update your restaurant profile and contact details
                </p>
              </div>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Restaurant name
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label>

            {/* <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Slug
              <input
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label> */}

            <label className="md:col-span-2 flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Description
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="rounded-xl border px-3 py-2 text-sm outline-none resize-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Phone
              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: validationErrors.phone ? "#ef4444" : C.border, color: C.text }}
              />
              {validationErrors.phone && (
                <span className="text-[11px]" style={{ color: "#ef4444" }}>{validationErrors.phone}</span>
              )}
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: validationErrors.email ? "#ef4444" : C.border, color: C.text }}
              />
              {validationErrors.email && (
                <span className="text-[11px]" style={{ color: "#ef4444" }}>{validationErrors.email}</span>
              )}
            </label>

            <label className="md:col-span-2 flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Address
              <input
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              City
              <input
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Province
              <input
                value={form.province}
                onChange={(e) => handleChange("province", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Postal code
              <input
                value={form.postal_code}
                onChange={(e) => handleChange("postal_code", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Country
              <input
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Currency
              <input
                value={form.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: C.muted }}>
              Timezone
              <input
                value={form.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: C.red, opacity: saving ? 0.7 : 1 }}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default RestaurantSettingsPage;
