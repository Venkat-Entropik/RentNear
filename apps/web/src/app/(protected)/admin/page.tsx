'use client';

import { useState } from 'react';
import { useAdminStats, useAdminUsers, useAdminListings } from '@/features/admin/hooks/useAdmin';
import { useAdminDisputes, useUpdateDisputeStatus } from '@/features/disputes/hooks/useDisputes';
import { Header } from '@/components/Header';
import { Loader2, Users, Package, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: isLoadingStats } = useAdminStats();
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'disputes'>('users');
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading: isLoadingUsers } = useAdminUsers(activeTab === 'users' ? page : 1);
  const { data: listingsData, isLoading: isLoadingListings } = useAdminListings(activeTab === 'listings' ? page : 1);
  const { data: disputesData, isLoading: isLoadingDisputes } = useAdminDisputes(activeTab === 'disputes' ? page : 1);
  
  const { mutate: updateDispute } = useUpdateDisputeStatus();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1">Platform overview and management.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="white-card p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Users</p>
              {isLoadingStats ? <div className="h-6 w-12 bg-neutral-200 animate-pulse mt-1 rounded" /> : <p className="text-2xl font-bold text-neutral-900">{stats?.totalUsers}</p>}
            </div>
          </div>
          
          <div className="white-card p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Listings</p>
              {isLoadingStats ? <div className="h-6 w-12 bg-neutral-200 animate-pulse mt-1 rounded" /> : <p className="text-2xl font-bold text-neutral-900">{stats?.totalListings}</p>}
            </div>
          </div>

          <div className="white-card p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Successful Bookings</p>
              {isLoadingStats ? <div className="h-6 w-12 bg-neutral-200 animate-pulse mt-1 rounded" /> : <p className="text-2xl font-bold text-neutral-900">{stats?.totalBookings}</p>}
            </div>
          </div>

          <div className="white-card p-6 flex items-center gap-4">
            <div className="p-3 bg-success-light text-success rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Gross Processing Volume</p>
              {isLoadingStats ? <div className="h-6 w-16 bg-neutral-200 animate-pulse mt-1 rounded" /> : <p className="text-2xl font-bold text-neutral-900">₹{stats?.totalRevenue.toLocaleString('en-IN')}</p>}
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="white-card overflow-hidden">
          <div className="flex border-b border-neutral-200">
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
              onClick={() => { setActiveTab('users'); setPage(1); }}
            >
              Users
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'listings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
              onClick={() => { setActiveTab('listings'); setPage(1); }}
            >
              Listings
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'disputes' ? 'border-red-500 text-red-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
              onClick={() => { setActiveTab('disputes'); setPage(1); }}
            >
              Disputes
            </button>
          </div>

          <div className="p-0 overflow-x-auto">
            {activeTab === 'users' && (
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-900">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {isLoadingUsers ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary-500" /></td></tr>
                  ) : usersData?.data.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 font-medium text-neutral-900">{u.name || 'N/A'}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-pill text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'listings' && (
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-900">
                  <tr>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Owner</th>
                    <th className="px-6 py-4 font-medium">Price/Day</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {isLoadingListings ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary-500" /></td></tr>
                  ) : listingsData?.data.map((l) => (
                    <tr key={l.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 font-medium text-neutral-900">{l.title}</td>
                      <td className="px-6 py-4">{l.categoryName}</td>
                      <td className="px-6 py-4">{l.ownerName}</td>
                      <td className="px-6 py-4">₹{l.pricePerDay}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-pill text-xs font-medium ${l.isPublished ? 'bg-success-light text-success' : 'bg-amber-50 text-amber-700'}`}>
                          {l.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'disputes' && (
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-900">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Item</th>
                    <th className="px-6 py-4 font-medium">Initiator</th>
                    <th className="px-6 py-4 font-medium">Reason</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {isLoadingDisputes ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary-500" /></td></tr>
                  ) : disputesData?.data.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">{format(new Date(d.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 text-primary-600 max-w-[150px] truncate">{d.booking?.listing?.title}</td>
                      <td className="px-6 py-4">{d.initiator?.name}</td>
                      <td className="px-6 py-4 max-w-[200px] truncate" title={d.reason}>{d.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-pill text-xs font-medium ${d.status === 'OPEN' ? 'bg-red-100 text-red-700' : d.status === 'RESOLVED' ? 'bg-success-light text-success' : 'bg-neutral-100 text-neutral-700'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {d.status !== 'RESOLVED' && d.status !== 'CLOSED' && (
                          <button
                            onClick={() => updateDispute({ id: d.id, data: { status: 'RESOLVED', adminNotes: 'Resolved by Admin' } })}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination Controls could go here */}
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center text-sm text-neutral-500">
             <span>Showing page {page}</span>
             <div className="flex gap-2">
               <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-white border border-neutral-200 rounded disabled:opacity-50 hover:bg-neutral-50">Prev</button>
               <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-white border border-neutral-200 rounded hover:bg-neutral-50">Next</button>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}
