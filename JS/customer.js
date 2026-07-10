const customerId = document.getElementById("id");
const customerName = document.getElementById("name");
const customerAddress = document.getElementById("address");
const customerPhone = document.getElementById("phone");

const actionBtn = document.getElementById("action-btn");
const toggleFind = document.getElementById("toggle-find");
const toggleNew = document.getElementById("toggle-new");
const dbFeedback = document.getElementById("id-db-feedback");
const phoneFeedback = document.getElementById("phone-db-feedback");

const API_BASE_URL = "http://localhost:3000/customer";

let activeMode = "FIND"; 
let originalSnapshot = { name: "", address: "", phone: "" };
let idExistsInDB = false; 

function captureSnapshot() {
    originalSnapshot = {
        name: customerName.value.trim(),
        address: customerAddress.value.trim(),
        phone: customerPhone.value.trim()
    };
}

function dataIsMutated() {
    return (
        customerName.value.trim() !== originalSnapshot.name ||
        customerAddress.value.trim() !== originalSnapshot.address ||
        customerPhone.value.trim() !== originalSnapshot.phone
    );
}

function isFormBlank() {
    return !customerName.value.trim() && !customerAddress.value.trim() && !customerPhone.value.trim();
}

function clearFields() {
    customerName.value = "";
    customerAddress.value = "";
    customerPhone.value = "";
}

function resetInlineFeedback() {
    dbFeedback.innerText = "";
    dbFeedback.style.display = "none";
    phoneFeedback.innerText = "";
    phoneFeedback.style.display = "none";
}

// Dynamically alters button context metrics based on selection row targets
async function setFormMode(mode) {
    activeMode = mode;
    resetInlineFeedback();
    
    if (mode === "NEW") {
        toggleNew.classList.add("active");
        toggleFind.classList.remove("active");
        
        // Transform button presentation for safe insertion handling
        actionBtn.innerText = "Save";
        actionBtn.className = "btn btn-success rounded-3 px-4 fw-bold";
        
        customerId.disabled = true; 
        clearFields();

        try {
            const response = await fetch(`${API_BASE_URL}/new-id`);
            if (response.ok) {
                const data = await response.json();
                customerId.value = data.nextId;
            }
        } catch (err) {
            console.error("Error retrieving auto-increment value sequences:", err);
        }
        idExistsInDB = false; 
        captureSnapshot();
    } else {
        toggleFind.classList.add("active");
        toggleNew.classList.remove("active");
        
        // Transform button presentation back into update edit configuration parameters
        actionBtn.innerText = "Update";
        actionBtn.className = "btn btn-warning rounded-3 px-4 fw-bold text-dark";
        
        customerId.disabled = false;
        customerId.value = "";
        clearFields();
        idExistsInDB = false;
        captureSnapshot();
    }
}

// Button click state changes
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

// Real-time character blocking filter for the phone number field
customerPhone.addEventListener("input", () => {
    const rawValue = customerPhone.value;
    
    // Checks if any non-numeric characters were entered
    if (/[^0-9]/.test(rawValue)) {
        // Strip away non-numeric characters instantly
        customerPhone.value = rawValue.replace(/[^0-9]/g, "");
        
        // RENDER AND UNHIDE inline warning box
        phoneFeedback.innerText = "Please enter digits only.";
        phoneFeedback.style.display = "block";
    } else {
        phoneFeedback.innerText = "";
        phoneFeedback.style.display = "none";
    }
});

// Live validation loop checking input existence records dynamically on type key event
customerId.addEventListener("input", async () => {
    if (activeMode === "NEW") return; 

    const id = customerId.value.trim();
    if (!id) { clearFields(); captureSnapshot(); resetInlineFeedback(); idExistsInDB = false; return; }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        
        if (!response.ok) { 
            clearFields(); 
            captureSnapshot(); 
            dbFeedback.innerText = `Customer ID "${id}" does not exist.`;
            dbFeedback.style.display = "block";
            idExistsInDB = false;
            return; 
        }

        resetInlineFeedback();
        const data = await response.json();
        customerName.value = data.customerName || "";
        customerAddress.value = data.customerAddress || "";
        customerPhone.value = data.customerPhone || "";
        idExistsInDB = true; 
        captureSnapshot();
    } catch (err) {
        console.error(err);
    }
});

