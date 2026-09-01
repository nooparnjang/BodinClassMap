import { useAuth } from "../../hooks/useAuthHook";
import { doSignOut } from "../../firebase/auth";
import { reserveSeat, getUserReservation, cancelReservation, getClassroomReservations } from "../../firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./DashboardPage.module.css";

interface Reservation {
  studentId: string;
  table: number;
  [key: string]: unknown;
}

const TABLES_PER_CLASSROOM = 40;
const ALLOWED_EMAILS = ["koonnuthhh@gmail.com"];

const isAllowedEmail = (email?: string | null) => {
  const normalizedEmail = email?.toLowerCase();
  if (!normalizedEmail) return false;

  return normalizedEmail.endsWith("@bodin.ac.th") || ALLOWED_EMAILS.includes(normalizedEmail);
};

const ROOM_CONFIG: Record<string, { label: string; subtitle: string; roomCode: string; roomName: string }> = {
  ROOM_614: {
    label: "ชั้นมัธยมศึกษาปีที่ 6 ห้อง 14",
    subtitle: "ห้อง 3308",
    roomCode: "ROOM_614",
    roomName: "ห้อง 3308"
  },
  ROOM_3308: {
    label: "ชั้นมัธยมศึกษาปีที่ 6 ห้อง 14",
    subtitle: "ห้อง 3308",
    roomCode: "ROOM_3308",
    roomName: "ห้อง 3308"
  },
};

