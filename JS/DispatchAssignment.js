const assignmentId = document.getElementById("assignment-id");
const orderId = document.getElementById("order-id");
const driverId = document.getElementById("driver-id");
const vehicleId = document.getElementById("vehicle-id");
const dateTime = document.getElementById("date-time");

const actionBtn = document.getElementById("action-btn");
const toggleFind = document.getElementById("toggle-find");
const toggleNew = document.getElementById("toggle-new");
const dbFeedback = document.getElementById("id-db-feedback");

const API_BASE_URL = "http://localhost:3000/dispatch-assignment";

let activeMode = "FIND"; 
let originalSnapshot = { order: "", driver: "", vehicle: "", date: "" };
let idExistsInDB = false;

let rawOrders = [];
let rawDrivers = [];
let rawVehicles = [];

function captureSnapshot() {
    originalSnapshot = {
        order: orderId.value.trim(),
        driver: driverId.value.trim(),
        vehicle: vehicleId.value.trim(),
        date: dateTime.value
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
    return !orderId.value.trim() && !driverId.value.trim() && !vehicleId.value.trim();
}

function clearFields() {
    orderId.value = "";
    driverId.value = "";
    vehicleId.value = "";
    dateTime.value = "";
}

function resetInlineFeedback() {
    dbFeedback.innerText = "";
    dbFeedback.style.display = "none";
}

async function setFormMode(mode) {
    activeMode = mode;
    resetInlineFeedback();
    
    if (mode === "NEW") {
        toggleNew.classList.add("active");
        toggleFind.classList.remove("active");
        
        actionBtn.innerText = "Save";
        actionBtn.className = "btn btn-success rounded-3 px-4 fw-bold";
        
        assignmentId.disabled = true; 
        clearFields();

        try {
            const response = await fetch(`${API_BASE_URL}/new-id`);
            if (response.ok) {
                const data = await response.json();
                assignmentId.value = data.nextId;
            }
        } catch (err) {
            console.error("Error calculating target index keys:", err);
        }
        idExistsInDB = false;
        captureSnapshot();
    } else {
        toggleFind.classList.add("active");
        toggleNew.classList.remove("active");
        
        actionBtn.innerText = "Update";
        actionBtn.className = "btn btn-warning rounded-3 px-4 fw-bold text-dark";
        
        assignmentId.disabled = false;
        assignmentId.value = "";
        clearFields();
        idExistsInDB = false;
        captureSnapshot();
    }
}

toggleFind.addEventListener("click", () => {
    if (activeMode === "FIND") return;
    setFormMode("FIND");
});

toggleNew.addEventListener("click", async () => {
    if (activeMode === "NEW") return;
    
    if (dataIsMutated() && !isFormBlank()) {
        Swal.fire({
            title: "Unsaved Modifications",
            text: "Switching modes will discard your unsaved changes. Proceed?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#5b2e8a",
            cancelButtonColor: "#dc3545",
            confirmButtonText: "Yes, discard"
        }).then((result) => { if (result.isConfirmed) setFormMode("NEW"); });
    } else {
        setFormMode("NEW");
    }
});

assignmentId.addEventListener("input", async () => {
    if (activeMode === "NEW") return; 

    const id = assignmentId.value.trim();
    if (!id) { clearFields(); captureSnapshot(); resetInlineFeedback(); idExistsInDB = false; return; }

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
        driverId.value = data.driverId || "";
        vehicleId.value = data.vehicleId || "";
        
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

actionBtn.addEventListener("click", async () => {
    if (!orderId.value || !driverId.value || !vehicleId.value) {
        Swal.fire({ icon: "error", title: "Missing Fields", text: "Please select an Order, Driver, and Vehicle.", confirmButtonColor: "#5b2e8a" });
        return;
    }

    if (activeMode === "FIND") {
        const id = assignmentId.value.trim();
        if (!id) { Swal.fire({ icon: "error", title: "ID Missing", text: "Provide a valid target Assignment ID to edit.", confirmButtonColor: "#5b2e8a" }); return; }

        try {
            const checkResp = await fetch(`${API_BASE_URL}/${id}`);
            if (!checkResp.ok) {
                Swal.fire({ icon: "error", title: "Operation Denied", text: "Cannot update. This Assignment ID does not exist.", confirmButtonColor: "#5b2e8a" });
                return;
            }
        } catch(e) { return; }

        if (!dataIsMutated()) {
            Swal.fire({ icon: "info", title: "No Changes Detected", text: "Please make updates before saving changes.", confirmButtonColor: "#5b2e8a" });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: orderId.value,
                    driverId: driverId.value,
                    vehicleId: vehicleId.value,
                    dateTime: dateTime.value
                })
            });
            const data = await response.json();
            Swal.fire({ icon: "success", title: data.message || "Changes Updated Successfully", timer: 1500, showConfirmButton: false });
            captureSnapshot();
        } catch (err) { console.error(err); }

    } else {
        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: orderId.value,
                    driverId: driverId.value,
                    vehicleId: vehicleId.value,
                    dateTime: dateTime.value
                })
            });
            const data = await response.json();
            Swal.fire({ icon: "success", title: data.message || "Record Registered Successfully", timer: 1500, showConfirmButton: false });
            clearFields();
            setFormMode("FIND");
        } catch (err) { console.error(err); }
    }
});

