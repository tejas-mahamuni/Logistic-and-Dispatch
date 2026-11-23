const assignmentId = document.getElementById("assignment-id");
const orderId = document.getElementById("order-id");
const driverId = document.getElementById("driver-id");
const vehicleId = document.getElementById("vehicle-id");
const dateTime = document.getElementById("date-time");

const actionBtn = document.getElementById("action-btn");
const toggleFind = document.getElementById("toggle-find");
const toggleNew = document.getElementById("toggle-new");
const dbFeedback = document.getElementById("id-db-feedback");
const nextBtn = document.getElementById("next-btn");

const API_BASE_URL = "http://localhost:3000/dispatch-assignment";

let activeMode = "FIND";
let originalSnapshot = { order: "", driver: "", vehicle: "", date: "" };
let idExistsInDB = false;
let isNavigating = false;

let rawOrders = [];
let rawDrivers = [];
let rawVehicles = [];


// ==========================================
// Helper functions to format Driver and Vehicle display strings
// ==========================================
function setDriverInput(dId) {
  if (!dId) {
    driverId.value = "";
    return;
  }
  const match = rawDrivers.find(d => String(d.driverId) === String(dId));
  driverId.value = match ? `${dId} - ${match.driverName}` : dId;
}

function setVehicleInput(vId) {
  if (!vId) {
    vehicleId.value = "";
    return;
  }
  const match = rawVehicles.find(v => String(v.vehicleId) === String(vId));
  vehicleId.value = match ? `${vId} - ${match.vehicleNumber}` : vId;
}

function updateOrderStatusDisplay(status) {
  const statusField = document.getElementById("order-status");
  if (!statusField) return;

  statusField.value = status || "";

  // Reset custom styles
  statusField.style.backgroundColor = "";
  statusField.style.color = "";
  statusField.style.borderColor = "";

  if (!status) {
    return;
  }

  const s = status.toLowerCase();
  if (s === "pending") {
    statusField.style.backgroundColor = "#fee2e2"; // subtle red
    statusField.style.color = "#991b1b";
    statusField.style.borderColor = "#fca5a5";
  } else if (s === "in transit") {
    statusField.style.backgroundColor = "#fef3c7"; // subtle yellow
    statusField.style.color = "#92400e";
    statusField.style.borderColor = "#fcd34d";
  } else if (s === "completed") {
    statusField.style.backgroundColor = "#d1fae5"; // subtle green
    statusField.style.color = "#065f46";
    statusField.style.borderColor = "#6ee7b7";
  } else {
    statusField.style.backgroundColor = "#f3f4f6"; // subtle gray for Cancelled/other
    statusField.style.color = "#374151";
    statusField.style.borderColor = "#d1d5db";
  }
}


// ==========================================
// Snapshot utilities for mutate checks
// ==========================================
function captureSnapshot() {
  originalSnapshot = {
    order: orderId.value.trim(),
    driver: driverId.value.trim(),
    vehicle: vehicleId.value.trim(),
    date: dateTime.value,
  };
}

function dataIsMutated() {
  return (
    orderId.value.trim() !== originalSnapshot.order ||
    driverId.value.trim() !== originalSnapshot.driver ||
    vehicleId.value.trim() !== originalSnapshot.vehicle ||
    dateTime.value !== originalSnapshot.date
  );
}

function isFormBlank() {
  return (
    !orderId.value.trim() && !driverId.value.trim() && !vehicleId.value.trim()
  );
}

function clearFields() {
  orderId.value = "";
  driverId.value = "";
  vehicleId.value = "";
  dateTime.value = "";
  updateOrderStatusDisplay("");
}

function resetInlineFeedback() {
  dbFeedback.innerText = "";
  dbFeedback.style.display = "none";
}

function showToast(type, message) {
  return Swal.fire({
    position: "center",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 1800,
  });
}


// ==========================================
// Populates Order selection drop-down list
// ==========================================
async function refreshOrderDropdownData() {
  try {
    const resOrders = await fetch(`${API_BASE_URL}/orders?mode=${activeMode}`);
    rawOrders = await resOrders.json();
    renderOrders("");
  } catch (err) {
    console.error("Error updating order dropdown dataset:", err);
  }
}

