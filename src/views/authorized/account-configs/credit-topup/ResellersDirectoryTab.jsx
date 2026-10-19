import React, { useMemo } from "react";
import { Table, Button, Badge, ButtonGroup, Input } from "reactstrap";
import { FaPlus, FaMinus, FaHistory, FaTag, FaUserTie, FaUser } from "react-icons/fa";

const ResellersDirectoryTab = ({
  users = [],
  userSearch = "",
  setUserSearch,
  userRoleFilter = "ALL",
  setUserRoleFilter,
  selectedUserId = "",
  isAdminOrDevops = false,
  onOpenPlanModal,
  onOpenTopupModal,
  onSelectUserForHistory,
}) => {
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.mobile || "").toLowerCase().includes(q)
      );
    });
  }, [users, userSearch, userRoleFilter]);

  const resellerCount = useMemo(
    () => users.filter((u) => u.role === "RESELLER").length,
    [users]
  );
  const clientCount = useMemo(
    () => users.filter((u) => u.role === "CLIENT").length,
    [users]
  );
  const managerCount = useMemo(
    () => users.filter((u) => u.role === "MANAGER").length,
    [users]
  );

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: 540 }}>
          <Input
            size="sm"
            placeholder="Search accounts by name, email, mobile…"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <ButtonGroup size="sm">
            <Button
              color={userRoleFilter === "ALL" ? "primary" : "light"}
              onClick={() => setUserRoleFilter("ALL")}
            >
              All ({users.length})
            </Button>
            <Button
              color={userRoleFilter === "RESELLER" ? "primary" : "light"}
              onClick={() => setUserRoleFilter("RESELLER")}
            >
              Resellers ({resellerCount})
            </Button>
            <Button
              color={userRoleFilter === "CLIENT" ? "primary" : "light"}
              onClick={() => setUserRoleFilter("CLIENT")}
            >
              Clients ({clientCount})
            </Button>
            <Button
              color={userRoleFilter === "MANAGER" ? "primary" : "light"}
              onClick={() => setUserRoleFilter("MANAGER")}
            >
              Managers ({managerCount})
            </Button>
          </ButtonGroup>
        </div>
        <div className="small text-muted">
          Showing {filteredUsers.length} accounts
        </div>
      </div>

      <div className="table-responsive">
        <Table hover bordered size="sm" className="align-middle small">
          <thead className="table-light text-nowrap">
            <tr>
              <th>Account Name / Email</th>
              <th>Role</th>
              <th>Parent Client Details</th>
              <th>Pricing Plan</th>
              <th className="text-end">SMS (6 routes)</th>
              <th className="text-end">WhatsApp (5 routes)</th>
              <th className="text-end">RCS (3 routes)</th>
              <th className="text-end">Voice (4 pulses)</th>
              <th className="text-end">Email (2 routes)</th>
              <th className="text-end fw-bold">Total Credits</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-muted py-4">
                  No accounts found matching your query.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const w = u.creditWallet || u.myWallet || {};
                const smsTotal =
                  (w.sms_otp_credits || 0) +
                  (w.sms_implicit_credits || 0) +
                  (w.sms_explicit_credits || 0) +
                  (w.sms_promotional_credits || 0) +
                  (w.sms_international_credits || 0) +
                  (w.sms_dLT_scrubbing_credits || 0);

                const waTotal =
                  (w.whatsapp_authentication_credits || 0) +
                  (w.whatsapp_auth_international_credits || 0) +
                  (w.whatsapp_utility_credits || 0) +
                  (w.whatsapp_marketing_credits || 0) +
                  (w.whatsapp_service_credits || 0);

                const rcsTotal =
                  (w.rcs_otp_credits || 0) +
                  (w.rcs_service_credits || 0) +
                  (w.rcs_marketing_credits || 0);

                const voiceTotal =
                  (w.voice_15s_credits || 0) +
                  (w.voice_30s_credits || 0) +
                  (w.voice_60s_credits || 0) +
                  (w.voice_dtmf_interactive_credits || 0);

                const emailTotal =
                  (w.email_transactional_credits || 0) +
                  (w.email_marketing_credits || 0);

                const userTotal = smsTotal + waTotal + rcsTotal + voiceTotal + emailTotal;

                return (
                  <tr key={u._id} className={u._id === selectedUserId ? "table-active" : ""}>
                    <td>
                      <div className="fw-bold text-dark d-flex align-items-center gap-1">
                        {u.role === "RESELLER" ? (
                          <FaUserTie className="text-primary" />
                        ) : (
                          <FaUser className="text-info" />
                        )}
                        {u.name || "Unnamed"}
                      </div>
                      <div className="text-muted small">
                        {u.email} {u.mobile ? `• ${u.mobile}` : ""}
                      </div>
                    </td>
                    <td>
                      <Badge
                        color={
                          u.role === "RESELLER"
                            ? "primary"
                            : u.role === "CLIENT"
                            ? "info"
                            : u.role === "ADMIN" || u.role === "DEVOPS"
                            ? "danger"
                            : "dark"
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td>
                      {u.parentClientId ? (
                        <div>
                          <div className="fw-semibold text-dark small">
                            {u.parentClientName || "Parent Client"}
                          </div>
                          <div className="text-muted small" style={{ fontSize: "11px" }}>
                            ID: <code>{u.parentClientId}</code>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {u.myCreditPlan?.creditPlanId ? (
                        <div>
                          <Badge color="primary" className="fw-semibold px-2 py-1">
                            {u.myCreditPlan.creditPlanId.planName || "Custom Plan"}
                          </Badge>
                          <div className="d-flex gap-1 mt-1">
                            <Badge
                              color={u.myCreditPlan.isActive ? "success" : "secondary"}
                              pill
                              style={{ fontSize: "9px" }}
                            >
                              {u.myCreditPlan.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {u.myCreditPlan.isUse && (
                              <Badge color="info" pill style={{ fontSize: "9px" }}>
                                In-Use
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Badge color="light" className="text-muted border fw-normal px-2 py-1">
                          Base Master Rates
                        </Badge>
                      )}
                    </td>
                    <td className="text-end fw-semibold text-success">{smsTotal.toLocaleString()}</td>
                    <td className="text-end fw-semibold text-primary">{waTotal.toLocaleString()}</td>
                    <td className="text-end fw-semibold" style={{ color: "#7950f2" }}>
                      {rcsTotal.toLocaleString()}
                    </td>
                    <td className="text-end fw-semibold text-warning">{voiceTotal.toLocaleString()}</td>
                    <td className="text-end fw-semibold text-info">{emailTotal.toLocaleString()}</td>
                    <td className="text-end fw-bold text-dark">{userTotal.toLocaleString()}</td>
                    <td className="text-center text-nowrap">
                      {isAdminOrDevops && (
                        <Button
                          color="info"
                          size="sm"
                          className="py-0 px-2 me-1 text-white"
                          onClick={() => onOpenPlanModal(u)}
                          title="Assign or edit Pricing Plan for this user"
                        >
                          <FaTag size={10} className="me-1" /> Plan
                        </Button>
                      )}
                      <Button
                        color="success"
                        size="sm"
                        className="py-0 px-2 me-1"
                        onClick={() => onOpenTopupModal("topup", u)}
                        title="Topup Credits for this account"
                      >
                        <FaPlus /> Add
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        className="py-0 px-2 me-1"
                        onClick={() => onOpenTopupModal("deduct", u)}
                        title="Deduct Credits from this account"
                      >
                        <FaMinus /> Deduct
                      </Button>
                      <Button
                        color="light"
                        size="sm"
                        className="py-0 px-2 border"
                        onClick={() => onSelectUserForHistory(u._id)}
                        title="View this account's transactions & deductions"
                      >
                        <FaHistory /> History
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default ResellersDirectoryTab;