async function verifyNavigationSafety() {
    if (dataIsMutated() && orderId.value !== "") {
        const check = await Swal.fire({
            title: "Changes Won't Be Saved",
            text: "You have unsaved changes. Do you want to discard them and move away?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#5b2e8a",
            confirmButtonText: "Yes, discard and move"
        });
        return check.isConfirmed;
    }
    return true;
}

// NEXT
document.getElementById("next-btn").addEventListener("click", async () => {
    const isSafe = await verifyNavigationSafety();
    if (!isSafe) return;

    if (activeMode === "NEW") {
        Swal.fire({ icon: "info", title: "End of List", text: "You are already at the end of the entry list.", confirmButtonColor: "#5b2e8a" });
        return;
    }

    let id = assignmentId.value.trim();
    if (!id) id = 0;

    try {
        const response = await fetch(`${API_BASE_URL}/next/${id}`);
        if (!response.ok) { Swal.fire({ icon: "info", title: "End of List Reached",text: "You are at the end of the entry list.", confirmButtonColor: "#5b2e8a" }); return; }

        const data = await response.json();
        setFormMode("FIND");
        assignmentId.value = data.assignmentId;
        orderId.value = data.orderId || "";
        driverId.value = data.driverId || "";
        vehicleId.value = data.vehicleId || "";
        if (data.assignedDate) {
            dateTime.value = data.assignedDate.split("T")[0];
        } else {
            dateTime.value = "";
        }
        captureSnapshot();
    } catch (err) { console.error(err); }
});

// PREVIOUS
document.getElementById("previous-btn").addEventListener("click", async () => {
    const isSafe = await verifyNavigationSafety();
    if (!isSafe) return;

    let id = assignmentId.value.trim();
    let searchId = id;

    try {
        const response = await fetch(`${API_BASE_URL}/previous/${searchId}`);
        if (!response.ok) { 
            Swal.fire({ icon: "info", title: "Beginning of List", text: "You are at the beginning of the entry list.", confirmButtonColor: "#5b2e8a" }); 
            return; 
        }

        const data = await response.json();
        await setFormMode("FIND"); 
        
        assignmentId.value = data.assignmentId;
        orderId.value = data.orderId || "";
        driverId.value = data.driverId || "";
        vehicleId.value = data.vehicleId || "";
        if (data.assignedDate) {
            dateTime.value = data.assignedDate.split("T")[0];
        } else {
            dateTime.value = "";
        }
        captureSnapshot();
    } catch (err) { console.error(err); }
});