function renderOrders(filter = "") {
  const container = document.getElementById("order-table-body");
  if (!container) return;

  container.innerHTML = "";

  rawOrders
    .filter(
      (o) =>
        String(o.orderId).toLowerCase().includes(filter) ||
        String(o.customerId).toLowerCase().includes(filter) ||
        String(o.source).toLowerCase().includes(filter) ||
        String(o.destination).toLowerCase().includes(filter) ||
        String(o.status).toLowerCase().includes(filter),
    )
    .forEach((o) => {
      const tr = document.createElement("tr");
      tr.className = "lov-table-row";

      tr.innerHTML = `
        <td><strong>${o.orderId}</strong></td>
        <td>${o.customerId || "N/A"}</td>
        <td>${o.dispatchDate}</td>
        <td><small>${o.source || "N/A"} &rarr; ${o.destination || "N/A"}</small></td>
        <td><span class="badge bg-secondary">${o.status}</span></td>
      `;

      tr.addEventListener("click", () => {
        orderId.value = o.orderId;
        updateOrderStatusDisplay(o.status);
        document.getElementById("order-dropdown").style.display = "none";
      });

      container.appendChild(tr);
    });
}


// ==========================================
// Guard navigation warning
// ==========================================
async function guardNavigation(callback) {
  if (isNavigating) return;

  if (!dataIsMutated()) {
    await callback();
    return;
  }

  isNavigating = true;

  try {
    const result = await Swal.fire({
      title: "Unsaved Changes",
      text: "You have unsaved changes on the form. How would you like to proceed?",
      icon: "warning",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText:
        activeMode === "FIND" && idExistsInDB
          ? "Update & Continue"
          : "Save & Continue",
      denyButtonText: "Discard Changes",
      cancelButtonText: "Stay Here",
      confirmButtonColor: "#16a34a",
      denyButtonColor: "#6b7280",
      cancelButtonColor: "#5b2e8a",
    });

    if (result.isConfirmed) {
      const success = await commitFormAction(true);
      if (!success) return;
      await callback();
    } else if (result.isDenied) {
      captureSnapshot();
      await callback();
    }

  } finally {
    isNavigating = false;
  }
}


// ==========================================
// Toggles form controls based on layout mode
// ==========================================
async function setFormMode(mode) {
  activeMode = mode;
  resetInlineFeedback();

  const statusRow = document.getElementById("order-status-row");

  if (mode === "NEW") {
    toggleNew.classList.add("active");
    toggleFind.classList.remove("active");

    actionBtn.innerText = "Save";
    actionBtn.className = "btn btn-success rounded-3 px-4 fw-bold";
    nextBtn.classList.add("d-none");

    if (statusRow) statusRow.style.display = "none";

    assignmentId.disabled = true;
    clearFields();
    await refreshOrderDropdownData();

    try {
      const response = await fetch(`${API_BASE_URL}/new-id`);
      if (response.ok) {
        const data = await response.json();
        assignmentId.value = data.nextId;
      }
    } catch (err) {
      console.error("Error calculating next assignment sequence ID:", err);
    }

    idExistsInDB = false;
    captureSnapshot();

  } else {
    toggleFind.classList.add("active");
    toggleNew.classList.remove("active");

    actionBtn.innerText = "Update";
    actionBtn.className = "btn btn-warning rounded-3 px-4 fw-bold text-dark";
    nextBtn.classList.remove("d-none");

    if (statusRow) statusRow.style.display = "block";

    assignmentId.disabled = false;
    assignmentId.value = "";

    clearFields();
    await refreshOrderDropdownData();

    idExistsInDB = false;
    captureSnapshot();
  }
}

toggleFind.addEventListener("click", async () => {
  if (activeMode === "FIND") return;
  await guardNavigation(() => setFormMode("FIND"));
});

toggleNew.addEventListener("click", async () => {
  if (activeMode === "NEW") return;
  await guardNavigation(() => setFormMode("NEW"));
});


