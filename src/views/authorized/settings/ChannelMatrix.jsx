import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card, CardBody, Button, Table, Badge, Spinner, Alert, Input,
} from "reactstrap";
import { FaThLarge, FaSyncAlt, FaSearch, FaCheck, FaMinus, FaBullhorn } from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";
import { PageLoader } from "@/components";
import { ICON_MAP } from "@/config/menu/authorizedMenu";

/**
 * Read-only view of who has which channel configured.
 *
 * The matrix answers "which of my tenants can send on X" at a glance, which is
 * what the legacy tree view made hard. Secrets are never returned, so this is
 * safe to show to an administrator.
 */
const ChannelMatrix = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState({ channels: [], providers: [], users: [], rows: [] });
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/user-channels/matrix/all");
      setMatrix(res?.data?.data || { channels: [], providers: [], users: [], rows: [] });
    } catch (err) {
      toast.error(err?.message || "Failed to load channel matrix");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const term = search.trim().toLowerCase();

  const visibleUsers = useMemo(
    () =>
      (matrix.users || []).filter(
        (u) =>
          !term ||
          u.name?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      ),
    [matrix.users, term]
  );

  /** userId -> { CHANNEL_CODE: { provider, status, enabled } } */
  const lookup = useMemo(() => {
    const map = {};
    (matrix.rows || []).forEach((r) => {
      const key = r.userId || r.user?._id || r.user;
      if (!key) return;
      map[key] = map[key] || {};
      map[key][r.channel] = r;
    });
    return map;
  }, [matrix.rows]);

  if (loading && !matrix.users?.length) return <PageLoader />;

  const channels = matrix.channels || [];

  return (
    <div className="container-fluid py-3">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <FaThLarge className="text-primary" /> Channel Assignment Matrix
          </h4>
          <small className="text-muted">
            Which tenants have which channel configured. Credential values are never displayed.
          </small>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="position-relative">
            <FaSearch className="position-absolute text-muted" style={{ top: 10, left: 10 }} />
            <Input
              size="sm" placeholder="Search users…" className="ps-4"
              style={{ width: 220 }} value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button color="light" size="sm" onClick={load} disabled={loading}>
            {loading ? <Spinner size="sm" /> : <FaSyncAlt />} Refresh
          </Button>
        </div>
      </div>

      {channels.length === 0 ? (
        <Alert color="warning">No channels are registered yet.</Alert>
      ) : (
        <Card className="shadow-sm border-0">
          <CardBody className="p-0">
            <div className="table-responsive">
              <Table hover bordered size="sm" className="mb-0 align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th className="text-start" style={{ minWidth: 220 }}>User</th>
                    {channels.map((c) => {
                      const Icon = ICON_MAP[c.icon] || FaBullhorn;
                      return (
                        <th key={c.code ?? c}>
                          <div className="d-flex flex-column align-items-center gap-1">
                            <Icon className="text-primary" />
                            <span style={{ whiteSpace: "nowrap" }}>{c.name || c}</span>
                            <small className="text-muted fw-normal">{c.code || c}</small>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.length === 0 && (
                    <tr>
                      <td colSpan={channels.length + 1} className="text-center text-muted py-4">
                        No users match your search.
                      </td>
                    </tr>
                  )}
                  {visibleUsers.map((u) => {
                    const uid = u._id || u.userId || u.id;
                    const row = lookup[uid] || {};
                    return (
                      <tr key={uid}>
                        <td className="text-start">
                          <div className="fw-semibold">{u.name}</div>
                          <small className="text-muted">{u.email}</small>
                          {u.role && <Badge color="light" className="text-dark border ms-1">{u.role}</Badge>}
                        </td>
                        {channels.map((c) => {
                          const code = c.code ?? c;
                          const cell = row[code];
                          if (!cell) {
                            return (
                              <td key={code} className="text-muted">
                                <FaMinus className="opacity-25" />
                              </td>
                            );
                          }
                          return (
                            <td key={code}>
                              <FaCheck
                                className={cell.enabled === false ? "text-secondary" : "text-success"}
                                title={cell.provider || code}
                              />
                              <div style={{ fontSize: "0.7rem" }} className="text-muted">
                                {cell.provider || ""}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ChannelMatrix;