function buildCustomDropdown(inputId, dropdownId, searchClass, rawData, displayField, listBuilderFn) {
    const inputInput = document.getElementById(inputId);
    const dropEl = document.getElementById(dropdownId);
    const searchInput = dropEl.querySelector("." + searchClass);

    inputInput.addEventListener("click", (e) => {
        if (inputInput.disabled) return;
        e.stopPropagation();
        document.querySelectorAll(".lov-dropdown").forEach(d => d.style.display = "none");
        dropEl.style.display = "block";
        searchInput.focus();
    });

    searchInput.addEventListener("click", (e) => e.stopPropagation());
    
    searchInput.addEventListener("input", () => {
        const filterVal = searchInput.value.toLowerCase();
        listBuilderFn(filterVal);
    });

    document.addEventListener("click", () => dropEl.style.display = "none");
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // 1. Orders Dropdown Selector Engine
        const resOrders = await fetch(`${API_BASE_URL}/orders`);
        rawOrders = await resOrders.json();
        const renderOrders = (filter = "") => {
            const container = document.getElementById("order-list");
            container.innerHTML = "";
            rawOrders.filter(o => String(o.orderId).toLowerCase().includes(filter)).forEach(o => {
                const row = document.createElement("div");
                row.className = "lov-list-item";
                row.innerText = `${o.orderId}`;
                row.addEventListener("click", () => {
                    document.getElementById("order-id").value = o.orderId;
                    document.getElementById("order-dropdown").style.display = "none";
                });
                container.appendChild(row);
            });
        };
        buildCustomDropdown("order-id", "order-dropdown", "lov-search", rawOrders, "orderId", renderOrders);
        renderOrders();

        // 2. Drivers Dropdown Selector Engine
        const resDrivers = await fetch(`${API_BASE_URL}/drivers`);
        rawDrivers = await resDrivers.json();
        const renderDrivers = (filter = "") => {
            const container = document.getElementById("driver-list");
            container.innerHTML = "";
            rawDrivers.filter(d => String(d.driverId).toLowerCase().includes(filter) || d.driverName.toLowerCase().includes(filter)).forEach(d => {
                const row = document.createElement("div");
                row.className = "lov-list-item";
                row.innerText = `${d.driverId} - ${d.driverName}`;
                row.addEventListener("click", () => {
                    document.getElementById("driver-id").value = d.driverId;
                    document.getElementById("driver-dropdown").style.display = "none";
                });
                container.appendChild(row);
            });
        };
        buildCustomDropdown("driver-id", "driver-dropdown", "lov-search", rawDrivers, "driverId", renderDrivers);
        renderDrivers();

        // 3. Vehicles Rich Grid Table Dropdown Selector (Filtered strictly by ID property)
        const resVehicles = await fetch(`${API_BASE_URL}/vehicles`);
        rawVehicles = await resVehicles.json();
        const renderVehicles = (filter = "") => {
            const container = document.getElementById("vehicle-table-body");
            container.innerHTML = "";
            rawVehicles.filter(v => 
                String(v.vehicleId).toLowerCase().includes(filter)
            ).forEach(v => {
                const tr = document.createElement("tr");
                tr.className = "lov-table-row";
                tr.innerHTML = `<td>${v.vehicleId}</td><td>${v.vehicleNumber}</td><td>${v.vehicleType}</td><td>${v.capacity} KGs</td>`;
                tr.addEventListener("click", () => {
                    document.getElementById("vehicle-id").value = v.vehicleId;
                    document.getElementById("vehicle-dropdown").style.display = "none";
                });
                container.appendChild(tr);
            });
        };
        buildCustomDropdown("vehicle-id", "vehicle-dropdown", "lov-search", rawVehicles, "vehicleId", renderVehicles);
        renderVehicles();

    } catch (err) {
        console.error("Initialization error mapped across grid rows:", err);
    }
});