// UNIFIED BUTTON DELEGATOR (Fires PUT or POST actions gracefully depending on active state parameters)
actionBtn.addEventListener("click", async () => {
    if (!customerName.value.trim()) {
        Swal.fire({ icon: "error", title: "Missing Fields", text: "Full Name is required.", confirmButtonColor: "#5b2e8a" });
        return;
    }

    if (customerPhone.value.trim() !== "" && customerPhone.value.trim().length !== 10) {
        Swal.fire({ icon: "error", title: "Invalid Data Parameter", text: "Phone records must contain exactly 10 digits.", confirmButtonColor: "#5b2e8a" });
        return;
    }

    // HANDLER FOR UPDATE ROUTE
    if (activeMode === "FIND") {
        const id = customerId.value.trim();
        if (!id) { Swal.fire({ icon: "error", title: "ID Missing", text: "Provide a valid target Customer ID to edit.", confirmButtonColor: "#5b2e8a" }); return; }

        try {
            const checkResp = await fetch(`${API_BASE_URL}/${id}`);
            if (!checkResp.ok) {
                Swal.fire({ icon: "error", title: "Operation Denied", text: "Cannot update. Customer ID does not exist in the database.", confirmButtonColor: "#5b2e8a" });
                return;
            }
        } catch(e) { return; }

        if (!dataIsMutated()) {
            Swal.fire({ icon: "info", title: "No Changes Detected", text: "Please enter new changes before clicking Update.", confirmButtonColor: "#5b2e8a" });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: customerName.value.trim(),
                    customerAddress: customerAddress.value.trim(),
                    customerPhone: customerPhone.value.trim()
                })
            });
            const data = await response.json();
            Swal.fire({ icon: "success", title: data.message || "Customer Updated Successfully", timer: 1500, showConfirmButton: false });
            captureSnapshot();
        } catch (err) { console.error(err); }

    // HANDLER FOR SAVE ROUTE
    } else {
        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: customerName.value.trim(),
                    customerAddress: customerAddress.value.trim(),
                    customerPhone: customerPhone.value.trim()
                })
            });
            const data = await response.json();
            Swal.fire({ icon: "success", title: data.message || "Customer Registered Successfully", timer: 1500, showConfirmButton: false });
            clearFields();
            setFormMode("FIND");
        } catch (err) { console.error(err); }
    }
});

// Guardrail checking modifications safety boundaries
async function verifyNavigationSafety() {
    if (dataIsMutated() && customerName.value.trim() !== "") {
        const check = await Swal.fire({
            title: "Changes Won't Be Saved",
            text: "You have unsaved changes. Do you want to discard them and navigate?",
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
        Swal.fire({ icon: "info", title: "End of List", text: "You are currently at the newest entry boundary link.", confirmButtonColor: "#5b2e8a" });
        return;
    }

    let id = customerId.value.trim();
    if (!id) id = 0;

    try {
        const response = await fetch(`${API_BASE_URL}/next/${id}`);
        if (!response.ok) { Swal.fire({ icon: "info", title: "End of List", text: "End of list reached.", confirmButtonColor: "#5b2e8a" }); return; }

        const data = await response.json();
        setFormMode("FIND");
        customerId.value = data.customerId;
        customerName.value = data.customerName || "";
        customerAddress.value = data.customerAddress || "";
        customerPhone.value = data.customerPhone || "";
        captureSnapshot();
    } catch (err) { console.error(err); }
});

// PREVIOUS
document.getElementById("previous-btn").addEventListener("click", async () => {
    const isSafe = await verifyNavigationSafety();
    if (!isSafe) return;

    let id = customerId.value.trim();
    let searchId = id;

    try {
        const response = await fetch(`${API_BASE_URL}/previous/${searchId}`);
        if (!response.ok) { 
            Swal.fire({ icon: "info", title: "Beginning of List", text: "Beginning of list reached.", confirmButtonColor: "#5b2e8a" }); 
            return; 
        }

        const data = await response.json();
        await setFormMode("FIND"); 
        
        customerId.value = data.customerId;
        customerName.value = data.customerName || "";
        customerAddress.value = data.customerAddress || "";
        customerPhone.value = data.customerPhone || "";
        captureSnapshot();
    } catch (err) { console.error(err); }
});