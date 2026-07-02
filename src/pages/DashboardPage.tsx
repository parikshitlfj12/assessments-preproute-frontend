import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Eye,
  FilePlus2,
  Layers,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge, DifficultyBadge, Badge } from '@/components/ui/Badge';
import { FullPageLoader, Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useDeleteTest, useTests } from '@/hooks/useTests';
import { getApiErrorMessage } from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import type { Test } from '@/types';

const PAGE_SIZE = 8;

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live' },
  { value: 'expired', label: 'Expired' },
  { value: 'unpublished', label: 'Unpublished' },
];

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-ink-900">{value}</p>
        <p className="text-xs font-medium text-ink-400">{label}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: tests, isLoading, isFetching, isError, error, refetch } = useTests();
  const deleteMutation = useDeleteTest();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Test | null>(null);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    tests?.forEach((t) => t.subject && set.add(t.subject));
    return Array.from(set).sort();
  }, [tests]);

  const stats = useMemo(() => {
    const all = tests ?? [];
    return {
      total: all.length,
      live: all.filter((t) => t.status === 'live').length,
      draft: all.filter((t) => !t.status || t.status === 'draft').length,
    };
  }, [tests]);

  const filtered = useMemo(() => {
    let list = tests ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((t) =>
        statusFilter === 'draft' ? !t.status || t.status === 'draft' : t.status === statusFilter,
      );
    }
    if (subjectFilter !== 'all') {
      list = list.filter((t) => t.subject === subjectFilter);
    }
    return list;
  }, [tests, search, statusFilter, subjectFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      toast.success('Test deleted successfully');
      setToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete the test'));
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="Dashboard"
        description="Create, manage and publish your assessments."
        actions={
          <Button onClick={() => navigate('/tests/new')}>
            <FilePlus2 className="h-4 w-4" />
            Create New Test
          </Button>
        }
      />

      <div className="space-y-5 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Layers className="h-5 w-5 text-brand-600" />}
            label="Total Tests"
            value={stats.total}
            tone="bg-brand-50"
          />
          <StatCard
            icon={<ClipboardList className="h-5 w-5 text-emerald-600" />}
            label="Live Tests"
            value={stats.live}
            tone="bg-emerald-50"
          />
          <StatCard
            icon={<Pencil className="h-5 w-5 text-slate-500" />}
            label="Drafts"
            value={stats.draft}
            tone="bg-slate-100"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by test name or subject..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={STATUS_FILTERS}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                resetPage();
              }}
              className="min-w-[150px]"
            />
            <Select
              options={[
                { value: 'all', label: 'All subjects' },
                ...subjects.map((s) => ({ value: s, label: s })),
              ]}
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                resetPage();
              }}
              className="min-w-[160px]"
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm">
              <Spinner className="h-7 w-7" />
            </div>
          )}
          {isLoading ? (
            <FullPageLoader label="Loading tests..." />
          ) : isError ? (
            <EmptyState
              title="Couldn't load tests"
              description={getApiErrorMessage(error)}
              action={<Button onClick={() => refetch()}>Try again</Button>}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-6 w-6" />}
              title="No tests found"
              description={
                tests && tests.length > 0
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first test.'
              }
              action={
                <Button onClick={() => navigate('/tests/new')}>
                  <FilePlus2 className="h-4 w-4" />
                  Create New Test
                </Button>
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="card hidden overflow-hidden md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-muted/60 text-xs font-bold uppercase tracking-wide text-ink-400">
                      <th className="px-5 py-3.5">Test</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Difficulty</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Created</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {paginated.map((test) => (
                      <tr key={test.id} className="group transition hover:bg-surface-muted/50">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-ink-900">{test.name}</p>
                          <p className="text-xs text-ink-400">
                            {test.total_questions} Qs · {test.total_marks} marks · {test.total_time} min
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-ink-700">{test.subject || '—'}</td>
                        <td className="px-5 py-3.5">
                          <DifficultyBadge difficulty={test.difficulty} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={test.status} />
                        </td>
                        <td className="px-5 py-3.5 text-sm text-ink-500">
                          {formatDate(test.created_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <ActionButton
                              title="Preview"
                              onClick={() => navigate(`/tests/${test.id}/preview`)}
                              icon={<Eye className="h-4 w-4" />}
                            />
                            <ActionButton
                              title="Edit"
                              onClick={() => navigate(`/tests/${test.id}/edit`)}
                              icon={<Pencil className="h-4 w-4" />}
                            />
                            <ActionButton
                              title="Delete"
                              danger
                              onClick={() => setToDelete(test)}
                              icon={<Trash2 className="h-4 w-4" />}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {paginated.map((test) => (
                  <div key={test.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-ink-900">{test.name}</p>
                        <p className="text-xs text-ink-400">{test.subject}</p>
                      </div>
                      <StatusBadge status={test.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <DifficultyBadge difficulty={test.difficulty} />
                      <Badge tone="gray">{test.total_questions} Qs</Badge>
                      <Badge tone="gray">{test.total_marks} marks</Badge>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-surface-border pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/tests/${test.id}/preview`)}
                      >
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/tests/${test.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setToDelete(test)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink-400">
                  Showing{' '}
                  <span className="font-semibold text-ink-700">
                    {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
                  </span>{' '}
                  of <span className="font-semibold text-ink-700">{filtered.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-semibold text-ink-700">
                    {safePage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete test?"
        description={`"${toDelete?.name}" will be permanently removed. This action cannot be undone.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={deleteMutation.isPending} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}

function ActionButton({
  title,
  onClick,
  icon,
  danger,
}: {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition ${
        danger
          ? 'text-ink-400 hover:bg-red-50 hover:text-red-600'
          : 'text-ink-400 hover:bg-brand-50 hover:text-brand-600'
      }`}
    >
      {icon}
    </button>
  );
}