function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reservationLoading, setReservationLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [seatInput, setSeatInput] = useState("");
  const [classroomId] = useState("ROOM_614");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [classroomReservations, setClassroomReservations] = useState<Record<string, number>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const hasValidBodinEmail = isAllowedEmail(currentUser?.email);
  const selectedRoom = ROOM_CONFIG[classroomId] ?? ROOM_CONFIG.ROOM_614;

  useEffect(() => {
    const loadReservation = async () => {
      if (!currentUser?.email || !hasValidBodinEmail) {
        setReservation(null);
        setClassroomReservations({});
        return;
      }

      try {
        const userReservation = await getUserReservation(currentUser.email, classroomId);
        setReservation(userReservation);
        const allReservations = await getClassroomReservations(classroomId);
        setClassroomReservations(allReservations);
      } catch (err) {
        console.error("Error loading reservation:", err);
      }
    };

    loadReservation();
  }, [currentUser, classroomId, hasValidBodinEmail]);

  const handleReserveSeat = async () => {
    setError("");
    setSuccess("");

    if (!hasValidBodinEmail) {
      setError("You are not logged in with @bodin.ac.th.");
      setShowConfirmModal(false);
      return;
    }

    if (!seatInput) {
      setError("Please select a seat number first.");
      setShowConfirmModal(false);
      return;
    }

    const tableNumber = Number(seatInput);
    if (Number.isNaN(tableNumber) || tableNumber < 1 || tableNumber > TABLES_PER_CLASSROOM) {
      setError(`Please select a valid table number (1-${TABLES_PER_CLASSROOM}).`);
      setShowConfirmModal(false);
      return;
    }

    const status = getTableStatus(tableNumber);
    if (status.reserved && !isCurrentUserTable(tableNumber)) {
      setError(`Table ${tableNumber} is already reserved by student ${status.studentId}.`);
      setShowConfirmModal(false);
      return;
    }

    try {
      setReservationLoading(true);
      const result = await reserveSeat(currentUser!.email!, classroomId, tableNumber);
      setSuccess(result.message);
      setSeatInput("");
      setShowConfirmModal(false);

      if (currentUser?.email) {
        const userReservation = await getUserReservation(currentUser.email, classroomId);
        setReservation(userReservation);
        const allReservations = await getClassroomReservations(classroomId);
        setClassroomReservations(allReservations);
      }
    } catch (err) {
      console.error("Reservation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to reserve seat";
      setError(errorMessage);
    } finally {
      setReservationLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!hasValidBodinEmail) {
      setError("You are not logged in with @bodin.ac.th.");
      return;
    }

    try {
      setReservationLoading(true);
      await cancelReservation(currentUser!.email!, classroomId);
      setSuccess("Reservation cancelled");
      setSeatInput("");

      if (currentUser?.email) {
        const userReservation = await getUserReservation(currentUser.email, classroomId);
        setReservation(userReservation);
        const allReservations = await getClassroomReservations(classroomId);
        setClassroomReservations(allReservations);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel reservation";
      setError(errorMessage);
    } finally {
      setReservationLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await doSignOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const getTableStatus = (tableNumber: number) => {
    for (const [studentId, table] of Object.entries(classroomReservations)) {
      if (table === tableNumber) {
        return { reserved: true, studentId };
      }
    }
    return { reserved: false, studentId: null };
  };

  const isCurrentUserTable = (tableNumber: number) => {
    return reservation?.table === tableNumber;
  };

  const handleTableClick = (tableNumber: number) => {
    if (!hasValidBodinEmail) {
      setError("You are not logged in with @bodin.ac.th.");
      return;
    }

    const status = getTableStatus(tableNumber);
    if (status.reserved && !isCurrentUserTable(tableNumber)) {
      setError(`Table ${tableNumber} is already reserved by student ${status.studentId}.`);
      return;
    }

    setSeatInput(String(tableNumber));
    setError("");
    setSuccess("");
  };

  const renderClassroomGrid = () => {
    const tables = [] as React.ReactNode[];
    for (let i = 1; i <= TABLES_PER_CLASSROOM; i++) {
      const status = getTableStatus(i);
      const currentUserTable = isCurrentUserTable(i);
      const selected = seatInput === String(i);
      const isDisabled = status.reserved && !currentUserTable;

      let className = styles.seatButton;
      if (selected) className += ` ${styles.seatSelected}`;
      else if (currentUserTable) className += ` ${styles.seatMyReservation}`;
      else if (status.reserved) className += ` ${styles.seatReserved}`;
      else className += ` ${styles.seatAvailable}`;

      tables.push(
        <button
          key={i}
          type="button"
          onClick={() => handleTableClick(i)}
          className={className}
          disabled={isDisabled || reservationLoading}
          aria-label={`Table ${i}`}
        >
          {i}
        </button>
      );
    }

    return <div className={styles.grid}>{tables}</div>;
  };

  if (!currentUser) {
    return <div className={styles.page}><div className={styles.shell}><h1>Loading...</h1></div></div>;
  }

  if (!hasValidBodinEmail) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.sectionCard} style={{ maxWidth: 540, margin: "48px auto 0" }}>
            <h1>Access denied</h1>
            <p style={{ color: "#b42318", fontWeight: 600, fontSize: "18px" }}>
              You are not logged in with @bodin.ac.th.
            </p>
            <p style={{ marginTop: "12px" }}>You cannot reserve a seat.</p>
            <button type="button" onClick={handleLogout} disabled={logoutLoading} className={styles.logoutButton} style={{ marginTop: "18px" }}>
              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roomCount = Object.keys(classroomReservations).length;
  const availableCount = TABLES_PER_CLASSROOM - roomCount;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.roomIdentity}>
            <div className={styles.roomBadge}>{selectedRoom.subtitle}</div>
            <div className={styles.roomText}>
              <span className={styles.roomLabel}>{selectedRoom.label}</span>
              <span className={styles.roomSubtitle}>{selectedRoom.roomName}</span>
            </div>
          </div>

          <button type="button" onClick={handleLogout} disabled={logoutLoading} className={styles.logoutButton}>
            {logoutLoading ? "Logging out..." : "Log out"}
          </button>
        </header>

        <section className={styles.sectionCard}>
          <div className={styles.legendRow}>
            <div className={styles.legendList}>
              <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotAvailable}`} />ว่าง {availableCount}</span>
              <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotReserved}`} />ไม่ว่าง/จองแล้ว {roomCount}</span>
              <span className={styles.legendItem}><span className={`${styles.dot} ${styles.dotPending}`} />รอยืนยัน 0</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.dotSelected}`} />ของฉัน
            </div>
          </div>

          <div className={styles.mapFrame}>
            <div className={styles.topFrame}>
              <div className={styles.frontBoard}>กระดานหน้าห้อง</div>
              <div className={styles.teacherDesk}>โต๊ะครู</div>
            </div>
            {renderClassroomGrid()}
          </div>
        </section>

        <section className={styles.bookingPanel}>
          <div className={styles.bookingHeader}>
            <div className={styles.bookingTitle}>จองโต๊ะ {seatInput ? Number(seatInput) : 0}</div>
            <div className={styles.locationRow}>
              <span>📍</span>
              <span>{selectedRoom.roomName}</span>
            </div>
          </div>

          <p className={styles.warning}>⚠️ กรุณาเลือกโต๊ะของตนอย่างมีสติ</p>

          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>โต๊ะที่เลือก</span>
            <span className={styles.summaryValue}>{seatInput ? `โต๊ะ ${seatInput}` : "ยังไม่ได้เลือก"}</span>
          </div>

          {error && <p className={`${styles.message} ${styles.errorMessage}`}>❌ {error}</p>}
          {success && <p className={`${styles.message} ${styles.successMessage}`}>✓ {success}</p>}

          <button
            type="button"
            className={styles.confirmButton}
            disabled={!seatInput || reservationLoading}
            onClick={() => setShowConfirmModal(true)}
          >
            {reservationLoading ? "กำลังจอง..." : "ยืนยันการจอง"}
          </button>

          {reservation && reservation.table > 0 && (
            <button
              type="button"
              onClick={handleCancelReservation}
              disabled={reservationLoading}
              className={styles.confirmButton}
              style={{ marginTop: "12px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
            >
              {reservationLoading ? "กำลังยกเลิก..." : "ยกเลิกการจอง"}
            </button>
          )}
        </section>
      </div>

      {showConfirmModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>✓</div>
            <h3 className={styles.modalTitle}>ยืนยันการจอง</h3>
            <p className={styles.modalText}>
              คุณต้องการจองโต๊ะ {seatInput} ใน {selectedRoom.roomName} ใช่หรือไม่?
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={`${styles.modalButton} ${styles.cancelButton}`} onClick={() => setShowConfirmModal(false)}>
                ยกเลิก
              </button>
              <button type="button" className={`${styles.modalButton} ${styles.primaryButton}`} onClick={handleReserveSeat}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;