// ==========================================
// Fetch assignment details by input ID
// ==========================================
assignmentId.addEventListener("input", async () => {
  if (activeMode === "NEW") return;

  const id = assignmentId.value.trim();

  if (!id) {
    clearFields();
    captureSnapshot();
    resetInlineFeedback();
    idExistsInDB = false;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);

    if (!response.ok) {
      clearFields();
      captureSnapshot();
      dbFeedback.innerText = `Assignment ID "${id}" does not exist.`;
      dbFeedback.style.display = "block";
      idExistsInDB = false;
      return;
    }

    resetInlineFeedback();

    const data = await response.json();

    orderId.value = data.orderId || "";
    updateOrderStatusDisplay(data.orderStatus);

    setDriverInput(data.driverId);
    setVehicleInput(data.vehicleId);

    if (data.assignedDate) {
      dateTime.value = data.assignedDate.split("T")[0];
    } else {
      dateTime.value = "";
    }

    idExistsInDB = true;
    captureSnapshot();

  } catch (err) {
    console.error(err);
  }
});


// ==========================================
// Commit Create or Update Action
// ==========================================
async function commitFormAction(silent = false) {
  if (!orderId.value || !driverId.value || !vehicleId.value) {
    Swal.fire({
      icon: "error",
      title: "Missing Fields",
      text: "Please select an Order, Driver, and Vehicle.",
      confirmButtonColor: "#5b2e8a",
    });
    return false;
  }

  // Extract only the raw numeric ID before sending to the server
  const cleanDriverId = driverId.value.split(" - ")[0];
  const cleanVehicleId = vehicleId.value.split(" - ")[0];

  if (activeMode === "FIND") {
    const id = assignmentId.value.trim();

    if (!id) {
      Swal.fire({
        icon: "error",
        title: "ID Missing",
        text: "Please enter a valid Assignment ID to edit.",
        confirmButtonColor: "#5b2e8a",
      });
      return false;
    }

    if (!dataIsMutated()) {
      showToast("info", "No changes detected.");
      return true;
    }

    if (!silent) {
      const confirmBox = await Swal.fire({
        title: "Confirm Update",
        html: `Are you sure you want to update details for <b>Assignment ID ${id}</b>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Update",
        cancelButtonColor: "#6b7280",
      });

      if (!confirmBox.isConfirmed) {
        return false;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.value,
          driverId: cleanDriverId,
          vehicleId: cleanVehicleId,
          dateTime: dateTime.value,
        }),
      });

      const data = await response.json();

      await Swal.fire({
        position: "center",
        icon: "success",
        title: "Updated!",
        text: data.message || "Saved.",
        showConfirmButton: false,
        timer: 1500,
      });

      captureSnapshot();
      return true;

    } catch (err) {
      console.error(err);
      return false;
    }

  } else {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.value,
          driverId: cleanDriverId,
          vehicleId: cleanVehicleId,
          dateTime: dateTime.value,
        }),
      });

      const data = await response.json();

      await showToast("success", data.message || "Recorded successfully.");
      clearFields();
      await setFormMode("FIND");
      return true;

    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

actionBtn.addEventListener("click", async () => {
  await commitFormAction(false);
});


// ==========================================
// Handle Pagination Navigation
// ==========================================
async function handlePagination(direction) {
  let id = assignmentId.value.trim();

  if (!id && direction === "previous" && activeMode === "FIND") {
    await Swal.fire({
      icon: "info",
      title: "No Record Loaded",
      text: "Load an entry sequence first.",
      confirmButtonColor: "#4f46e5",
    });
    return;
  }

  if (!id) {
    id = 0;
  }

  await guardNavigation(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/${direction}/${id}`);

      if (!response.ok) {
        await Swal.fire({
          icon: "warning",
          title: direction === "next" ? "End of List" : "Beginning of List",
          text:
            direction === "next"
              ? "No subsequent records."
              : "No prior records.",
          confirmButtonColor: "#4f46e5",
        });
        return;
      }

      const data = await response.json();

      await setFormMode("FIND");

      assignmentId.value = data.assignmentId;
      orderId.value = data.orderId || "";
      updateOrderStatusDisplay(data.orderStatus);

      setDriverInput(data.driverId);
      setVehicleInput(data.vehicleId);

      dateTime.value = data.assignedDate ? data.assignedDate.split("T")[0] : "";
      idExistsInDB = true;

      captureSnapshot();

    } catch (err) {
      console.error(err);
    }
  });
}

