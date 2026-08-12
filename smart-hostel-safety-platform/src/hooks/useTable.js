import { useCallback, useMemo, useState } from "react";

export function useTable(data, { searchKeys = [], pageSize = 8, defaultSort = null, filterKey: fk = null } = {}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState(defaultSort?.dir ?? "asc");
  const [page, setPage] = useState(1);
  const filterKey = fk;

  const filtered = useMemo(() => {
    let rows = [...(data || [])];
    if (search && searchKeys.length) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
      );
    }
    if (filter !== "all" && filterKey) {
      rows = rows.filter((row) => String(row[filterKey]).toLowerCase() === filter.toLowerCase());
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, searchKeys, filter, filterKey, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = useCallback((key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }, [sortKey]);

  const exportToCSV = useCallback((filename = "table_export.csv") => {
    if (!filtered.length) return;
    const keys = Object.keys(filtered[0]).filter(k => typeof filtered[0][k] !== "object" && typeof filtered[0][k] !== "function");
    const headers = keys.join(",");
    const rows = filtered.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filtered]);

  return {
    search, setSearch, filter, setFilter,
    sortKey, sortDir, toggleSort, page: safePage, setPage,
    totalPages, paginated, filtered, total: filtered.length,
    exportToCSV,
  };
}
