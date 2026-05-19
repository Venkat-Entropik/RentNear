'use client';

// ──────────────────────────────────────────────────────────────────────────────
// apps/web/src/features/profile/components/AddressBook.tsx
// Address list with add/delete — uses a slide-in sheet for the form.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { MapPin, Plus, Trash2, Star, Loader2 } from 'lucide-react';
import { useAddresses, useDeleteAddress } from '../hooks/useProfile';
import { AddressForm } from './AddressForm';

export function AddressBook() {
  const [showForm, setShowForm] = useState(false);
  const { data: addresses = [], isLoading } = useAddresses();
  const { mutate: remove, isPending: isDeleting, variables: deletingId } = useDeleteAddress();

  if (isLoading) {
    return (
      <div className="white-card flex items-center justify-center p-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-neutral-900">Saved Addresses</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-pill bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Address
        </button>
      </div>

      {/* Address cards */}
      {addresses.length === 0 && !showForm ? (
        <div className="white-card flex flex-col items-center gap-3 py-10 text-center">
          <MapPin className="h-8 w-8 text-neutral-300" />
          <p className="text-sm text-neutral-500">No addresses saved yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            Add your first address →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="white-card flex items-start justify-between p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                  <MapPin className="h-4 w-4 text-primary-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-0.5 rounded-pill bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
                        <Star className="h-2.5 w-2.5 fill-primary-500" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-600">
                    {addr.street}, {addr.city}, {addr.state} – {addr.pincode}
                  </p>
                </div>
              </div>

              <button
                onClick={() => remove(addr.id)}
                disabled={isDeleting && deletingId === addr.id}
                className="ml-2 flex-shrink-0 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-danger disabled:opacity-50"
                aria-label="Delete address"
              >
                {isDeleting && deletingId === addr.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline add form (slide-in feel) */}
      {showForm && (
        <div className="white-card animate-slide-up p-6">
          <h4 className="mb-4 text-sm font-semibold text-neutral-900">New Address</h4>
          <AddressForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}