nextBtn.addEventListener("click", () => handlePagination("next"));

document
  .getElementById("previous-btn")
  .addEventListener("click", () => handlePagination("previous"));


// ==========================================
// Dropdown Setup
// ==========================================
function buildCustomDropdown(inputId, dropdownId, searchClass, listBuilderFn) {
  const inputInput = document.getElementById(inputId);
  const dropEl = document.getElementById(dropdownId);
  const searchInput = dropEl.querySelector("." + searchClass);

  inputInput.addEventListener("click", (e) => {
    if (inputInput.disabled) return;

    e.stopPropagation();

    document
      .querySelectorAll(".lov-dropdown")
      .forEach((d) => (d.style.display = "none"));

    dropEl.style.display = "block";

    if (searchInput) {
      searchInput.focus();
    }
  });

  if (searchInput) {
    searchInput.addEventListener("click", (e) => e.stopPropagation());
    searchInput.addEventListener("input", () =>
      listBuilderFn(searchInput.value.toLowerCase()),
    );
  }

  document.addEventListener("click", () => (dropEl.style.display = "none"));
}

async function initFromUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const prefillOrder = params.get("prefillOrder");
  const loadId = params.get("id") || params.get("loadId");

  if (prefillOrder) {
    await setFormMode("NEW");
    orderId.value = prefillOrder;
    captureSnapshot();
  } else if (loadId) {
    await setFormMode("FIND");
    assignmentId.value = loadId;
    assignmentId.dispatchEvent(new Event("input"));
  } else {
    await refreshOrderDropdownData();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    buildCustomDropdown(
      "order-id",
      "order-dropdown",
      "lov-search",
      renderOrders,
    );

    const resDrivers = await fetch(`${API_BASE_URL}/drivers`);
    rawDrivers = await resDrivers.json();

    const renderDrivers = (filter = "") => {
      const container = document.getElementById("driver-table-body");
      if (!container) return;

      container.innerHTML = "";

      rawDrivers
        .filter(
          (d) =>
            String(d.driverId).toLowerCase().includes(filter) ||
            d.driverName.toLowerCase().includes(filter),
        )
        .forEach((d) => {
          const tr = document.createElement("tr");
          tr.className = "lov-table-row";
          tr.innerHTML = `<td>${d.driverId}</td><td>${d.driverName}</td>`;

          tr.addEventListener("click", () => {
            driverId.value = `${d.driverId} - ${d.driverName}`;
            document.getElementById("driver-dropdown").style.display = "none";
          });

          container.appendChild(tr);
        });
    };

    buildCustomDropdown(
      "driver-id",
      "driver-dropdown",
      "lov-search",
      renderDrivers,
    );
    renderDrivers();

    const resVehicles = await fetch(`${API_BASE_URL}/vehicles`);
    rawVehicles = await resVehicles.json();

    const renderVehicles = (filter = "") => {
      const container = document.getElementById("vehicle-table-body");
      if (!container) return;

      container.innerHTML = "";

      rawVehicles
        .filter(
          (v) =>
            String(v.vehicleId).toLowerCase().includes(filter) ||
            String(v.vehicleNumber).toLowerCase().includes(filter),
        )
        .forEach((v) => {
          const tr = document.createElement("tr");
          tr.className = "lov-table-row";
          tr.innerHTML = `<td>${v.vehicleId}</td><td>${v.vehicleNumber}</td><td>${v.vehicleType}</td><td>${v.capacity} KGs</td>`;

          tr.addEventListener("click", () => {
            vehicleId.value = `${v.vehicleId} - ${v.vehicleNumber}`;
            document.getElementById("vehicle-dropdown").style.display = "none";
          });

          container.appendChild(tr);
        });
    };

    buildCustomDropdown(
      "vehicle-id",
      "vehicle-dropdown",
      "lov-search",
      renderVehicles,
    );
    renderVehicles();

    await initFromUrlParams();

  } catch (err) {
    console.error("Initialization error mapped across grid rows:", err);
  }
});
