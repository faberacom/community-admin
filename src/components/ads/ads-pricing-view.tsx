"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  AdPlacement,
  AdPricingResponse,
  AD_PLACEMENT_LABELS,
} from "@/src/types";
import { adsService } from "@/src/services/ads.service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Switch } from "@/src/components/ui/switch";
import { Modal } from "@/src/components/ui/modal";
import { ConfirmModal } from "@/src/components/ui/confirm-modal";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";
import { formatDate } from "@/src/utils/date";

interface PricingFormState {
  placement: AdPlacement | "";
  durationDays: string;
  price: string;
  currency: string;
}

const EMPTY_FORM: PricingFormState = {
  placement: "",
  durationDays: "",
  price: "",
  currency: "USD",
};

export function AdsPricingView() {
  const [pricings, setPricings] = useState<AdPricingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPricing, setEditingPricing] =
    useState<AdPricingResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState<PricingFormState>(EMPTY_FORM);

  const load = () =>
    adsService
      .listPricing()
      .then(setPricings)
      .catch(() => toast.error("Failed to load pricing"))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingPricing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (pricing: AdPricingResponse) => {
    setEditingPricing(pricing);
    setForm({
      placement: pricing.placement,
      durationDays: String(pricing.durationDays),
      price: pricing.price,
      currency: pricing.currency,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    setEditingPricing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.placement || !form.durationDays || !form.price) return;
    setIsSubmitting(true);
    try {
      if (editingPricing) {
        const updated = await adsService.updatePricing(editingPricing.id, {
          price: Number(form.price),
        });
        setPricings((prev) =>
          prev.map((p) => (p.id === editingPricing.id ? updated : p)),
        );
        toast.success("Pricing updated");
      } else {
        const created = await adsService.createPricing({
          placement: form.placement as AdPlacement,
          duration_days: Number(form.durationDays),
          price: Number(form.price),
        });
        setPricings((prev) => [...prev, created]);
        toast.success("Pricing added");
      }
      closeModal();
    } catch {
      toast.error(
        editingPricing ? "Failed to update pricing" : "Failed to add pricing",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (pricing: AdPricingResponse) => {
    if (togglingId) return;
    setTogglingId(pricing.id);
    try {
      const updated = await adsService.updatePricing(pricing.id, {
        is_active: !pricing.isActive,
      });
      setPricings((prev) =>
        prev.map((p) => (p.id === pricing.id ? updated : p)),
      );
    } catch {
      toast.error("Failed to toggle pricing");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adsService.deletePricing(deletingId);
      setPricings((prev) => prev.filter((p) => p.id !== deletingId));
      toast.success("Pricing deleted");
    } catch {
      toast.error("Failed to delete pricing");
    } finally {
      setDeletingId(null);
    }
  };

  const canSave =
    !!form.placement &&
    !!form.durationDays &&
    Number(form.durationDays) >= 1 &&
    !!form.price &&
    Number(form.price) >= 0;

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={openAdd}>
          + Add Pricing
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : pricings.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No pricing tiers configured.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Placement</th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pricings.map((pricing) => (
                  <tr
                    key={pricing.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {AD_PLACEMENT_LABELS[pricing.placement]}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {pricing.durationDays} day
                      {pricing.durationDays !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {pricing.currency} {Number(pricing.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                      {formatDate(pricing.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={pricing.isActive}
                        onChange={() => handleToggle(pricing)}
                        disabled={togglingId === pricing.id}
                        aria-label="Toggle active"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(pricing)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeletingId(pricing.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingPricing ? "Edit Pricing" : "Add Pricing"}
        size="sm"
      >
        <div className="p-6 space-y-4">
          <Select
            id="pricing-placement"
            label="Placement"
            required
            value={form.placement}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                placement: e.target.value as AdPlacement | "",
              }))
            }
            disabled={!!editingPricing}
          >
            <option value="">Select placement…</option>
            {(
              Object.entries(AD_PLACEMENT_LABELS) as [AdPlacement, string][]
            ).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </Select>

          <Input
            id="pricing-duration"
            label="Duration (days)"
            type="number"
            required
            min={1}
            value={form.durationDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, durationDays: e.target.value }))
            }
            placeholder="e.g. 30"
            disabled={!!editingPricing}
          />

          <Input
            id="pricing-price"
            label="Price"
            type="number"
            required
            min={0}
            step={0.01}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="e.g. 50"
          />

          <Input
            id="pricing-currency"
            label="Currency"
            value={form.currency}
            onChange={(e) =>
              setForm((f) => ({ ...f, currency: e.target.value }))
            }
            placeholder="USD"
            disabled
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!canSave || isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete pricing"
        message="This will permanently delete this pricing tier. Users will no longer see it."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
